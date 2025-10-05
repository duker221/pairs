-- CreateTable
CREATE TABLE "CoupleQuestion" (
    "id" SERIAL NOT NULL,
    "coupleId" INTEGER NOT NULL,
    "questionId" INTEGER NOT NULL,
    "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CoupleQuestion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CoupleQuestion_coupleId_sentAt_idx" ON "CoupleQuestion"("coupleId", "sentAt");

-- CreateIndex
CREATE UNIQUE INDEX "CoupleQuestion_coupleId_questionId_key" ON "CoupleQuestion"("coupleId", "questionId");

-- AddForeignKey
ALTER TABLE "CoupleQuestion" ADD CONSTRAINT "CoupleQuestion_coupleId_fkey" FOREIGN KEY ("coupleId") REFERENCES "Couple"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CoupleQuestion" ADD CONSTRAINT "CoupleQuestion_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE CASCADE ON UPDATE CASCADE;
