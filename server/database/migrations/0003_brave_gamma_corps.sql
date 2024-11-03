CREATE TABLE `threads` (
	`id` integer PRIMARY KEY NOT NULL,
	`name` text,
	`system_message` text,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_messages` (
	`id` integer PRIMARY KEY NOT NULL,
	`content` text,
	`role` text,
	`created_at` integer NOT NULL,
	`thread_id` integer NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_messages`("id", "content", "role", "created_at", "thread_id") SELECT "id", "content", "role", "created_at", "thread_id" FROM `messages`;--> statement-breakpoint
DROP TABLE `messages`;--> statement-breakpoint
ALTER TABLE `__new_messages` RENAME TO `messages`;--> statement-breakpoint
PRAGMA foreign_keys=ON;