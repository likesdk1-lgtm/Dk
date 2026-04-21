import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getEfiService } from "@/lib/efi";

export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }
  if (!session.user.email) {
    return NextResponse.json({ error: "Sessão inválida" }, { status: 401 });
  }
  const admin = await prisma.admin.findUnique({ where: { cpf: session.user.email.replace(/\D/g, "") } });
  if (!admin || !admin.tenantId) {
    return NextResponse.json({ error: "Tenant não localizado" }, { status: 404 });
  }
  const plan = await prisma.saasPlan.upsert({
    where: { code: "PRO" },
    update: {},
    create: { code: "PRO", name: "Profissional", price: 199, currency: "BRL", interval: "MONTHLY", status: "ACTIVE" },
  });
  const subscription = await prisma.saasSubscription.create({
    data: { tenantId: admin.tenantId, planId: plan.id, status: "PENDING" },
  });
  const tenant = await prisma.tenant.findUnique({ where: { id: admin.tenantId } });
  const efi = await getEfiService();
  const pix = await efi.generatePixCharge({
    amount: plan.price,
    description: `Plano ${plan.name} - ${tenant?.subdomain}`,
    debtor: { cnpj: tenant?.cnpj || "", nome: tenant?.name || "" },
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
  return NextResponse.json({ subscriptionId: subscription.id, paymentId: payment.id, pixCode: payment.pixCode, pixUrl: payment.pixUrl });
}
