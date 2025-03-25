/*
  Warnings:

  - You are about to drop the column `name` on the `Conversation` table. All the data in the column will be lost.
  - You are about to drop the `ConversationParticipant` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[userAId,userBId]` on the table `Conversation` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `userAId` to the `Conversation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userBId` to the `Conversation` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "ConversationParticipant" DROP CONSTRAINT "ConversationParticipant_conversationId_fkey";

-- DropForeignKey
ALTER TABLE "ConversationParticipant" DROP CONSTRAINT "ConversationParticipant_userId_fkey";

-- AlterTable
ALTER TABLE "Conversation" DROP COLUMN "name",
ADD COLUMN     "userAId" INTEGER NOT NULL,
ADD COLUMN     "userBId" INTEGER NOT NULL;

-- DropTable
DROP TABLE "ConversationParticipant";

-- CreateIndex
CREATE UNIQUE INDEX "Conversation_userAId_userBId_key" ON "Conversation"("userAId", "userBId");

-- AddForeignKey
ALTER TABLE "Conversation" ADD CONSTRAINT "Conversation_userAId_fkey" FOREIGN KEY ("userAId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Conversation" ADD CONSTRAINT "Conversation_userBId_fkey" FOREIGN KEY ("userBId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
