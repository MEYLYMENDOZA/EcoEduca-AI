-- AlterTable
ALTER TABLE "topics" ADD COLUMN     "contentUpdatedAt" TIMESTAMP(3),
ADD COLUMN     "generatedByAI" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "sourceFileName" TEXT;
