-- AlterTable
ALTER TABLE "Settings" ADD COLUMN "efiPixKey" TEXT;

-- AlterTable
ALTER TABLE "SupportTicket" ADD COLUMN "respondedAt" DATETIME;
ALTER TABLE "SupportTicket" ADD COLUMN "responseMessage" TEXT;
