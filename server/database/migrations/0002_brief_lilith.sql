CREATE TABLE `files` (
	`id` integer PRIMARY KEY NOT NULL,
	`name` text,
	`path` text,
	`text` text,
	`tokens` integer,
	`created_at` integer NOT NULL,
	`thread_id` integer NOT NULL
);
