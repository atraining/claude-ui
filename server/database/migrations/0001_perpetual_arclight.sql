ALTER TABLE `threads` ADD `model` text DEFAULT 'claude-3-5-sonnet-20241022';--> statement-breakpoint
ALTER TABLE `threads` ADD `max_tokens` integer DEFAULT 1024;