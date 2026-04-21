import { prisma } from "@/lib/prisma";
import { BadgeCheck, Blocks, CreditCard, Package } from "lucide-react";

export default async function Page() {
  const [tenants, plans, activeSubs, paidPayments] = await Promise.all([
    prisma.tenant.count(),
    prisma.saasPlan.count(),
    prisma.saasSubscription.count({ where: { status: "ACTIVE" } }),
    prisma.saasPayment.aggregate({
      _sum: { amount: true },
      where: { status: "PAID" },
    }),
  ]);

  const mrr = paidPayments._sum.amount || 0;

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <div className="text-[10px] font-black uppercase tracking-widest text-white/60">Visão geral</div>
        <h1 className="text-3xl md:text-4xl font-black tracking-tight">Dashboard SaaS</h1>
      </div>

      <div className="grid md:grid-cols-4 gap-4">
        <div className="rounded-[2rem] border border-white/10 bg-white/5 backdrop-blur-2xl p-6">
          <div className="flex items-center justify-between">
            <div className="text-[10px] font-black uppercase tracking-widest text-white/60">Clientes</div>
            <Blocks className="w-4 h-4 text-white/40" />
          </div>
          <div className="mt-3 text-3xl font-black">{tenants}</div>
        </div>
        <div className="rounded-[2rem] border border-white/10 bg-white/5 backdrop-blur-2xl p-6">
          <div className="flex items-center justify-between">
            <div className="text-[10px] font-black uppercase tracking-widest text-white/60">Planos</div>
            <Package className="w-4 h-4 text-white/40" />
          </div>
          <div className="mt-3 text-3xl font-black">{plans}</div>
        </div>
        <div className="rounded-[2rem] border border-white/10 bg-white/5 backdrop-blur-2xl p-6">
          <div className="flex items-center justify-between">
            <div className="text-[10px] font-black uppercase tracking-widest text-white/60">Assinaturas ativas</div>
            <BadgeCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-3 text-3xl font-black">{activeSubs}</div>
        </div>
        <div className="rounded-[2rem] border border-white/10 bg-white/5 backdrop-blur-2xl p-6">
          <div className="flex items-center justify-between">
            <div className="text-[10px] font-black uppercase tracking-widest text-white/60">Recebido (PIX)</div>
            <CreditCard className="w-4 h-4 text-purple-400" />
          </div>
          <div className="mt-3 text-3xl font-black">R$ {mrr.toFixed(2)}</div>
        </div>
      </div>

      <div className="rounded-[2.5rem] border border-white/10 bg-white/5 backdrop-blur-2xl p-8">
        <div className="text-xs font-black uppercase tracking-widest text-white/70">Ações rápidas</div>
        <div className="mt-5 flex flex-col sm:flex-row gap-3">
          <a
            href="/saas/plans"
            className="px-6 py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black uppercase tracking-widest text-xs text-center"
          >
            Gerenciar planos
          </a>
          <a
            href="/saas/tenants"
            className="px-6 py-4 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 text-white font-black uppercase tracking-widest text-xs text-center"
          >
            Ver clientes
          </a>
          <a
            href="/saas/payments"
            className="px-6 py-4 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 text-white font-black uppercase tracking-widest text-xs text-center"
          >
            Ver pagamentos
          </a>
        </div>
      </div>
    </div>
  );
}

