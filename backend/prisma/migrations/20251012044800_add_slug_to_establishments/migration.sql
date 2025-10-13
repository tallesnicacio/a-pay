-- AlterTable: Add slug column to establishments
-- Step 1: Add column as nullable
ALTER TABLE "establishments" ADD COLUMN "slug" VARCHAR(100);

-- Step 2: Update existing rows with slugs generated from names
UPDATE "establishments"
SET "slug" = lower(regexp_replace(regexp_replace("name", '[^a-zA-Z0-9\s-]', '', 'g'), '\s+', '-', 'g'))
WHERE "slug" IS NULL;

-- Step 3: Make column NOT NULL
ALTER TABLE "establishments" ALTER COLUMN "slug" SET NOT NULL;

-- Step 4: Add unique constraint
CREATE UNIQUE INDEX "establishments_slug_key" ON "establishments"("slug");

-- Step 5: Add index for performance
CREATE INDEX "establishments_slug_idx" ON "establishments"("slug");
