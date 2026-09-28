import { mkdirSync } from "node:fs";
import { dirname } from "node:path";
import Database from "better-sqlite3";
import { asc, eq, not } from "drizzle-orm";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import { type Deadline, courses, deadlines } from "./schema";

// In production fly.toml points DATABASE_PATH at the volume (/data), which is
// how state survives a reload, a restart and a redeploy.
const path = process.env.DATABASE_PATH ?? "./.data/app.db";
mkdirSync(dirname(path), { recursive: true });

const client = new Database(path);
client.pragma("journal_mode = WAL");
client.pragma("foreign_keys = ON");

export const db = drizzle(client);

// Migrations run at boot, on whatever machine holds the volume.
migrate(db, { migrationsFolder: "./drizzle" });

export type BoardItem = Deadline & { course: string };

export function listDeadlines(course?: string): BoardItem[] {
  const query = db
    .select({
      id: deadlines.id,
      courseId: deadlines.courseId,
      title: deadlines.title,
      dueAt: deadlines.dueAt,
      weight: deadlines.weight,
      done: deadlines.done,
      createdAt: deadlines.createdAt,
      course: courses.code,
    })
    .from(deadlines)
    .innerJoin(courses, eq(deadlines.courseId, courses.id));
  return (course ? query.where(eq(courses.code, course)) : query)
    .orderBy(asc(deadlines.dueAt), asc(deadlines.id))
    .all();
}

export function listCourses(): string[] {
  return db
    .select({ code: courses.code })
    .from(courses)
    .orderBy(asc(courses.code))
    .all()
    .map((c) => c.code);
}

export const COURSE_CODE = /^[A-Z]{4}\d{4}$/;
const DUE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/;

export type NewDeadline = { course: string; title: string; due: string; weight: string };

// Returns an error message for the form, or null once the row is stored.
export function addDeadline(input: NewDeadline): string | null {
  const code = input.course.trim().toUpperCase().replace(/\s+/g, "");
  const title = input.title.trim();
  const due = input.due.trim();
  const weightText = input.weight.trim();
  const weight = weightText === "" ? null : Number(weightText);

  if (!COURSE_CODE.test(code)) return "Course code should look like COMP4020: four letters, four digits.";
  if (!title) return "Give the deadline a name.";
  if (title.length > 200) return "Keep the name under 200 characters.";
  if (!DUE.test(due) || Number.isNaN(Date.parse(`${due}:00Z`))) return "Pick a due date and time.";
  if (weight !== null && !(Number.isInteger(weight) && weight >= 0 && weight <= 100))
    return "Weight is a whole percentage from 0 to 100, or blank.";

  db.transaction((tx) => {
    tx.insert(courses).values({ code }).onConflictDoNothing().run();
    const course = tx.select().from(courses).where(eq(courses.code, code)).get();
    if (!course) throw new Error(`course ${code} missing after insert`);
    tx.insert(deadlines).values({ courseId: course.id, title, dueAt: due, weight }).run();
  });
  return null;
}

export function toggleDeadline(id: number): boolean {
  return db.update(deadlines).set({ done: not(deadlines.done) }).where(eq(deadlines.id, id)).run().changes > 0;
}

export function deleteDeadline(id: number): boolean {
  return db.delete(deadlines).where(eq(deadlines.id, id)).run().changes > 0;
}
