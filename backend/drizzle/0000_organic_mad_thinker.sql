CREATE TABLE `vehicles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`placa` varchar(10) NOT NULL,
	`marca` varchar(100) NOT NULL,
	`modelo` varchar(100) NOT NULL,
	`ano` int NOT NULL,
	`cor` varchar(50) NOT NULL,
	`status` enum('ativo','inativo') NOT NULL DEFAULT 'ativo',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `vehicles_id` PRIMARY KEY(`id`),
	CONSTRAINT `vehicles_placa_unique` UNIQUE(`placa`)
);
