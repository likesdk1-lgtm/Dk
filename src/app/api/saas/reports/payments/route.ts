import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }
  const payments = await prisma.saasPayment.findMany({
    orderBy: { createdAt: "asc" },
    include: {
      subscription: {
        include: {
          tenant: true,
          plan: true,
        },
      },
    },
  });
  const buckets: Record<string, { paid: number; pending: number; count: number }> = {};
  const totals = { paid: 0, pending: 0, count: 0 };
  const totalsByTenant: Record<
    string,
    { tenantId: string; name: string; subdomain: string; paid: number; pending: number; count: number; lastPaymentAt: string | null }
  > = {};

  for (const p of payments) {
    const d = new Date(p.createdAt);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    buckets[key] ||= { paid: 0, pending: 0, count: 0 };
    buckets[key].count += 1;

    totals.count += 1;
    const tenant = p.subscription.tenant;
    totalsByTenant[tenant.id] ||= {
      tenantId: tenant.id,
      name: tenant.name,
      subdomain: tenant.subdomain,
      paid: 0,
      pending: 0,
      count: 0,
      lastPaymentAt: null,
    };
    totalsByTenant[tenant.id].count += 1;
    totalsByTenant[tenant.id].lastPaymentAt = d.toISOString();

    if (p.status === "PAID") {
      buckets[key].paid += p.amount;
      totals.paid += p.amount;
      totalsByTenant[tenant.id].paid += p.amount;
    } else {
      buckets[key].pending += p.amount;
      totals.pending += p.amount;
      totalsByTenant[tenant.id].pending += p.amount;
    }
  }
  return NextResponse.json({
    buckets,
    totals,
    totalsByTenant: Object.values(totalsByTenant).sort((a, b) => b.paid - a.paid),
  });
}
