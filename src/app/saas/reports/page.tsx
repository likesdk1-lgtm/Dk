"use client";

import React, { useEffect, useMemo, useState } from "react";

type MonthRow = { month: string; paid: number; pending: number; count: number };
type TenantRow = { tenantId: string; name: string; subdomain: string; paid: number; pending: number; count: number; lastPaymentAt: string | null };

export default function Page() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [months, setMonths] = useState<MonthRow[]>([]);
  const [totals, setTotals] = useState<{ paid: number; pending: number; count: number }>({ paid: 0, pending: 0, count: 0 });
  const [tenants, setTenants] = useState<TenantRow[]>([]);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/saas/reports/payments", { cache: "no-store" });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error || "Erro ao carregar relatório");
        return;
      }
      const buckets = json.buckets || {};
      setMonths(Object.entries(buckets).map(([month, data]: any) => ({ month, ...data })));
      setTotals(json.totals || { paid: 0, pending: 0, count: 0 });
      setTenants(json.totalsByTenant || []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  const hasData = useMemo(() => months.length > 0 || tenants.length > 0, [months.length, tenants.length]);

  return (
    <div className="space-y-8">
      <div className="flex items-end justify-between gap-4">
        <div>
          <div className="text-[10px] font-black uppercase tracking-widest text-white/60">Relatórios</div>
          <h1 className="text-3xl md:text-4xl font-black tracking-tight">Recebimentos PIX</h1>
        </div>
        <button
          type="button"
          disabled={loading}
          onClick={() => load()}
          className="px-4 py-3 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 text-white font-black uppercase tracking-widest text-[10px] disabled:opacity-50"
        >
          Atualizar
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl">
          <div className="text-[10px] font-black uppercase tracking-widest text-red-400">{error}</div>
        </div>
      )}

      <div className="grid md:grid-cols-3 gap-4">
        <div className="rounded-[2rem] border border-white/10 bg-white/5 backdrop-blur-2xl p-6">
          <div className="text-[10px] font-black uppercase tracking-widest text-white/60">Recebido</div>
          <div className="mt-2 text-2xl font-black">R$ {Number(totals.paid).toFixed(2)}</div>
        </div>
        <div className="rounded-[2rem] border border-white/10 bg-white/5 backdrop-blur-2xl p-6">
          <div className="text-[10px] font-black uppercase tracking-widest text-white/60">Pendente</div>
          <div className="mt-2 text-2xl font-black">R$ {Number(totals.pending).toFixed(2)}</div>
        </div>
        <div className="rounded-[2rem] border border-white/10 bg-white/5 backdrop-blur-2xl p-6">
          <div className="text-[10px] font-black uppercase tracking-widest text-white/60">Cobranças</div>
          <div className="mt-2 text-2xl font-black">{totals.count}</div>
        </div>
      </div>

      <div className="rounded-[2.5rem] border border-white/10 bg-white/5 backdrop-blur-2xl p-8 overflow-x-auto">
        <div className="text-xs font-black uppercase tracking-widest text-white/70">Por mês</div>
        <table className="w-full mt-5 text-sm">
          <thead className="text-white/50">
            <tr className="text-left">
              <th className="py-3 pr-4">Mês</th>
              <th className="py-3 pr-4">Recebido</th>
              <th className="py-3 pr-4">Pendente</th>
              <th className="py-3 pr-0">Qtd</th>
            </tr>
          </thead>
          <tbody>
            {months.map((r) => (
              <tr key={r.month} className="border-t border-white/10">
                <td className="py-3 pr-4">{r.month}</td>
                <td className="py-3 pr-4">R$ {Number(r.paid).toFixed(2)}</td>
                <td className="py-3 pr-4">R$ {Number(r.pending).toFixed(2)}</td>
                <td className="py-3 pr-0">{r.count}</td>
              </tr>
            ))}
            {!loading && months.length === 0 && (
              <tr>
                <td colSpan={4} className="py-10 text-center text-white/50">
                  Sem dados
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="rounded-[2.5rem] border border-white/10 bg-white/5 backdrop-blur-2xl p-8 overflow-x-auto">
        <div className="text-xs font-black uppercase tracking-widest text-white/70">Por sindicato</div>
        <table className="w-full mt-5 text-sm">
          <thead className="text-white/50">
            <tr className="text-left">
              <th className="py-3 pr-4">Sindicato</th>
              <th className="py-3 pr-4">Subdomínio</th>
              <th className="py-3 pr-4">Recebido</th>
              <th className="py-3 pr-4">Pendente</th>
              <th className="py-3 pr-4">Qtd</th>
              <th className="py-3 pr-0">Último</th>
            </tr>
          </thead>
          <tbody>
            {tenants.map((t) => (
              <tr key={t.tenantId} className="border-t border-white/10">
                <td className="py-3 pr-4">{t.name}</td>
                <td className="py-3 pr-4">{t.subdomain}</td>
                <td className="py-3 pr-4">R$ {Number(t.paid).toFixed(2)}</td>
                <td className="py-3 pr-4">R$ {Number(t.pending).toFixed(2)}</td>
                <td className="py-3 pr-4">{t.count}</td>
                <td className="py-3 pr-0">{t.lastPaymentAt ? new Date(t.lastPaymentAt).toLocaleString("pt-BR") : "—"}</td>
              </tr>
            ))}
            {!loading && tenants.length === 0 && (
              <tr>
                <td colSpan={6} className="py-10 text-center text-white/50">
                  Sem dados
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {!loading && !hasData && (
        <div className="text-center text-white/50 text-sm">
          Sem dados de pagamentos ainda. Gere um PIX em Planos/Clientes para começar.
        </div>
      )}
    </div>
  );
}
