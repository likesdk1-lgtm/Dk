import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN" && session.user.role !== "MEMBER" && session.user.role !== "APOIO")) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { qrData, eventId } = await req.json();

    if (!qrData || !eventId) {
      return NextResponse.json({ error: "Dados incompletos (QR e Evento)" }, { status: 400 });
    }

    let parsedData;
    try {
      parsedData = JSON.parse(qrData);
    } catch (e) {
      parsedData = { registration: qrData };
    }

    const registration = parsedData.registration;

    const member = await prisma.member.findUnique({
      where: { registrationNum: registration },
    });

    if (!member) {
      return NextResponse.json({ error: "Associado não localizado" }, { status: 404 });
    }

    if (member.status !== "ACTIVE") {
      return NextResponse.json({ error: "Associado Inativo", member, isValid: false }, { status: 403 });
    }

    // Registrar o check-in no evento
    try {
      const checkin = await prisma.eventCheckin.upsert({
        where: {
          eventId_memberId: {
            eventId,
            memberId: member.id,
          }
        },
        update: {
          checkedAt: new Date(),
        },
        create: {
          eventId,
          memberId: member.id,
          checkedAt: new Date(),
        }
      });

      return NextResponse.json({
        success: true,
        member,
        isValid: true,
        checkin,
        timestamp: new Date().toISOString(),
      });
    } catch (err: any) {
      console.error("[EVENT CHECKIN] Error upserting checkin:", err);
      return NextResponse.json({ error: "Erro ao registrar presença no evento" }, { status: 500 });
    }

  } catch (error: any) {
    console.error("[ADMIN EVENT CHECKIN API] ERROR:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
