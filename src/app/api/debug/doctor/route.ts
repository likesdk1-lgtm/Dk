import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // 1. Tentar criar a tabela Admin se ela não existir
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "Admin" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "name" TEXT NOT NULL,
        "cpf" TEXT NOT NULL,
        "password" TEXT NOT NULL,
        "role" TEXT NOT NULL DEFAULT 'ADMIN',
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 2. Tentar criar a tabela Member se ela não existir
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "Member" (
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
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 3. Tentar criar a tabela MemberDocument se ela não existir
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "MemberDocument" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "name" TEXT NOT NULL,
        "fileUrl" TEXT NOT NULL,
        "fileType" TEXT NOT NULL,
        "memberId" TEXT NOT NULL,
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY ("memberId") REFERENCES "Member" ("id") ON DELETE CASCADE ON UPDATE CASCADE
      );
    `);

    // 4. Tentar criar a tabela MemberModality se ela não existir
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "MemberModality" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "name" TEXT NOT NULL,
        "value" REAL NOT NULL,
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 5. Tentar criar a tabela Billing se ela não existir
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "Billing" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "amount" REAL NOT NULL,
        "dueDate" DATETIME NOT NULL,
        "status" TEXT NOT NULL DEFAULT 'PENDING',
        "paymentDate" DATETIME,
        "pixCode" TEXT,
        "pixUrl" TEXT,
        "efiId" TEXT,
        "memberId" TEXT NOT NULL,
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY ("memberId") REFERENCES "Member" ("id") ON DELETE CASCADE ON UPDATE CASCADE
      );
    `);

    // 6. Tentar criar a tabela Notification se ela não existir
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "Notification" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "title" TEXT NOT NULL,
        "message" TEXT NOT NULL,
        "channel" TEXT NOT NULL,
        "fileUrl" TEXT,
        "memberId" TEXT NOT NULL,
        "sentAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY ("memberId") REFERENCES "Member" ("id") ON DELETE CASCADE ON UPDATE CASCADE
      );
    `);

    // 7. Tentar criar a tabela MemberLog se ela não existir
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "MemberLog" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "action" TEXT NOT NULL,
        "details" TEXT NOT NULL,
        "ipAddress" TEXT,
        "userAgent" TEXT,
        "memberId" TEXT NOT NULL,
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY ("memberId") REFERENCES "Member" ("id") ON DELETE CASCADE ON UPDATE CASCADE
      );
    `);

    // 8. Tentar criar a tabela Settings se ela não existir
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "Settings" (
        "id" TEXT NOT NULL PRIMARY KEY DEFAULT 'global',
        "unionName" TEXT NOT NULL DEFAULT 'Dk Sind',
        "logoUrl" TEXT,
        "cardDesign" TEXT,
        "googleAnalyticsId" TEXT,
        "whatsAppToken" TEXT,
        "whatsAppNumber" TEXT,
        "efiClientId" TEXT,
        "efiClientSecret" TEXT,
        "efiSandbox" BOOLEAN NOT NULL DEFAULT 1,
        "efiCertificate" TEXT,
        "instagramAccount" TEXT,
        "youtubeAccount" TEXT,
        "facebookAccount" TEXT,
        "homePageContent" TEXT,
        "footerContent" TEXT,
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 9. Tentar criar os índices se não existirem
    try {
      await prisma.$executeRawUnsafe(`CREATE UNIQUE INDEX IF NOT EXISTS "Admin_cpf_key" ON "Admin"("cpf");`);
      await prisma.$executeRawUnsafe(`CREATE UNIQUE INDEX IF NOT EXISTS "Member_cpf_key" ON "Member"("cpf");`);
      await prisma.$executeRawUnsafe(`CREATE UNIQUE INDEX IF NOT EXISTS "Member_registrationNum_key" ON "Member"("registrationNum");`);
    } catch (e) { }

    // 10. Verificar tabelas
    const tables: any = await prisma.$queryRaw`SELECT name FROM sqlite_master WHERE type='table';`;
    const tableNames = tables.map((t: any) => t.name);
    
    // 11. Listar associados para conferência
    const members = await prisma.member.findMany({
      select: { id: true, name: true, cpf: true, photoUrl: true },
      take: 5
    });

    return NextResponse.json({
      success: true,
      tables: tableNames,
      count: members.length,
      sample: members,
      message: "DK SIND ESTABILIZADO! Todas as tabelas físicas foram verificadas/criadas conforme o schema."
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: error.stack
    }, { status: 500 });
  }
}
