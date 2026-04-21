import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { subMinutes } from "date-fns";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }
    const admin = session.user.email
      ? await prisma.admin.findUnique({ where: { cpf: session.user.email.replace(/\D/g, "") } })
      : null;

    // Definimos como "Online" qualquer associado que teve atividade nos últimos 15 minutos
    const fifteenMinutesAgo = subMinutes(new Date(), 15);

    // Buscamos os logs mais recentes de cada associado
    const onlineLogs = await prisma.memberLog.findMany({
      where: {
        createdAt: {
          gte: fifteenMinutesAgo,
        },
        ...(admin?.tenantId ? { member: { tenantId: admin.tenantId } } : {}),
      },
      include: {
        member: {
          select: {
            id: true,
            name: true,
            registrationNum: true,
            photoUrl: true,
            whatsapp: true,
            status: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Removemos duplicatas para mostrar apenas uma vez cada associado
    const uniqueOnlineMembersMap = new Map();
    onlineLogs.forEach((log) => {
      if (!uniqueOnlineMembersMap.has(log.memberId)) {
        uniqueOnlineMembersMap.set(log.memberId, {
          ...log.member,
          lastActivity: log.createdAt,
          lastAction: log.action,
          ipAddress: log.ipAddress,
        });
      }
    });

    const onlineMembers = Array.from(uniqueOnlineMembersMap.values());

    return NextResponse.json(onlineMembers);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
