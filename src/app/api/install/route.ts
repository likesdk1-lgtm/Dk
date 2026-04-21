import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function GET() {
  try {
    const adminCount = await prisma.admin.count();
    return NextResponse.json({ 
      hasAdmin: adminCount > 0,
      count: adminCount
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const { adminName, adminCpf, adminPassword, unionName } = data;

    if (!adminName || !adminCpf || !adminPassword) {
      return NextResponse.json({ error: "Dados incompletos." }, { status: 400 });
    }

    // Hash the super admin password
    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    // Create Super Admin usando CUID gerado pelo Prisma
    await prisma.admin.create({
      data: {
        name: adminName,
        cpf: adminCpf.replace(/\D/g, ""),
        password: hashedPassword,
        role: "SUPER_ADMIN",
      },
    });

    // Create Global Settings - Simplificado sem updatedAt manual
    await prisma.settings.upsert({
      where: { id: "global" },
      update: { unionName: unionName || "Dk Sind" },
      create: {
        id: "global",
        unionName: unionName || "Dk Sind"
      },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("ERRO NA INSTALAÇÃO:", error);
    return NextResponse.json({ error: `ERRO: ${error.message}` }, { status: 500 });
  }
}
