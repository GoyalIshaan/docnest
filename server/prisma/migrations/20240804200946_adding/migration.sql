/*
  Warnings:

  - You are about to drop the column `content` on the `Document` table. All the data in the column will be lost.
  - You are about to drop the column `summary` on the `Document` table. All the data in the column will be lost.
  - You are about to drop the column `tags` on the `Document` table. All the data in the column will be lost.
  - You are about to drop the column `title` on the `Document` table. All the data in the column will be lost.
  - Added the required column `automergeState` to the `Document` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Document" DROP COLUMN "content",
DROP COLUMN "summary",
DROP COLUMN "tags",
DROP COLUMN "title",
ADD COLUMN     "automergeState" BYTEA NOT NULL;
