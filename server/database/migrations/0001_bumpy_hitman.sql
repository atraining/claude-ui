CREATE TABLE `logs` (
	`id` integer PRIMARY KEY NOT NULL,
	`input_tokens` integer DEFAULT 0,
	`output_tokens` integer DEFAULT 0,
	`cache_creation_input_tokens` integer DEFAULT 0,
	`cache_read_input_tokens` integer DEFAULT 0,
	`created_at` integer NOT NULL
);
