/*
  Warnings:

  - You are about to drop the column `automergeState` on the `Document` table. All the data in the column will be lost.
  - Added the required column `content` to the `Document` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Document" DROP COLUMN "automergeState",
ADD COLUMN     "content" BYTEA NOT NULL,
ADD COLUMN     "title" TEXT NOT NULL DEFAULT 'Untitled Document';
