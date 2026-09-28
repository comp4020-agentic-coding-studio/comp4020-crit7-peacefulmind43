CREATE TABLE `courses` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`code` text NOT NULL,
	CONSTRAINT "course_code_shape" CHECK("courses"."code" GLOB '[A-Z][A-Z][A-Z][A-Z][0-9][0-9][0-9][0-9]')
);
--> statement-breakpoint
CREATE UNIQUE INDEX `courses_code_unique` ON `courses` (`code`);--> statement-breakpoint
CREATE TABLE `deadlines` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`course_id` integer NOT NULL,
	`title` text NOT NULL,
	`due_at` text NOT NULL,
	`weight` integer,
	`done` integer DEFAULT false NOT NULL,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	FOREIGN KEY (`course_id`) REFERENCES `courses`(`id`) ON UPDATE no action ON DELETE cascade,
	CONSTRAINT "deadline_weight_range" CHECK("deadlines"."weight" IS NULL OR ("deadlines"."weight" BETWEEN 0 AND 100))
);
--> statement-breakpoint
CREATE INDEX `deadlines_due_at_idx` ON `deadlines` (`due_at`);