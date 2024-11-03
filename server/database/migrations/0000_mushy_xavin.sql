CREATE TABLE `messages` (
	`id` integer PRIMARY KEY NOT NULL,
	`content` text,
	`role` text,
	`created_at` integer NOT NULL,
	`thread_id` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `threads` (
	`id` integer PRIMARY KEY NOT NULL,
	`name` text,
	`system_message` text,
	`created_at` integer NOT NULL
);
