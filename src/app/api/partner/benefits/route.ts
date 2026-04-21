import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || (session.user as any).role !== "PARTNER") {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const partnerId = session.user.id;
    const { title, description, category, link, monthlyLimit } = await req.json();

    if (!title || !description || !category) {
      return NextResponse.json({ error: "Campos obrigatórios ausentes" }, { status: 400 });
    }

    const benefit = await prisma.benefit.create({
      data: {
        title,
        description,
        category,
        link: link || "",
        monthlyLimit: Number(monthlyLimit) || 0,
        companyId: partnerId,
      },
    });

    return NextResponse.json(benefit);
  } catch (error: any) {
    console.error("[PARTNER BENEFITS POST API] ERROR:", error);
    return NextResponse.json({ error: "Erro ao criar benefício" }, { status: 500 });
  }
}
