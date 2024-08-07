-- CreateEnum
CREATE TYPE "CommentStatus" AS ENUM ('ACTIVE', 'RESOLVED', 'DELETED');

-- AlterTable
ALTER TABLE "Comment" ADD COLUMN     "endIndex" INTEGER,
ADD COLUMN     "parentId" TEXT,
ADD COLUMN     "startIndex" INTEGER,
ADD COLUMN     "status" "CommentStatus" NOT NULL DEFAULT 'ACTIVE';

-- CreateIndex
CREATE INDEX "Comment_documentId_status_idx" ON "Comment"("documentId", "status");

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Comment"("id") ON DELETE SET NULL ON UPDATE CASCADE;
