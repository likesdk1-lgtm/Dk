import { prisma } from "@/lib/prisma";

export default async function Page() {
  const payments = await prisma.saasPayment.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
    include: {
      subscription: {
        include: {
          tenant: true,
          plan: true,
        },
      },
    },
  });

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <div className="text-[10px] font-black uppercase tracking-widest text-white/60">Financeiro</div>
        <h1 className="text-3xl md:text-4xl font-black tracking-tight">Pagamentos</h1>
      </div>

      <div className="rounded-[2.5rem] border border-white/10 bg-white/5 backdrop-blur-2xl p-8 overflow-x-auto">
        <div className="text-xs font-black uppercase tracking-widest text-white/70">Últimos pagamentos (SaaS)</div>
        <table className="w-full mt-5 text-sm">
          <thead className="text-white/50">
            <tr className="text-left">
              <th className="py-3 pr-4">Cliente</th>
              <th className="py-3 pr-4">Plano</th>
              <th className="py-3 pr-4">Valor</th>
              <th className="py-3 pr-4">Status</th>
              <th className="py-3 pr-0">Data</th>
            </tr>
          </thead>
          <tbody>
            {payments.map((p) => (
              <tr key={p.id} className="border-t border-white/10">
                <td className="py-4 pr-4">
                  <div className="font-black">{p.subscription.tenant.name}</div>
                  <div className="text-[10px] text-white/50">{p.subscription.tenant.subdomain}</div>
                </td>
                <td className="py-4 pr-4">{p.subscription.plan.name}</td>
                <td className="py-4 pr-4">R$ {p.amount.toFixed(2)}</td>
                <td className="py-4 pr-4">{p.status}</td>
                <td className="py-4 pr-0">{new Date(p.createdAt).toLocaleString("pt-BR")}</td>
              </tr>
            ))}
            {payments.length === 0 && (
              <tr>
                <td colSpan={5} className="py-10 text-center text-white/50">
                  Nenhum pagamento encontrado
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

