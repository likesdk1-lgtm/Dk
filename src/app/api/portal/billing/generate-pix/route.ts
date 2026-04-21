import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getPaymentGatewayForTenant } from "@/lib/payment-gateways";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { billingId } = await req.json();

    const billing = await prisma.billing.findUnique({
      where: { id: billingId },
      include: { member: true },
    });

    if (!billing) {
      return NextResponse.json({ error: "Cobrança não encontrada" }, { status: 404 });
    }

    // Check if user is the owner or an admin
    const isOwner = session.user.id === billing.memberId;
    const isAdmin = session.user.role === "ADMIN" || session.user.role === "SUPER_ADMIN";

    if (!isOwner && !isAdmin) {
      return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
    }

    // If already has pixCode, return it
    if (billing.pixCode && billing.status === "PENDING") {
      return NextResponse.json({
        pixCode: billing.pixCode,
        pixUrl: billing.pixUrl,
      });
    }

    const tenantId = billing.tenantId || billing.member.tenantId;
    if (!tenantId) {
      throw new Error("Sindicato do associado não identificado para cobrança");
    }

    const gateway = await getPaymentGatewayForTenant(tenantId);
    const pixData = await gateway.generatePix(
      billing.amount,
      `Mensalidade Dk Sind - ${billing.id}`,
      billing.member.cpf,
      billing.member.name
    );

    const updatedBilling = await prisma.billing.update({
      where: { id: billingId },
      data: {
        efiId: pixData.txid,
        pixCode: pixData.pixCode,
        pixUrl: pixData.pixUrl,
        tenantId,
      },
    });

    return NextResponse.json({
      pixCode: updatedBilling.pixCode,
      pixUrl: updatedBilling.pixUrl,
    });
  } catch (error: any) {
    console.error("Erro ao gerar PIX:", error);
    return NextResponse.json(
      { error: error.message || "Erro interno ao gerar PIX" },
      { status: 500 }
    );
  }
}
