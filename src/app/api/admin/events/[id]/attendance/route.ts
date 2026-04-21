import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN" && session.user.role !== "MEMBER")) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { id: eventId } = params;

    // 1. Buscar todos os associados ativos
    const members = await prisma.member.findMany({
      where: { status: "ACTIVE" },
      select: {
        id: true,
        name: true,
        registrationNum: true,
        photoUrl: true,
      },
      orderBy: { name: "asc" },
    });

    // 2. Buscar todos os check-ins para este evento
    const checkins = await prisma.eventCheckin.findMany({
      where: { eventId },
    });

    // 3. Cruzar dados
    const report = members.map((member) => {
      const checkin = checkins.find((c) => c.memberId === member.id);
      return {
        ...member,
        present: !!checkin,
        checkedAt: checkin ? checkin.checkedAt : null,
      };
    });

    return NextResponse.json(report);
  } catch (error: any) {
    console.error("[ADMIN EVENT ATTENDANCE API] ERROR:", error);
    return NextResponse.json({ error: "Erro ao gerar relatório" }, { status: 500 });
  }
}
