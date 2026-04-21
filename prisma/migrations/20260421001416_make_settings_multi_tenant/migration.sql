-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Settings" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tenantId" TEXT,
    "unionName" TEXT NOT NULL DEFAULT 'SINTASB-PI',
    "initials" TEXT,
    "logoUrl" TEXT,
    "cardDesign" TEXT,
    "googleAnalyticsId" TEXT,
    "whatsAppToken" TEXT,
    "whatsAppNumber" TEXT,
    "whatsAppInstance" TEXT,
    "whatsAppApiKey" TEXT,
    "supportLink" TEXT,
    "efiClientId" TEXT,
    "efiClientSecret" TEXT,
    "efiPixKey" TEXT,
    "efiSandbox" BOOLEAN NOT NULL DEFAULT true,
    "efiCertificate" TEXT,
    "instagramAccount" TEXT,
    "youtubeAccount" TEXT,
    "facebookAccount" TEXT,
    "homePageContent" TEXT,
    "footerContent" TEXT,
    "monthlyGoal" REAL DEFAULT 0,
    "billingGeneratedMessage" TEXT,
    "billingReminder3DaysMessage" TEXT,
    "billingReminder15DaysMessage" TEXT,
    "automationEnabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Settings_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Settings" ("automationEnabled", "billingGeneratedMessage", "billingReminder15DaysMessage", "billingReminder3DaysMessage", "cardDesign", "createdAt", "efiCertificate", "efiClientId", "efiClientSecret", "efiPixKey", "efiSandbox", "facebookAccount", "footerContent", "googleAnalyticsId", "homePageContent", "id", "instagramAccount", "logoUrl", "monthlyGoal", "supportLink", "unionName", "updatedAt", "whatsAppApiKey", "whatsAppInstance", "whatsAppNumber", "whatsAppToken", "youtubeAccount") SELECT "automationEnabled", "billingGeneratedMessage", "billingReminder15DaysMessage", "billingReminder3DaysMessage", "cardDesign", "createdAt", "efiCertificate", "efiClientId", "efiClientSecret", "efiPixKey", "efiSandbox", "facebookAccount", "footerContent", "googleAnalyticsId", "homePageContent", "id", "instagramAccount", "logoUrl", "monthlyGoal", "supportLink", "unionName", "updatedAt", "whatsAppApiKey", "whatsAppInstance", "whatsAppNumber", "whatsAppToken", "youtubeAccount" FROM "Settings";
DROP TABLE "Settings";
ALTER TABLE "new_Settings" RENAME TO "Settings";
CREATE UNIQUE INDEX "Settings_tenantId_key" ON "Settings"("tenantId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
