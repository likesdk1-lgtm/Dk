import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    // 1. DESATIVAR CHAVES ESTRANGEIRAS
    await prisma.$executeRawUnsafe('PRAGMA foreign_keys = OFF;');
    
    // 2. LISTA DE TODAS AS TABELAS DO SCHEMA.PRISMA
    const tables = [
      'Log', 'MemberLog', 'ErrorLog', 'Notification', 'Billing', 
      'MemberDocument', 'Member', 'MemberModality', 'Admin', 
      'Settings', 'Transaction', 'TransactionCategory'
    ];

    // 3. APAGAR TABELAS SE EXISTIREM
    for (const table of tables) {
      await prisma.$executeRawUnsafe(`DROP TABLE IF EXISTS "${table}";`);
    }

    // 4. RECRIAÇÃO CIRÚRGICA (CONFORME SCHEMA.PRISMA)
    
    // Admin
    await prisma.$executeRawUnsafe(`
      CREATE TABLE "Admin" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "name" TEXT NOT NULL,
        "cpf" TEXT NOT NULL,
        "password" TEXT NOT NULL,
        "role" TEXT NOT NULL DEFAULT 'ADMIN',
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);
    await prisma.$executeRawUnsafe(`CREATE UNIQUE INDEX "Admin_cpf_key" ON "Admin"("cpf");`);

    // Member
    await prisma.$executeRawUnsafe(`
      CREATE TABLE "Member" (
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
        "registrationMode" TEXT NOT NULL DEFAULT 'AUTO',
        "tenantId" TEXT,
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);
    await prisma.$executeRawUnsafe(`CREATE UNIQUE INDEX "Member_cpf_key" ON "Member"("cpf");`);
    await prisma.$executeRawUnsafe(`CREATE UNIQUE INDEX "Member_registrationNum_key" ON "Member"("registrationNum");`);

    // Settings
    await prisma.$executeRawUnsafe(`
      CREATE TABLE "Settings" (
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

    // Billing
    await prisma.$executeRawUnsafe(`
      CREATE TABLE "Billing" (
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

    // MemberDocument
    await prisma.$executeRawUnsafe(`
      CREATE TABLE "MemberDocument" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "name" TEXT NOT NULL,
        "fileUrl" TEXT NOT NULL,
        "fileType" TEXT NOT NULL,
        "memberId" TEXT NOT NULL,
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY ("memberId") REFERENCES "Member" ("id") ON DELETE CASCADE ON UPDATE CASCADE
      );
    `);

    // MemberModality
    await prisma.$executeRawUnsafe(`
      CREATE TABLE "MemberModality" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "name" TEXT NOT NULL,
        "value" REAL NOT NULL,
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // MemberLog
    await prisma.$executeRawUnsafe(`
      CREATE TABLE "MemberLog" (
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

    // Log
    await prisma.$executeRawUnsafe(`
      CREATE TABLE "Log" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "action" TEXT NOT NULL,
        "details" TEXT NOT NULL,
        "ipAddress" TEXT,
        "userAgent" TEXT,
        "adminId" TEXT NOT NULL,
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY ("adminId") REFERENCES "Admin" ("id") ON DELETE CASCADE ON UPDATE CASCADE
      );
    `);

    // Notification
    await prisma.$executeRawUnsafe(`
      CREATE TABLE "Notification" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "title" TEXT NOT NULL,
        "message" TEXT NOT NULL,
        "type" TEXT NOT NULL DEFAULT 'INFO',
        "channel" TEXT NOT NULL DEFAULT 'SYSTEM',
        "isRead" BOOLEAN NOT NULL DEFAULT 0,
        "memberId" TEXT NOT NULL,
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY ("memberId") REFERENCES "Member" ("id") ON DELETE CASCADE ON UPDATE CASCADE
      );
    `);

    // 5. INSERIR DADOS INICIAIS
    const hashedPassword = await bcrypt.hash("admin", 10);
    
    // Admin Root
    await prisma.admin.create({
      data: {
        id: "cl_admin_root",
        name: "Gleydson Admin",
        cpf: "07938310328",
        password: hashedPassword,
        role: "SUPER_ADMIN"
      }
    });

    // Associado Geraldo (Para teste)
    await prisma.member.create({
      data: {
        id: "cl_member_test",
        name: "Geraldo Alves da Silva",
        cpf: "76566412891",
        birthDate: new Date("1997-02-16"),
        registrationNum: "60390001",
        institution: "Teresina",
        status: "ACTIVE"
      }
    });

    await prisma.$executeRawUnsafe('PRAGMA foreign_keys = ON;');

    return NextResponse.json({ 
      success: true, 
      message: "DK SIND ESTABILIZADO! Tabelas físicas Member, Admin, Settings e Billing criadas. Geraldo de teste inserido." 
    });
  } catch (error: any) {
    console.error("ERRO CRÍTICO NO RESET:", error);
    return NextResponse.json({ 
      error: error.message,
      details: "O erro persistiu na criação física das tabelas." 
    }, { status: 500 });
  }
}
