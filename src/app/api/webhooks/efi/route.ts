import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const payload = await req.json();
    console.log("Recebido Webhook Efí PIX:", JSON.stringify(payload, null, 2));

    // Efí first sends a test POST with empty payload or verification structure
    if (payload.webhookUrl) {
      return NextResponse.json({ ok: true });
    }

    const pixList = payload.pix;
    if (!pixList || !Array.isArray(pixList)) {
      return NextResponse.json({ error: "Payload inválido" }, { status: 400 });
    }

    for (const pix of pixList) {
      const { txid, status } = pix;

      if (status === "CONCLUIDA" || status === "PAGO") {
        const billing = await prisma.billing.findFirst({
          where: { efiId: txid },
          include: { member: true },
        });

        if (billing) {
          console.log(`Atualizando cobrança ${billing.id} para PAGO (txid: ${txid})`);
          await prisma.billing.update({
            where: { id: billing.id },
            data: {
              status: "PAID",
              paymentDate: new Date(),
              tenantId: billing.tenantId || billing.member.tenantId || null,
            },
          });
        }

        const saasPayment = await prisma.saasPayment.findFirst({
          where: { efiTxid: txid },
          include: { subscription: true },
        });

        if (saasPayment) {
          await prisma.saasPayment.update({
            where: { id: saasPayment.id },
            data: {
              status: "PAID",
              paidAt: new Date(),
            },
          });

          const now = new Date();
          const nextMonth = new Date(now);
          nextMonth.setMonth(nextMonth.getMonth() + 1);

          await prisma.saasSubscription.update({
            where: { id: saasPayment.subscriptionId },
            data: {
              status: "ACTIVE",
              startedAt: now,
              currentPeriodEndsAt: nextMonth,
            },
          });
        }
      }
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Erro no processamento do webhook Efí:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

// Efí requires a GET route for verification sometimes or just allows PUT to set it
export async function GET() {
  return NextResponse.json({ status: "Webhook Active" });
}
