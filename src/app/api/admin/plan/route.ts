import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
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
  const subscription = await prisma.saasSubscription.findFirst({
    where: { tenantId: admin.tenantId },
    orderBy: { createdAt: "desc" },
    include: { plan: true },
  });
  const payments = await prisma.saasPayment.findMany({
    where: { subscription: { tenantId: admin.tenantId } },
    orderBy: { createdAt: "desc" },
  });

  const now = new Date();
  let billingStatus: string | null = null;
  if (subscription) {
    const subStatus = String(subscription.status || "").toUpperCase();
    if (subStatus === "ACTIVE" && subscription.currentPeriodEndsAt) {
      const end = new Date(subscription.currentPeriodEndsAt);
      if (now <= end) billingStatus = "PAGO";
      else {
        const daysLate = Math.floor((now.getTime() - end.getTime()) / 86400000);
        billingStatus = daysLate <= 7 ? "ATRASO" : "INADIMPLENTE";
      }
    } else if (subStatus === "TRIAL" && subscription.trialEndsAt) {
      const end = new Date(subscription.trialEndsAt);
      billingStatus = now <= end ? "TRIAL" : "TRIAL_EXPIRADO";
    } else if (subStatus === "PENDING") {
      billingStatus = "PENDENTE";
    } else {
      billingStatus = subStatus || null;
    }
  }

  const pendingPayment = payments.find((p) => p.status === "PENDING" && p.pixCode && p.pixUrl) || null;
  return NextResponse.json({ subscription, payments, billingStatus, pendingPayment });
}
