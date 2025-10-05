-- CreateEnum
CREATE TYPE "Category" AS ENUM ('GENERAL', 'INTIMACY', 'COMMUNICATION', 'GOALS', 'FUN', 'DEEP');

-- CreateTable
CREATE TABLE "Question" (
    "id" SERIAL NOT NULL,
    "text" TEXT NOT NULL,
    "category" "Category" NOT NULL DEFAULT 'GENERAL',
    "isActive" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Question_pkey" PRIMARY KEY ("id")
);
