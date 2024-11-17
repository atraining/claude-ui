CREATE TABLE `files` (
	`id` integer PRIMARY KEY NOT NULL,
	`name` text,
	`path` text,
	`text` text,
	`tokens` integer,
	`created_at` integer NOT NULL,
	`thread_id` integer NOT NULL,
	`user_id` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `messages` (
	`id` integer PRIMARY KEY NOT NULL,
	`content` text,
	`role` text,
	`created_at` integer NOT NULL,
	`thread_id` integer NOT NULL,
	`user_id` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `threads` (
	`id` integer PRIMARY KEY NOT NULL,
	`name` text,
	`system_message` text,
	`created_at` integer NOT NULL,
	`temperature` real DEFAULT 0.5,
	`model` text DEFAULT 'claude-3-5-sonnet-20241022',
	`max_tokens` integer DEFAULT 1024,
	`user_id` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` integer PRIMARY KEY NOT NULL,
	`name` text,
	`email` text,
	`password` text,
	`created_at` integer NOT NULL
);
