-- Migration: 20260724000001_model_entry_fields
-- Adds modelId, displayName, orgId, maxOutput to model_entries table
-- and renames legacy `name` column -> `display_name`

-- Step 1: Add new nullable columns
ALTER TABLE "model_entries"
  ADD COLUMN IF NOT EXISTS "model_id"    TEXT,
  ADD COLUMN IF NOT EXISTS "display_name" TEXT,
  ADD COLUMN IF NOT EXISTS "org_id"      TEXT,
  ADD COLUMN IF NOT EXISTS "max_output"  INTEGER NOT NULL DEFAULT 0;

-- Step 2: Back-fill from legacy `name` column if it exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'model_entries' AND column_name = 'name'
  ) THEN
    UPDATE "model_entries" SET "model_id" = "id" WHERE "model_id" IS NULL;
    UPDATE "model_entries" SET "display_name" = "name" WHERE "display_name" IS NULL;
    ALTER TABLE "model_entries" DROP COLUMN IF EXISTS "name";
  ELSE
    UPDATE "model_entries" SET "model_id" = "id" WHERE "model_id" IS NULL;
    UPDATE "model_entries" SET "display_name" = "id" WHERE "display_name" IS NULL;
  END IF;
END $$;

-- Step 3: Apply NOT NULL + UNIQUE constraints
ALTER TABLE "model_entries"
  ALTER COLUMN "model_id"    SET NOT NULL,
  ALTER COLUMN "display_name" SET NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS "model_entries_model_id_key" ON "model_entries"("model_id");
