PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_files` (
	`id` integer PRIMARY KEY NOT NULL,
	`name` text,
	`path` text,
	`text` text,
	`tokens` integer,
	`created_at` integer NOT NULL,
	`thread_id` integer NOT NULL,
	`user_id` integer,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_files`("id", "name", "path", "text", "tokens", "created_at", "thread_id", "user_id") SELECT "id", "name", "path", "text", "tokens", "created_at", "thread_id", "user_id" FROM `files`;--> statement-breakpoint
DROP TABLE `files`;--> statement-breakpoint
ALTER TABLE `__new_files` RENAME TO `files`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE TABLE `__new_messages` (
	`id` integer PRIMARY KEY NOT NULL,
	`content` text,
	`role` text,
	`created_at` integer NOT NULL,
	`thread_id` integer NOT NULL,
	`user_id` integer,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_messages`("id", "content", "role", "created_at", "thread_id", "user_id") SELECT "id", "content", "role", "created_at", "thread_id", "user_id" FROM `messages`;--> statement-breakpoint
DROP TABLE `messages`;--> statement-breakpoint
ALTER TABLE `__new_messages` RENAME TO `messages`;--> statement-breakpoint
CREATE TABLE `__new_threads` (
	`id` integer PRIMARY KEY NOT NULL,
	`name` text,
	`system_message` text,
	`created_at` integer NOT NULL,
	`temperature` real DEFAULT 0.5,
	`model` text DEFAULT 'claude-3-5-sonnet-20241022',
	`max_tokens` integer DEFAULT 1024,
	`user_id` integer,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_threads`("id", "name", "system_message", "created_at", "temperature", "model", "max_tokens", "user_id") SELECT "id", "name", "system_message", "created_at", "temperature", "model", "max_tokens", "user_id" FROM `threads`;--> statement-breakpoint
DROP TABLE `threads`;--> statement-breakpoint
ALTER TABLE `__new_threads` RENAME TO `threads`;--> statement-breakpoint
ALTER TABLE `logs` ADD `users_id` integer REFERENCES users(id);