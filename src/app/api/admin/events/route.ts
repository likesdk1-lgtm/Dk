import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN" && session.user.role !== "MEMBER")) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const events = await prisma.event.findMany({
      orderBy: { date: "desc" },
      include: {
        _count: {
          select: { checkins: true }
        }
      }
    });

    return NextResponse.json(events);
  } catch (error: any) {
    console.error("[ADMIN EVENTS API] GET ERROR:", error);
    return NextResponse.json({ error: "Erro ao buscar eventos" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { title, description, date, location, status } = await req.json();

    if (!title || !date) {
      return NextResponse.json({ error: "Título e data são obrigatórios" }, { status: 400 });
    }

    const event = await prisma.event.create({
      data: {
        title,
        description,
        date: new Date(date),
        location,
        status: status || "ACTIVE",
      },
    });

    return NextResponse.json(event);
  } catch (error: any) {
    console.error("[ADMIN EVENTS API] POST ERROR:", error);
    return NextResponse.json({ error: "Erro ao criar evento" }, { status: 500 });
  }
}
