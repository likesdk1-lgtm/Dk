import { prisma } from "@/lib/prisma";
import { TenantsClient } from "./TenantsClient";

export default async function Page() {
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

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <div className="text-[10px] font-black uppercase tracking-widest text-white/60">Base</div>
        <h1 className="text-3xl md:text-4xl font-black tracking-tight">Clientes</h1>
      </div>

      <TenantsClient
        initialTenants={tenants.map((t) => ({
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
        }))}
      />
    </div>
  );
}
