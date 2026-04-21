-- CreateTable
CREATE TABLE "TenantPaymentGateway" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tenantId" TEXT NOT NULL,
    "provider" TEXT NOT NULL DEFAULT 'EFI',
    "efiClientId" TEXT,
    "efiClientSecret" TEXT,
    "efiPixKey" TEXT,
    "efiSandbox" BOOLEAN NOT NULL DEFAULT true,
    "efiCertificate" TEXT,
    "mpAccessToken" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "TenantPaymentGateway_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SecurityEvent" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tenantId" TEXT,
    "portal" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "device" TEXT,
    "location" TEXT,
    "actorRole" TEXT,
    "actorId" TEXT,
    "details" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Billing" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "amount" REAL NOT NULL,
    "dueDate" DATETIME NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "paymentDate" DATETIME,
    "pixCode" TEXT,
    "pixUrl" TEXT,
    "efiId" TEXT,
    "memberId" TEXT NOT NULL,
    "tenantId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Billing_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Billing_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Billing" ("amount", "createdAt", "dueDate", "efiId", "id", "memberId", "paymentDate", "pixCode", "pixUrl", "status", "updatedAt") SELECT "amount", "createdAt", "dueDate", "efiId", "id", "memberId", "paymentDate", "pixCode", "pixUrl", "status", "updatedAt" FROM "Billing";
DROP TABLE "Billing";
ALTER TABLE "new_Billing" RENAME TO "Billing";
CREATE INDEX "Billing_tenantId_idx" ON "Billing"("tenantId");
CREATE TABLE "new_Member" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "cpf" TEXT NOT NULL,
    "birthDate" DATETIME NOT NULL,
    "registrationNum" TEXT NOT NULL,
    "healthUnit" TEXT,
    "photoUrl" TEXT,
    "whatsapp" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "modalityId" TEXT,
    "tenantId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Member_modalityId_fkey" FOREIGN KEY ("modalityId") REFERENCES "MemberModality" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Member_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Member" ("birthDate", "cpf", "createdAt", "healthUnit", "id", "modalityId", "name", "photoUrl", "registrationNum", "status", "updatedAt", "whatsapp") SELECT "birthDate", "cpf", "createdAt", "healthUnit", "id", "modalityId", "name", "photoUrl", "registrationNum", "status", "updatedAt", "whatsapp" FROM "Member";
DROP TABLE "Member";
ALTER TABLE "new_Member" RENAME TO "Member";
CREATE UNIQUE INDEX "Member_cpf_key" ON "Member"("cpf");
CREATE UNIQUE INDEX "Member_registrationNum_key" ON "Member"("registrationNum");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "TenantPaymentGateway_tenantId_key" ON "TenantPaymentGateway"("tenantId");

-- CreateIndex
CREATE INDEX "SecurityEvent_tenantId_idx" ON "SecurityEvent"("tenantId");

-- CreateIndex
CREATE INDEX "SecurityEvent_portal_idx" ON "SecurityEvent"("portal");

-- CreateIndex
CREATE INDEX "SecurityEvent_action_idx" ON "SecurityEvent"("action");

-- CreateIndex
CREATE INDEX "SecurityEvent_createdAt_idx" ON "SecurityEvent"("createdAt");
