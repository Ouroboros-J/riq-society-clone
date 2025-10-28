ALTER TABLE `applications` ADD `aiVerificationResult` text;--> statement-breakpoint
ALTER TABLE `applications` ADD `aiVerificationStatus` enum('pending','verified','failed') DEFAULT 'pending';--> statement-breakpoint
ALTER TABLE `applications` ADD `aiVerifiedAt` timestamp;