import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }
  const tenants = await prisma.tenant.findMany({ orderBy: { createdAt: "desc" } });
  const stats = [];
  const now = new Date();
  const start = new Date(now);
  start.setDate(1);
  start.setHours(0, 0, 0, 0);
  start.setMonth(start.getMonth() - 5);
  const months: string[] = [];
  for (let i = 0; i < 6; i += 1) {
    const d = new Date(start);
    d.setMonth(start.getMonth() + i);
    months.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`);
  }
  for (const t of tenants) {
    const [sub, sum, lastPayment, adminsCount, membersCount, billings] = await Promise.all([
      prisma.saasSubscription.findFirst({
        where: { tenantId: t.id },
        orderBy: { createdAt: "desc" },
      }),
      prisma.saasPayment.aggregate({
        _sum: { amount: true },
        where: { subscription: { tenantId: t.id }, status: "PAID" },
      }),
      prisma.saasPayment.findFirst({
        where: { subscription: { tenantId: t.id } },
        orderBy: { createdAt: "desc" },
      }),
      prisma.admin.count({ where: { tenantId: t.id } }),
      prisma.member.count({ where: { tenantId: t.id } }),
      prisma.billing.findMany({
        where: {
          tenantId: t.id,
          status: "PAID",
          paymentDate: { gte: start },
        },
        select: { amount: true, paymentDate: true },
        orderBy: { paymentDate: "asc" },
      }),
    ]);

    let billingStatus: string | null = null;
    if (sub) {
      const subStatus = String(sub.status || "").toUpperCase();
      if (subStatus === "ACTIVE" && sub.currentPeriodEndsAt) {
        const end = new Date(sub.currentPeriodEndsAt);
        if (now <= end) billingStatus = "PAGO";
        else {
          const daysLate = Math.floor((now.getTime() - end.getTime()) / 86400000);
          billingStatus = daysLate <= 7 ? "ATRASO" : "INADIMPLENTE";
        }
      } else if (subStatus === "TRIAL" && sub.trialEndsAt) {
        const end = new Date(sub.trialEndsAt);
        billingStatus = now <= end ? "TRIAL" : "TRIAL_EXPIRADO";
      } else if (subStatus === "PENDING") {
        billingStatus = "PENDENTE";
      } else {
        billingStatus = subStatus || null;
      }
    }
    const revenueByMonth: Record<string, number> = Object.fromEntries(months.map((m) => [m, 0]));
    for (const b of billings) {
      if (!b.paymentDate) continue;
      const d = new Date(b.paymentDate);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      if (key in revenueByMonth) revenueByMonth[key] += b.amount;
    }

    stats.push({
      tenantId: t.id,
      name: t.name,
      subdomain: t.subdomain,
      status: sub?.status || "NONE",
      billingStatus,
      totalPaid: sum._sum.amount || 0,
      adminsCount,
      membersCount,
      revenueByMonth,
      lastPaymentAt: lastPayment?.createdAt || null,
      lastPaymentStatus: lastPayment?.status || null,
      lastUpdate: sub?.updatedAt || t.updatedAt,
    });
  }
  return NextResponse.json({ stats, months });
}
