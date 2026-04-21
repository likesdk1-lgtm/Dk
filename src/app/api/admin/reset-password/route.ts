import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const { cpf, newPassword, secret } = data;

    // Verify secret from environment variables
    const serverSecret = process.env.RESET_PASSWORD_SECRET || "DKCODE_RESET";
    
    if (secret !== serverSecret) {
      return NextResponse.json({ error: "Chave secreta inválida" }, { status: 401 });
    }

    if (!cpf || !newPassword) {
      return NextResponse.json({ error: "Dados incompletos" }, { status: 400 });
    }

    const cleanCpf = cpf.replace(/\D/g, "");
    
    const admin = await prisma.admin.findUnique({
      where: { cpf: cleanCpf },
    });

    if (!admin) {
      return NextResponse.json({ error: "Administrador não encontrado" }, { status: 404 });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);

    await prisma.admin.update({
      where: { id: admin.id },
      data: { password: hashedPassword },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Reset password error:", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}
