/*
  Warnings:

  - Added the required column `updated_at` to the `enrollments` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `enrollments` ADD COLUMN `updated_at` DATETIME(3) NOT NULL;

-- AlterTable
ALTER TABLE `subjects` ADD COLUMN `category` VARCHAR(191) NOT NULL DEFAULT 'Uncategorized',
    ADD COLUMN `currency` VARCHAR(191) NOT NULL DEFAULT 'USD',
    ADD COLUMN `price` DOUBLE NOT NULL DEFAULT 0,
    ADD COLUMN `thumbnail` TEXT NULL;
