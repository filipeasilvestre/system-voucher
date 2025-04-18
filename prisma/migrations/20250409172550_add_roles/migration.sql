/*
  Warnings:

  - Added the required column `status` to the `Voucher` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Voucher" ADD COLUMN     "amount" DOUBLE PRECISION,
ADD COLUMN     "currency" TEXT,
ADD COLUMN     "redemptions" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "status" TEXT NOT NULL,
ADD COLUMN     "totalRedemptions" INTEGER NOT NULL DEFAULT 0,
ALTER COLUMN "qrCode" DROP NOT NULL;
