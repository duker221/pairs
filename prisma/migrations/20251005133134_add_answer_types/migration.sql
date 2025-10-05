/*
  Warnings:

  - You are about to drop the column `realtionType` on the `Couple` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "AnswerType" AS ENUM ('TEXT', 'SCALE', 'CHOICE', 'YESNO');

-- AlterTable
ALTER TABLE "Couple" DROP COLUMN "realtionType",
ADD COLUMN     "relationType" "RelationType" NOT NULL DEFAULT 'DATING';

-- AlterTable
ALTER TABLE "Question" ADD COLUMN     "answerType" "AnswerType" NOT NULL DEFAULT 'TEXT',
ADD COLUMN     "options" TEXT;

-- CreateTable
CREATE TABLE "Answer" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "coupleQuestionId" INTEGER NOT NULL,
    "textValue" TEXT,
    "scaleValue" INTEGER,
    "choiceValue" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Answer_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Answer_coupleQuestionId_idx" ON "Answer"("coupleQuestionId");

-- CreateIndex
CREATE UNIQUE INDEX "Answer_userId_coupleQuestionId_key" ON "Answer"("userId", "coupleQuestionId");

-- AddForeignKey
ALTER TABLE "Answer" ADD CONSTRAINT "Answer_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Answer" ADD CONSTRAINT "Answer_coupleQuestionId_fkey" FOREIGN KEY ("coupleQuestionId") REFERENCES "CoupleQuestion"("id") ON DELETE CASCADE ON UPDATE CASCADE;
