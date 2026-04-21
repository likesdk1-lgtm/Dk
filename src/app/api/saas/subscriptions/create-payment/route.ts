import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { getEfiService } from "@/lib/efi";
import { z } from "zod";
import { headers } from "next/headers";
import { createSecurityEvent, getRequestIpFromHeaders } from "@/lib/security";

const schema = z.object({
  tenantId: z.string().min(1),
  planCode: z.string().min(2).max(32),
});

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const data = await req.json();
  const parsed = schema.safeParse(data);
  if (!parsed.success) {
    return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
  }

  const tenant = await prisma.tenant.findUnique({ where: { id: parsed.data.tenantId } });
  if (!tenant) {
    return NextResponse.json({ error: "Tenant não encontrado" }, { status: 404 });
  }

  const plan = await prisma.saasPlan.findUnique({
    where: { code: parsed.data.planCode.toUpperCase() },
  });
  if (!plan) {
    return NextResponse.json({ error: "Plano não encontrado" }, { status: 404 });
  }
  if (plan.price <= 0) {
    return NextResponse.json({ error: "Plano não exige pagamento" }, { status: 400 });
  }

  const subscription = await prisma.saasSubscription.create({
    data: {
      tenantId: tenant.id,
      planId: plan.id,
      status: "PENDING",
    },
  });

  const efi = await getEfiService();
  const pix = await efi.generatePixCharge({
    amount: plan.price,
    description: `Plano ${plan.name} - ${tenant.subdomain}`,
    debtor: { cnpj: tenant.cnpj, nome: tenant.name },
    expiresInSeconds: 3600,
  });

  const payment = await prisma.saasPayment.create({
    data: {
      subscriptionId: subscription.id,
      amount: plan.price,
      status: "PENDING",
      efiTxid: pix.txid,
      pixCode: pix.pixCode,
      pixUrl: pix.pixUrl,
    },
  });

  const h = headers();
  await createSecurityEvent({
    tenantId: tenant.id,
    portal: "SAAS",
    action: "SAAS_SUBSCRIPTION_PAYMENT_CREATED",
    ipAddress: getRequestIpFromHeaders(h),
    userAgent: h.get("user-agent"),
    actorRole: session.user.role,
    actorId: session.user.id,
    details: `plan=${plan.code} amount=${plan.price.toFixed(2)}`,
  });

  return NextResponse.json({
    subscriptionId: subscription.id,
    paymentId: payment.id,
    pixCode: payment.pixCode,
    pixUrl: payment.pixUrl,
  });
}
