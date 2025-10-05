-- CreateEnum
CREATE TYPE "RelationType" AS ENUM ('DATING', 'MARRIED', 'ENGAGED');

-- AlterTable
ALTER TABLE "Couple" ADD COLUMN     "realtionType" "RelationType" NOT NULL DEFAULT 'DATING';
