/*
  Warnings:

  - You are about to drop the column `residence` on the `User` table. All the data in the column will be lost.
  - Added the required column `address` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `companyLogo` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fatNumber` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `postalCode` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `state` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "residence",
ADD COLUMN     "address" TEXT NOT NULL,
ADD COLUMN     "companyLogo" TEXT NOT NULL,
ADD COLUMN     "fatNumber" TEXT NOT NULL,
ADD COLUMN     "postalCode" TEXT NOT NULL,
ADD COLUMN     "state" TEXT NOT NULL;
