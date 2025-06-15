/*
  Warnings:

  - You are about to drop the column `isPaid` on the `splits` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "splits" DROP COLUMN "isPaid",
ADD COLUMN     "paid" BOOLEAN NOT NULL DEFAULT false;
