"use client";

import React, { useMemo, useState } from "react";
import { Plus, Trash2 } from "lucide-react";

type Plan = {
  id: string;
  code: string;
  name: string;
  price: number;
  currency: string;
  interval: string;
  status: string;
};

export function PlansClient({ initialPlans }: { initialPlans: Plan[] }) {
  const [plans, setPlans] = useState<Plan[]>(initialPlans);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const proSuggestion = useMemo(() => ({ code: "PRO", name: "Profissional", price: 199 }), []);

  async function refresh() {
    const res = await fetch("/api/saas/plans", { cache: "no-store" });
    const json = await res.json();
    if (res.ok) setPlans(json.plans || []);
  }

  async function createPlan(payload: { code: string; name: string; price: number }) {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/saas/plans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error || "Erro ao criar plano");
        return;
      }
      await refresh();
    } finally {
      setLoading(false);
    }
  }

  async function removePlan(id: string) {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/saas/plans/${id}`, { method: "DELETE" });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error || "Erro ao remover plano");
        return;
      }
      setPlans((prev) => prev.filter((p) => p.id !== id));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-[2.5rem] border border-white/10 bg-white/5 backdrop-blur-2xl p-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="text-[10px] font-black uppercase tracking-widest text-white/60">Criar plano</div>
            <div className="mt-2 text-sm text-white/70">
              Sugestão rápida para seu SaaS (cobrança via PIX Efí): {proSuggestion.name} • R$ {proSuggestion.price}/mês
            </div>
          </div>
          <button
            type="button"
            disabled={loading}
            onClick={() => createPlan(proSuggestion)}
            className="px-6 py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Plus className="w-4 h-4" />
            Criar PRO
          </button>
        </div>

        {error && (
          <div className="mt-5 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl">
            <div className="text-[10px] font-black uppercase tracking-widest text-red-400">{error}</div>
          </div>
        )}
      </div>

      <div className="rounded-[2.5rem] border border-white/10 bg-white/5 backdrop-blur-2xl p-8 overflow-x-auto">
        <div className="text-xs font-black uppercase tracking-widest text-white/70">Planos cadastrados</div>
        <table className="w-full mt-5 text-sm">
          <thead className="text-white/50">
            <tr className="text-left">
              <th className="py-3 pr-4">Código</th>
              <th className="py-3 pr-4">Nome</th>
              <th className="py-3 pr-4">Preço</th>
              <th className="py-3 pr-4">Status</th>
              <th className="py-3 pr-0 text-right">Ações</th>
            </tr>
          </thead>
          <tbody>
            {plans.map((p) => (
              <tr key={p.id} className="border-t border-white/10">
                <td className="py-4 pr-4 font-black">{p.code}</td>
                <td className="py-4 pr-4">{p.name}</td>
                <td className="py-4 pr-4">
                  {p.currency} {p.price.toFixed(2)} / {p.interval}
                </td>
                <td className="py-4 pr-4">{p.status}</td>
                <td className="py-4 text-right">
                  <button
                    type="button"
                    disabled={loading}
                    onClick={() => removePlan(p.id)}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-white font-black uppercase tracking-widest text-[10px] disabled:opacity-50"
                  >
                    <Trash2 className="w-4 h-4" />
                    Excluir
                  </button>
                </td>
              </tr>
            ))}
            {plans.length === 0 && (
              <tr>
                <td colSpan={5} className="py-10 text-center text-white/50">
                  Nenhum plano cadastrado
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

