CREATE TABLE `badges` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(100) NOT NULL,
	`description` text NOT NULL,
	`icon` varchar(50) NOT NULL,
	`price` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `badges_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `pointTransactions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`amount` int NOT NULL,
	`reason` varchar(255) NOT NULL,
	`referenceId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `pointTransactions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `userBadges` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`badgeId` int NOT NULL,
	`purchasedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `userBadges_id` PRIMARY KEY(`id`)
);
