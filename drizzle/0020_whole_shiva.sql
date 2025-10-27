CREATE TABLE `applicationReviews` (
	`id` int AUTO_INCREMENT NOT NULL,
	`applicationId` int NOT NULL,
	`requestReason` text NOT NULL,
	`additionalDocuments` text,
	`status` enum('pending','approved','rejected') NOT NULL DEFAULT 'pending',
	`reviewedBy` int,
	`reviewedAt` timestamp,
	`adminNotes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `applicationReviews_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `applications` ADD `reviewRequestCount` int DEFAULT 0 NOT NULL;