ALTER TABLE `knowledge_files` ADD `content` text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `knowledge_files` ADD `updated_at` text NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX `knowledge_files_filename_unique` ON `knowledge_files` (`filename`);