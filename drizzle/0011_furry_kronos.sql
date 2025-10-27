ALTER TABLE `applications` ADD `paymentStatus` enum('pending','deposit_requested','confirmed') DEFAULT 'pending' NOT NULL;--> statement-breakpoint
ALTER TABLE `applications` ADD `depositorName` varchar(100);--> statement-breakpoint
ALTER TABLE `applications` ADD `depositDate` varchar(50);--> statement-breakpoint
ALTER TABLE `applications` ADD `paymentConfirmedAt` timestamp;