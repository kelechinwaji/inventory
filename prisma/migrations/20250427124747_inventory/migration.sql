/*
  Warnings:

  - Changed the type of `expiry` on the `Inventory` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "Inventory" DROP COLUMN "expiry",
ADD COLUMN     "expiry" TIMESTAMP(3) NOT NULL;
