-- CreateTable
CREATE TABLE "SaasPlan" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "price" REAL NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'BRL',
    "interval" TEXT NOT NULL DEFAULT 'MONTHLY',
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "SaasSubscription" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tenantId" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'TRIAL',
    "startedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "trialEndsAt" DATETIME,
    "currentPeriodEndsAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "SaasSubscription_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "SaasSubscription_planId_fkey" FOREIGN KEY ("planId") REFERENCES "SaasPlan" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SaasPayment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "subscriptionId" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "efiTxid" TEXT,
    "pixCode" TEXT,
    "pixUrl" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "paidAt" DATETIME,
    CONSTRAINT "SaasPayment_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "SaasSubscription" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "SaasPlan_code_key" ON "SaasPlan"("code");

-- CreateIndex
CREATE INDEX "SaasSubscription_tenantId_idx" ON "SaasSubscription"("tenantId");

-- CreateIndex
CREATE INDEX "SaasSubscription_planId_idx" ON "SaasSubscription"("planId");

-- CreateIndex
CREATE UNIQUE INDEX "SaasPayment_efiTxid_key" ON "SaasPayment"("efiTxid");

-- CreateIndex
CREATE INDEX "SaasPayment_subscriptionId_idx" ON "SaasPayment"("subscriptionId");
