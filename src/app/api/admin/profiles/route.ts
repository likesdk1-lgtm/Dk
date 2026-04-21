import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import bcrypt from "bcryptjs";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const admins = await prisma.admin.findMany({
      select: {
        id: true,
        name: true,
        cpf: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(admins);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const data = await req.json();
    const { name, cpf, password, role } = data;

    if (!name || !cpf || !password) {
      return NextResponse.json({ error: "Dados incompletos." }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.admin.create({
      data: {
        name,
        cpf: cpf.replace(/\D/g, ""),
        password: hashedPassword,
        role: role || "ADMIN",
      },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("ERRO AO CRIAR ADMINISTRADOR:", error);
    return NextResponse.json({ error: `ERRO: ${error.message}` }, { status: 500 });
  }
}
