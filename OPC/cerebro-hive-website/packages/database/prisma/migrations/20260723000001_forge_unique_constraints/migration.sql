-- CerebroForge™: add composite unique constraints for upsert safety
-- Module: (projectId, name)
ALTER TABLE "Module" ADD CONSTRAINT "Module_projectId_name_key" UNIQUE ("projectId", "name");

-- GeneratedArtifact: (projectId, filePath)
ALTER TABLE "GeneratedArtifact" ADD CONSTRAINT "GeneratedArtifact_projectId_filePath_key" UNIQUE ("projectId", "filePath");

-- Requirement.description is now nullable
ALTER TABLE "Requirement" ALTER COLUMN "description" DROP NOT NULL;
