-- AlterTable
ALTER TABLE "quizzes" ADD COLUMN     "explanation" TEXT;

-- AlterTable
ALTER TABLE "topics" ADD COLUMN     "order" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "weekLabel" TEXT;
