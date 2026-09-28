import { spawn } from "node:child_process";
import { mkdtempSync } from "node:fs";
import { type AddressInfo, createServer } from "node:net";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { JSDOM } from "jsdom";
import { describe, expect, inject, it } from "vitest";

// The crit 7 contract, driven over HTTP against the built server: a deadline
// you add is still there after a reload (and after the server restarts on the
// same database), ticking it off persists, the board is ordered by due time,
// and each open deadline says how urgent it is.
const baseUrl = inject("baseUrl");

const unique = (label: string) => `${label} ${process.hrtime.bigint()}`;

// datetime-local value for "now + hours", in Canberra wall time — the same
// clock the board reads deadlines on.
function canberraIn(hours: number): string {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-CA", {
      timeZone: "Australia/Canberra",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    })
      .formatToParts(new Date())
      .map((p) => [p.type, p.value]),
  );
  const wall = Date.UTC(+parts.year, +parts.month - 1, +parts.day, +parts.hour, +parts.minute);
  return new Date(wall + hours * 3_600_000).toISOString().slice(0, 16);
}

// Astro refuses form POSTs without a same-origin Origin header (CSRF).
const post = (base: string, path: string, fields: Record<string, string>) =>
  fetch(new URL(path, base), {
    method: "POST",
    headers: { origin: base },
    body: new URLSearchParams(fields),
    redirect: "manual",
  });

const addDeadline = (base: string, fields: Record<string, string>) =>
  post(base, "/api/deadlines", { course: "COMP4020", weight: "10", ...fields });

async function board(base = baseUrl): Promise<Document> {
  const res = await fetch(new URL("/", base));
  expect(res.status).toBe(200);
  return new JSDOM(await res.text()).window.document;
}

const findDeadline = (doc: Document, title: string) =>
  [...doc.querySelectorAll<HTMLElement>("[data-deadline]")].find((el) =>
    el.textContent?.includes(title),
  );

describe("a deadline you add", () => {
  it("redirects back to the board, and is on it after a reload", async () => {
    const title = unique("Crit 7 prototype");
    const res = await addDeadline(baseUrl, { title, due: canberraIn(48) });
    expect(res.status).toBe(303);

    const item = findDeadline(await board(), title);
    expect(item).toBeDefined();
    expect(item?.textContent).toContain("COMP4020");
    expect(item?.textContent).toContain("10%");
  });

  it("survives the server restarting on the same database", async () => {
    const dbPath = join(mkdtempSync(join(tmpdir(), "restart-db-")), "app.db");
    const title = unique("Survives restart");

    const first = await bootServer(dbPath);
    try {
      expect((await addDeadline(first.url, { title, due: canberraIn(24 * 10) })).status).toBe(303);
    } finally {
      await first.stop();
    }

    const second = await bootServer(dbPath);
    try {
      expect(findDeadline(await board(second.url), title)).toBeDefined();
    } finally {
      await second.stop();
    }
  }, 20_000);

  it("is refused, and not stored, when the course code isn't an ANU code", async () => {
    const title = unique("Bad course");
    const res = await addDeadline(baseUrl, { title, course: "not a course", due: canberraIn(5) });
    expect(res.status).toBe(303);
    expect(res.headers.get("location")).toContain("error");
    expect(findDeadline(await board(), title)).toBeUndefined();
  });
});

describe("ticking a deadline off", () => {
  it("persists across a reload, and it no longer counts as open", async () => {
    const title = unique("Tick me off");
    await addDeadline(baseUrl, { title, due: canberraIn(30) });
    const id = findDeadline(await board(), title)?.dataset.deadline;
    expect(id).toBeDefined();

    const res = await post(baseUrl, `/api/deadlines/${id}/toggle`, {});
    expect(res.status).toBe(303);

    const item = findDeadline(await board(), title);
    expect(item?.dataset.state).toBe("done");

    await post(baseUrl, `/api/deadlines/${id}/toggle`, {});
    expect(findDeadline(await board(), title)?.dataset.state).toBe("open");
  });
});

describe("the board", () => {
  it("lists open deadlines soonest first, whatever order they were added in", async () => {
    const later = unique("Later one");
    const sooner = unique("Sooner one");
    await addDeadline(baseUrl, { title: later, due: canberraIn(24 * 20) });
    await addDeadline(baseUrl, { title: sooner, due: canberraIn(24 * 19) });

    const titles = [...(await board()).querySelectorAll("[data-deadline][data-state=open]")].map(
      (el) => el.textContent ?? "",
    );
    const at = (t: string) => titles.findIndex((text) => text.includes(t));
    expect(at(sooner)).toBeGreaterThanOrEqual(0);
    expect(at(sooner)).toBeLessThan(at(later));
  });

  it("says how urgent each open deadline is", async () => {
    const overdue = unique("Already late");
    const today = unique("Due today");
    const week = unique("Due this week");
    await addDeadline(baseUrl, { title: overdue, due: "2020-03-01T09:00" });
    await addDeadline(baseUrl, { title: today, due: canberraIn(3) });
    await addDeadline(baseUrl, { title: week, due: canberraIn(24 * 5) });

    const doc = await board();
    expect(findDeadline(doc, overdue)?.textContent).toMatch(/overdue/i);
    expect(findDeadline(doc, today)?.textContent).toMatch(/within 24 hours/i);
    expect(findDeadline(doc, week)?.textContent).toMatch(/within a week/i);
  });
});

// Spec line 1: the app loads at its fly.dev URL. Only runs when pointed at
// the live app: APP_URL=https://comp4020-crit7-peacefulmind43.fly.dev pnpm test
describe.runIf(process.env.APP_URL)("the deployed app", () => {
  it("serves the board at its fly.dev URL", async () => {
    const res = await fetch(process.env.APP_URL as string);
    expect(res.status).toBe(200);
    expect(await res.text()).toContain("data-board");
  }, 30_000);
});

async function bootServer(dbPath: string): Promise<{ url: string; stop: () => Promise<void> }> {
  const port = await new Promise<number>((resolve) => {
    const probe = createServer();
    probe.listen(0, () => {
      const { port } = probe.address() as AddressInfo;
      probe.close(() => resolve(port));
    });
  });
  const { NODE_PATH: _, ...env } = process.env;
  const child = spawn("node", ["./dist/server/entry.mjs"], {
    env: { ...env, HOST: "127.0.0.1", PORT: String(port), DATABASE_PATH: dbPath },
    stdio: "ignore",
  });
  const url = `http://127.0.0.1:${port}`;
  for (let attempt = 0; ; attempt++) {
    try {
      if ((await fetch(url)).ok) break;
    } catch {
      // not up yet
    }
    if (attempt >= 50) {
      child.kill();
      throw new Error(`server did not come up at ${url}`);
    }
    await new Promise((r) => setTimeout(r, 100));
  }
  const stop = () =>
    new Promise<void>((resolve) => {
      child.once("exit", () => resolve());
      child.kill();
    });
  return { url, stop };
}
