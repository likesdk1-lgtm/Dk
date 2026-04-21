import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || ((session.user as any).role !== "ADMIN" && (session.user as any).role !== "SUPER_ADMIN" && (session.user as any).role !== "APOIO")) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const benefits = await prisma.benefit.findMany({
      include: {
        company: {
          select: { name: true }
        }
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(benefits);
  } catch (error: any) {
    console.error("[ADMIN BENEFITS GET API] ERROR:", error);
    return NextResponse.json({ error: "Erro ao buscar benefícios" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || ((session.user as any).role !== "ADMIN" && (session.user as any).role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const data = await req.json();
    const benefit = await prisma.benefit.create({
      data: {
        title: data.title,
        description: data.description,
        category: data.category,
        link: data.link,
        monthlyLimit: Number(data.monthlyLimit) || 0,
        companyId: data.companyId || null,
      },
    });
    return NextResponse.json(benefit);
  } catch (error: any) {
    console.error("[ADMIN BENEFITS POST API] ERROR:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
