ALTER TABLE `users` ADD `membershipType` enum('annual','lifetime');--> statement-breakpoint
ALTER TABLE `users` ADD `membershipStartDate` timestamp;--> statement-breakpoint
ALTER TABLE `users` ADD `membershipExpiryDate` timestamp;--> statement-breakpoint
ALTER TABLE `users` ADD `membershipRenewedAt` timestamp;