"use client";

import React, { useEffect, useMemo, useState } from "react";

type TenantStat = {
  tenantId: string;
  name: string;
  subdomain: string;
  status: string;
  billingStatus: string | null;
  adminsCount: number;
  membersCount: number;
  revenueByMonth: Record<string, number>;
  totalPaid: number;
  lastPaymentAt: string | null;
  lastUpdate: string;
};

export default function Page() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [months, setMonths] = useState<string[]>([]);
  const [stats, setStats] = useState<TenantStat[]>([]);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/saas/tenants/stats", { cache: "no-store" });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error || "Erro ao carregar evolução");
        return;
      }
      setMonths(json.months || []);
      setStats(json.stats || []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
    
    // Atualização em tempo real a cada 30 segundos
    const interval = setInterval(() => {
      void load();
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const currentMonth = months[months.length - 1];
  const totalMembers = useMemo(() => stats.reduce((acc, s) => acc + (s.membersCount || 0), 0), [stats]);
  const totalReceivedThisMonth = useMemo(() => {
    if (!currentMonth) return 0;
    return stats.reduce((acc, s) => acc + Number(s.revenueByMonth?.[currentMonth] || 0), 0);
  }, [stats, currentMonth]);

  const maxMonthValue = useMemo(() => {
    let max = 0;
    for (const s of stats) {
      for (const m of months) {
        max = Math.max(max, Number(s.revenueByMonth?.[m] || 0));
      }
    }
    return max || 1;
  }, [stats, months]);

  return (
    <div className="space-y-8">
      <div className="flex items-end justify-between gap-4">
        <div>
          <div className="text-[10px] font-black uppercase tracking-widest text-white/60">Evolução</div>
          <h1 className="text-3xl md:text-4xl font-black tracking-tight">Dashboard de evolução</h1>
          <div className="mt-2 text-sm text-white/60">
            Associados e recebimentos por mês (por sindicato)
          </div>
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
          <div className="text-[10px] font-black uppercase tracking-widest text-white/60">Sindicatos</div>
          <div className="mt-2 text-3xl font-black">{stats.length}</div>
        </div>
        <div className="rounded-[2rem] border border-white/10 bg-white/5 backdrop-blur-2xl p-6">
          <div className="text-[10px] font-black uppercase tracking-widest text-white/60">Associados</div>
          <div className="mt-2 text-3xl font-black">{totalMembers}</div>
        </div>
        <div className="rounded-[2rem] border border-white/10 bg-white/5 backdrop-blur-2xl p-6">
          <div className="text-[10px] font-black uppercase tracking-widest text-white/60">Recebido (mês)</div>
          <div className="mt-2 text-3xl font-black">R$ {totalReceivedThisMonth.toFixed(2)}</div>
          <div className="mt-1 text-[10px] text-white/50">{currentMonth || "—"}</div>
        </div>
      </div>

      <div className="rounded-[2.5rem] border border-white/10 bg-white/5 backdrop-blur-2xl p-8 overflow-x-auto">
        <div className="text-xs font-black uppercase tracking-widest text-white/70">Recebimentos por sindicato</div>
        <table className="w-full mt-5 text-sm">
          <thead className="text-white/50">
            <tr className="text-left">
              <th className="py-3 pr-4">Sindicato</th>
              <th className="py-3 pr-4">Subdomínio</th>
              <th className="py-3 pr-4">Cobrança</th>
              <th className="py-3 pr-4">Associados</th>
              <th className="py-3 pr-4">Recebido (mês)</th>
              <th className="py-3 pr-4">Evolução (6m)</th>
              <th className="py-3 pr-0">Atualizado</th>
            </tr>
          </thead>
          <tbody>
            {stats.map((s) => {
              const current = currentMonth ? Number(s.revenueByMonth?.[currentMonth] || 0) : 0;
              return (
                <tr key={s.tenantId} className="border-t border-white/10">
                  <td className="py-4 pr-4 font-black">{s.name}</td>
                  <td className="py-4 pr-4">{s.subdomain}</td>
                  <td className="py-4 pr-4">{s.billingStatus || "—"}</td>
                  <td className="py-4 pr-4">{s.membersCount ?? 0}</td>
                  <td className="py-4 pr-4">R$ {current.toFixed(2)}</td>
                  <td className="py-4 pr-4">
                    <div className="flex items-end gap-1 h-8">
                      {months.map((m) => {
                        const v = Number(s.revenueByMonth?.[m] || 0);
                        const h = Math.max(2, Math.round((v / maxMonthValue) * 32));
                        return (
                          <div
                            key={m}
                            title={`${m}: R$ ${v.toFixed(2)}`}
                            className="w-2 rounded bg-emerald-500/70"
                            style={{ height: h }}
                          />
                        );
                      })}
                    </div>
                  </td>
                  <td className="py-4 pr-0">{new Date(s.lastUpdate).toLocaleString("pt-BR")}</td>
                </tr>
              );
            })}
            {!loading && stats.length === 0 && (
              <tr>
                <td colSpan={7} className="py-10 text-center text-white/50">
                  Sem dados
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
