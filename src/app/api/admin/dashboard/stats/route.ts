import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { startOfMonth, endOfMonth } from "date-fns";
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
    const tenantWhere = admin?.tenantId ? { tenantId: admin.tenantId } : {};

    const [totalMembers, activeMembers, overdueBillings, monthlyRevenue, paidThisMonth, settings] = await Promise.all([
      prisma.member.count({ where: tenantWhere }),
      prisma.member.count({ where: { status: "ACTIVE", ...tenantWhere } }),
      prisma.billing.count({ where: { status: "OVERDUE", ...tenantWhere } }),
      prisma.billing.aggregate({
        where: {
          status: "PAID",
          ...tenantWhere,
          paymentDate: {
            gte: startOfMonth(new Date()),
            lte: endOfMonth(new Date()),
          },
        },
        _sum: {
          amount: true,
        },
      }),
      prisma.billing.count({
        where: {
          status: "PAID",
          ...tenantWhere,
          paymentDate: {
            gte: startOfMonth(new Date()),
            lte: endOfMonth(new Date()),
          },
        },
      }),
      prisma.$queryRawUnsafe(`SELECT monthlyGoal FROM Settings WHERE id = 'global' LIMIT 1`),
    ]);

    const rawSettings = (settings as any)[0];
    const monthlyGoal = rawSettings?.monthlyGoal || 0;

    return NextResponse.json({
      totalMembers,
      activeMembers,
      overdueMembers: overdueBillings,
      monthlyRevenue: monthlyRevenue._sum.amount || 0,
      paidThisMonth,
      monthlyGoal,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
