/*
  Warnings:

  - Added the required column `orgId` to the `Policy` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Policy` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "KnowledgeDocument" ALTER COLUMN "id" SET DEFAULT ('doc_' || replace(uuid_generate_v4()::text, '-', ''));

-- AlterTable
ALTER TABLE "Organization" ALTER COLUMN "id" SET DEFAULT ('org_' || replace(uuid_generate_v4()::text, '-', ''));

-- AlterTable
ALTER TABLE "Policy" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "description" TEXT,
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "orgId" TEXT NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- CreateIndex
CREATE INDEX "Policy_orgId_idx" ON "Policy"("orgId");

-- AddForeignKey
ALTER TABLE "Policy" ADD CONSTRAINT "Policy_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
