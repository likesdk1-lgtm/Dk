import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export const dynamic = "force-dynamic";

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

    const [totalMembers, activeMembers, pendingBillings, totalRevenue] = await Promise.all([
      prisma.member.count({ where: tenantWhere }),
      prisma.member.count({ where: { status: "ACTIVE", ...tenantWhere } }),
      prisma.billing.count({ where: { status: "PENDING", ...tenantWhere } }),
      prisma.billing.aggregate({
        _sum: { amount: true },
        where: { status: "PAID", ...tenantWhere }
      })
    ]);

    const recentBillings = await prisma.billing.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: {
        member: {
          select: { name: true, registrationNum: true }
        }
      },
      where: tenantWhere,
    });

    return NextResponse.json({
      stats: {
        totalMembers,
        activeMembers,
        pendingBillings,
        totalRevenue: totalRevenue._sum.amount || 0,
      },
      recentBillings
    });
  } catch (error: any) {
    console.error("Admin Dashboard API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
