import { JSDOM } from "jsdom";
import { describe, expect, inject, it } from "vitest";
import { ROUTES } from "./routes";

// Every image and stylesheet a covered page references must actually load.
// A 200 on the page says nothing about them: the README screenshot once went
// through Astro's /_image optimiser, which 500s without sharp in production.
const baseUrl = inject("baseUrl");

describe.each(ROUTES)("assets on %s", (route) => {
  it("all load", async () => {
    const pageUrl = new URL(route, baseUrl);
    const doc = new JSDOM(await (await fetch(pageUrl)).text()).window.document;
    const refs = [
      ...[...doc.querySelectorAll("img[src]")].map((el) => el.getAttribute("src") ?? ""),
      ...[...doc.querySelectorAll('link[rel="stylesheet"][href]')].map((el) => el.getAttribute("href") ?? ""),
    ];
    for (const ref of refs) {
      const res = await fetch(new URL(ref, pageUrl));
      expect(res.status, ref).toBe(200);
    }
  });
});
