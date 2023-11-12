/*
  Warnings:

  - Added the required column `author_id` to the `Message` table without a default value. This is not possible if the table is not empty.
  - Added the required column `receiver_id` to the `Message` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Message` ADD COLUMN `author_id` VARCHAR(191) NOT NULL,
    ADD COLUMN `receiver_id` VARCHAR(191) NOT NULL;
