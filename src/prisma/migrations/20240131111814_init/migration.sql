/*
  Warnings:

  - You are about to drop the column `lists` on the `List` table. All the data in the column will be lost.
  - Added the required column `icon` to the `List` table without a default value. This is not possible if the table is not empty.
  - Added the required column `listname` to the `List` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "List_userId_key";

-- AlterTable
ALTER TABLE "List" DROP COLUMN "lists",
ADD COLUMN     "icon" TEXT NOT NULL,
ADD COLUMN     "listname" TEXT NOT NULL;
