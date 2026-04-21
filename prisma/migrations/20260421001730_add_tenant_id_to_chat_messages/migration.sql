-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_ChatMessage" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tenantId" TEXT,
    "whatsappNumber" TEXT NOT NULL,
    "text" TEXT,
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "mediaUrl" TEXT,
    "mediaType" TEXT,
    "caption" TEXT,
    "fileName" TEXT,
    "memberId" TEXT,
    "adminId" TEXT,
    "remoteId" TEXT,
    "isGroup" BOOLEAN NOT NULL DEFAULT false,
    "groupName" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ChatMessage_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "Admin" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "ChatMessage_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "ChatMessage_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_ChatMessage" ("adminId", "caption", "createdAt", "fileName", "groupName", "id", "isGroup", "mediaType", "mediaUrl", "memberId", "remoteId", "status", "text", "type", "whatsappNumber") SELECT "adminId", "caption", "createdAt", "fileName", "groupName", "id", "isGroup", "mediaType", "mediaUrl", "memberId", "remoteId", "status", "text", "type", "whatsappNumber" FROM "ChatMessage";
DROP TABLE "ChatMessage";
ALTER TABLE "new_ChatMessage" RENAME TO "ChatMessage";
CREATE UNIQUE INDEX "ChatMessage_remoteId_key" ON "ChatMessage"("remoteId");
CREATE INDEX "ChatMessage_tenantId_idx" ON "ChatMessage"("tenantId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
