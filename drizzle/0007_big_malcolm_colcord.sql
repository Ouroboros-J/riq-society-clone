ALTER TABLE `users` ADD `paymentStatus` enum('pending','deposit_requested','confirmed') DEFAULT 'pending' NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `depositorName` varchar(100);--> statement-breakpoint
ALTER TABLE `users` ADD `depositDate` varchar(50);