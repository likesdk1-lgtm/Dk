import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendBillingNotification } from "@/lib/automation";

export async function POST() {
  try {
    // Encontra o primeiro associado ativo com WhatsApp para usar como cobaia
    const testMember = await prisma.member.findFirst({
      where: {
        status: "ACTIVE",
        whatsapp: { not: null }
      }
    });

    if (!testMember) {
      return NextResponse.json({ error: "Nenhum associado de teste encontrado (ativo e com WhatsApp)." }, { status: 404 });
    }

    // Força o envio de todas as notificações para este associado
    await sendBillingNotification(testMember.id, "GENERATED");
    await sendBillingNotification(testMember.id, "REMINDER_3_DAYS");
    await sendBillingNotification(testMember.id, "REMINDER_15_DAYS");

    return NextResponse.json({
      success: true,
      message: `Notificações de teste enviadas para ${testMember.name} (${testMember.whatsapp}).`
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
