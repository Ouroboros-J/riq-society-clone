CREATE TABLE `aiSettings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`platform` varchar(50) NOT NULL,
	`apiKey` text,
	`selectedModel` varchar(100),
	`isEnabled` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `aiSettings_id` PRIMARY KEY(`id`),
	CONSTRAINT `aiSettings_platform_unique` UNIQUE(`platform`)
);
--> statement-breakpoint
CREATE TABLE `aiVerifications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`applicationId` int NOT NULL,
	`platform` varchar(50) NOT NULL,
	`model` varchar(100) NOT NULL,
	`result` enum('approved','rejected','uncertain') NOT NULL,
	`reasoning` text,
	`confidence` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `aiVerifications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `recognizedTests` (
	`id` int AUTO_INCREMENT NOT NULL,
	`category` varchar(100) NOT NULL,
	`testName` varchar(255) NOT NULL,
	`description` text,
	`requiredScore` varchar(100),
	`displayOrder` int NOT NULL DEFAULT 0,
	`isActive` int NOT NULL DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `recognizedTests_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `systemSettings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`settingKey` varchar(100) NOT NULL,
	`settingValue` text,
	`description` text,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `systemSettings_id` PRIMARY KEY(`id`),
	CONSTRAINT `systemSettings_settingKey_unique` UNIQUE(`settingKey`)
);
--> statement-breakpoint
ALTER TABLE `applications` ADD `isOtherTest` int DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `applications` ADD `otherTestName` varchar(255);