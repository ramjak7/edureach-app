-- AlterTable
ALTER TABLE "content_objects" ADD COLUMN     "correct_option_id" VARCHAR(1),
ADD COLUMN     "explanation" TEXT,
ADD COLUMN     "options" JSONB,
ADD COLUMN     "question_text" TEXT,
ALTER COLUMN "s3_url" DROP NOT NULL;
