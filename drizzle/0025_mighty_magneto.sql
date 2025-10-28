ALTER TABLE `aiSettings` RENAME COLUMN `platform` TO `provider`;--> statement-breakpoint
ALTER TABLE `aiSettings` DROP INDEX `aiSettings_platform_unique`;--> statement-breakpoint
ALTER TABLE `aiSettings` ADD `modelId` varchar(200) NOT NULL;--> statement-breakpoint
ALTER TABLE `aiSettings` ADD `modelName` varchar(200) NOT NULL;--> statement-breakpoint
ALTER TABLE `aiSettings` ADD `role` enum('verifier','summarizer') NOT NULL;--> statement-breakpoint
ALTER TABLE `aiSettings` ADD CONSTRAINT `aiSettings_provider_unique` UNIQUE(`provider`);--> statement-breakpoint
ALTER TABLE `aiSettings` DROP COLUMN `apiKey`;--> statement-breakpoint
ALTER TABLE `aiSettings` DROP COLUMN `selectedModel`;