CREATE TABLE `journals` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(255) NOT NULL,
	`slug` varchar(255) NOT NULL,
	`content` text NOT NULL,
	`excerpt` text,
	`thumbnailUrl` text,
	`category` varchar(100),
	`authorId` int NOT NULL,
	`isPublished` int NOT NULL DEFAULT 0,
	`publishedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `journals_id` PRIMARY KEY(`id`),
	CONSTRAINT `journals_slug_unique` UNIQUE(`slug`)
);
