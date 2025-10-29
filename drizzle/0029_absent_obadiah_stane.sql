ALTER TABLE `journals` ADD `pdfUrl` text;--> statement-breakpoint
ALTER TABLE `journals` ADD `viewCount` int DEFAULT 0 NOT NULL;