/*
  Warnings:

  - You are about to drop the column `healthUnit` on the `Member` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Tenant" ADD COLUMN "initials" TEXT;

-- AlterTable
ALTER TABLE "TenantPaymentGateway" ADD COLUMN "bbClientId" TEXT;
ALTER TABLE "TenantPaymentGateway" ADD COLUMN "bbClientSecret" TEXT;
ALTER TABLE "TenantPaymentGateway" ADD COLUMN "bbDeveloperKey" TEXT;
ALTER TABLE "TenantPaymentGateway" ADD COLUMN "itauCertificate" TEXT;
ALTER TABLE "TenantPaymentGateway" ADD COLUMN "itauClientId" TEXT;
ALTER TABLE "TenantPaymentGateway" ADD COLUMN "itauClientSecret" TEXT;
ALTER TABLE "TenantPaymentGateway" ADD COLUMN "sicoobCertificate" TEXT;
ALTER TABLE "TenantPaymentGateway" ADD COLUMN "sicoobClientId" TEXT;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Member" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "cpf" TEXT NOT NULL,
    "birthDate" DATETIME NOT NULL,
    "registrationNum" TEXT NOT NULL,
    "institution" TEXT,
    "photoUrl" TEXT,
    "whatsapp" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "modalityId" TEXT,
    "tenantId" TEXT,
    "registrationMode" TEXT NOT NULL DEFAULT 'AUTO',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Member_modalityId_fkey" FOREIGN KEY ("modalityId") REFERENCES "MemberModality" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Member_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Member" ("birthDate", "cpf", "createdAt", "id", "modalityId", "name", "photoUrl", "registrationNum", "status", "tenantId", "updatedAt", "whatsapp") SELECT "birthDate", "cpf", "createdAt", "id", "modalityId", "name", "photoUrl", "registrationNum", "status", "tenantId", "updatedAt", "whatsapp" FROM "Member";
DROP TABLE "Member";
ALTER TABLE "new_Member" RENAME TO "Member";
CREATE UNIQUE INDEX "Member_cpf_key" ON "Member"("cpf");
CREATE UNIQUE INDEX "Member_registrationNum_key" ON "Member"("registrationNum");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
