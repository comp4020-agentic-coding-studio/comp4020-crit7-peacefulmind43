import { sql } from "drizzle-orm";
import { check, index, int, sqliteTable, text } from "drizzle-orm/sqlite-core";

// The schema is the ground truth for the database. To change it: edit here,
// run `pnpm db:generate` to turn the diff into a migration under drizzle/,
// and commit both — the migration applies automatically when the server
// boots (see src/lib/db.ts). Never edit the database by hand.

export const courses = sqliteTable(
  "courses",
  {
    id: int().primaryKey({ autoIncrement: true }),
    code: text().notNull().unique(),
  },
  (t) => [check("course_code_shape", sql`${t.code} GLOB '[A-Z][A-Z][A-Z][A-Z][0-9][0-9][0-9][0-9]'`)],
);

// dueAt is Canberra wall time as "YYYY-MM-DDTHH:MM": every ANU deadline is
// published on that clock, and the string sorts in time order.
export const deadlines = sqliteTable(
  "deadlines",
  {
    id: int().primaryKey({ autoIncrement: true }),
    courseId: int("course_id")
      .notNull()
      .references(() => courses.id, { onDelete: "cascade" }),
    title: text().notNull(),
    dueAt: text("due_at").notNull(),
    weight: int(),
    done: int({ mode: "boolean" }).notNull().default(false),
    createdAt: text("created_at")
      .notNull()
      .default(sql`(datetime('now'))`),
  },
  (t) => [
    index("deadlines_due_at_idx").on(t.dueAt),
    check("deadline_weight_range", sql`${t.weight} IS NULL OR (${t.weight} BETWEEN 0 AND 100)`),
  ],
);

export type Course = typeof courses.$inferSelect;
export type Deadline = typeof deadlines.$inferSelect;
