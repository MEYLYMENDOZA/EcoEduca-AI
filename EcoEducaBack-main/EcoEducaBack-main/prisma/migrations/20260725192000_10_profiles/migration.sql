-- AlterEnum: Replace old AccessProfile values with new 10-profile system
-- This migration converts existing data from 4 profiles to 10 profiles

-- Step 1: Create new enum type
CREATE TYPE "AccessProfile_new" AS ENUM ('STANDARD', 'VISUAL', 'AUDITORY', 'MOTOR', 'DYSLEXIA', 'ADHD', 'AUTISM', 'ADVANCED', 'LANGUAGE', 'NIGHT');

-- Step 2: Update users table
ALTER TABLE "users" ALTER COLUMN "accessProfile" DROP DEFAULT;
ALTER TABLE "users" ALTER COLUMN "accessProfile" TYPE "AccessProfile_new" USING (
  CASE "accessProfile"
    WHEN 'AUDITORY' THEN 'AUDITORY'::text::"AccessProfile_new"
    WHEN 'READING_DEAF' THEN 'VISUAL'::text::"AccessProfile_new"
    WHEN 'GUIDED_MOTOR' THEN 'MOTOR'::text::"AccessProfile_new"
    WHEN 'STANDARD' THEN 'STANDARD'::text::"AccessProfile_new"
    ELSE 'STANDARD'::text::"AccessProfile_new"
  END
);
ALTER TABLE "users" ALTER COLUMN "accessProfile" SET DEFAULT 'STANDARD';

-- Step 3: Update quiz_responses table
ALTER TABLE "quiz_responses" ALTER COLUMN "modeUsed" TYPE "AccessProfile_new" USING (
  CASE "modeUsed"
    WHEN 'AUDITORY' THEN 'AUDITORY'::text::"AccessProfile_new"
    WHEN 'READING_DEAF' THEN 'VISUAL'::text::"AccessProfile_new"
    WHEN 'GUIDED_MOTOR' THEN 'MOTOR'::text::"AccessProfile_new"
    WHEN 'STANDARD' THEN 'STANDARD'::text::"AccessProfile_new"
    ELSE 'STANDARD'::text::"AccessProfile_new"
  END
);

-- Step 4: Update ai_cache table
ALTER TABLE "ai_cache" ALTER COLUMN "profileType" TYPE "AccessProfile_new" USING (
  CASE "profileType"
    WHEN 'AUDITORY' THEN 'AUDITORY'::text::"AccessProfile_new"
    WHEN 'READING_DEAF' THEN 'VISUAL'::text::"AccessProfile_new"
    WHEN 'GUIDED_MOTOR' THEN 'MOTOR'::text::"AccessProfile_new"
    WHEN 'STANDARD' THEN 'STANDARD'::text::"AccessProfile_new"
    ELSE 'STANDARD'::text::"AccessProfile_new"
  END
);

-- Step 5: Drop old enum
DROP TYPE "AccessProfile";

-- Step 6: Rename new enum
ALTER TYPE "AccessProfile_new" RENAME TO "AccessProfile";