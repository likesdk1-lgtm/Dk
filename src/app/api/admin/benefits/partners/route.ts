import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || ((session.user as any).role !== "ADMIN" && (session.user as any).role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const partners = await prisma.partnerCompany.findMany({
      orderBy: { name: "asc" },
      include: {
        _count: {
          select: { usages: true, benefits: true }
        }
      }
    });

    return NextResponse.json(partners);
  } catch (error: any) {
    console.error("[ADMIN PARTNERS API] GET ERROR:", error);
    return NextResponse.json({ error: "Erro ao buscar parceiros" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { name, document, email, password, phone, address, category, logoUrl } = await req.json();

    if (!name || !document || !password) {
      return NextResponse.json({ error: "Nome, Documento e Senha são obrigatórios" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const partner = await prisma.partnerCompany.create({
      data: {
        name,
        document: document.replace(/\D/g, ""),
        email,
        password: hashedPassword,
        phone,
        address,
        category,
        logoUrl,
        status: "ACTIVE",
      },
    });

    return NextResponse.json(partner);
  } catch (error: any) {
    console.error("[ADMIN PARTNERS API] POST ERROR:", error);
    if (error.code === 'P2002') {
      return NextResponse.json({ error: "Documento ou E-mail já cadastrado" }, { status: 400 });
    }
    return NextResponse.json({ error: "Erro ao criar parceiro" }, { status: 500 });
  }
}
