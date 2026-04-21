import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const tenants = await prisma.tenant.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      subscriptions: {
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
  });

  const now = new Date();
  return NextResponse.json({
    tenants: tenants.map((t) => ({
      ...(t.subscriptions[0]?.status
        ? (() => {
            const s: any = t.subscriptions[0];
            const subStatus = String(s.status || "").toUpperCase();
            if (subStatus === "ACTIVE" && s.currentPeriodEndsAt) {
              const end = new Date(s.currentPeriodEndsAt);
              if (now <= end) return { billingStatus: "PAGO" };
              const daysLate = Math.floor((now.getTime() - end.getTime()) / 86400000);
              return { billingStatus: daysLate <= 7 ? "ATRASO" : "INADIMPLENTE" };
            }
            if (subStatus === "TRIAL" && s.trialEndsAt) {
              const end = new Date(s.trialEndsAt);
              if (now <= end) return { billingStatus: "TRIAL" };
              return { billingStatus: "TRIAL_EXPIRADO" };
            }
            if (subStatus === "PENDING") return { billingStatus: "PENDENTE" };
            return { billingStatus: subStatus };
          })()
        : { billingStatus: null }),
      id: t.id,
      name: t.name,
      cnpj: t.cnpj,
      subdomain: t.subdomain,
      status: t.status,
      subscriptionStatus: t.subscriptions[0]?.status || null,
    })),
  });
}
