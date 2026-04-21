"use client";

import React, { useEffect, useState } from "react";
import { Copy, CreditCard, RefreshCw } from "lucide-react";

type Plan = { name: string } | null;
type Subscription = {
  status: string;
  trialEndsAt?: string | null;
  currentPeriodEndsAt?: string | null;
  plan?: Plan;
} | null;

type Payment = {
  id: string;
  amount: number;
  status: string;
  createdAt: string;
  pixCode?: string | null;
  pixUrl?: string | null;
};

export default function Page() {
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [subscription, setSubscription] = useState<Subscription>(null);
  const [billingStatus, setBillingStatus] = useState<string | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [pendingPayment, setPendingPayment] = useState<Payment | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/plan", { cache: "no-store" });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error || "Erro ao carregar plano");
        return;
      }
      setSubscription(json.subscription || null);
      setBillingStatus(json.billingStatus || null);
      setPayments(json.payments || []);
      setPendingPayment(json.pendingPayment || null);
    } finally {
      setLoading(false);
    }
  }

  async function createPayment() {
    setCreating(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/plan/create-payment", { method: "POST" });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error || "Erro ao gerar PIX");
        return;
      }
      await load();
    } finally {
      setCreating(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  return (
    <div className="space-y-8">
      <div className="flex items-end justify-between gap-4">
        <div>
          <div className="text-[10px] font-black uppercase tracking-widest text-white/60">Plano</div>
          <h1 className="text-3xl md:text-4xl font-black tracking-tight">Assinatura do sindicato</h1>
        </div>
        <button
          type="button"
          onClick={() => load()}
          className="px-4 py-3 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 text-white font-black uppercase tracking-widest text-[10px] inline-flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Atualizar
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl">
          <div className="text-[10px] font-black uppercase tracking-widest text-red-400">{error}</div>
        </div>
      )}

      <div className="rounded-[2.5rem] border border-white/10 bg-white/5 backdrop-blur-2xl p-8">
        <div className="grid md:grid-cols-4 gap-6 items-start">
          <div>
            <div className="text-xs text-white/60 font-black uppercase tracking-widest">Plano</div>
            <div className="mt-2 text-xl font-black">{subscription?.plan?.name || "—"}</div>
          </div>
          <div>
            <div className="text-xs text-white/60 font-black uppercase tracking-widest">Assinatura</div>
            <div className="mt-2 text-xl font-black">{subscription?.status || "—"}</div>
          </div>
          <div>
            <div className="text-xs text-white/60 font-black uppercase tracking-widest">Cobrança</div>
            <div className="mt-2 text-xl font-black">{billingStatus || "—"}</div>
          </div>
          <div className="md:text-right">
            <button
              type="button"
              disabled={loading || creating}
              onClick={() => createPayment()}
              className="px-6 py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black uppercase tracking-widest text-xs inline-flex items-center gap-2 disabled:opacity-50"
            >
              <CreditCard className="w-4 h-4" />
              {creating ? "Gerando..." : "Gerar PIX (PRO)"}
            </button>
          </div>
        </div>
      </div>

      {pendingPayment?.pixCode && pendingPayment?.pixUrl && (
        <div className="rounded-[2.5rem] border border-blue-500/20 bg-blue-500/10 backdrop-blur-2xl p-8">
          <div className="text-xs font-black uppercase tracking-widest text-blue-200">Pagamento pendente (PIX)</div>
          <div className="mt-5 grid md:grid-cols-2 gap-6">
            <div className="rounded-2xl bg-[#020617]/40 border border-white/10 p-4">
              <div className="text-[10px] font-black uppercase tracking-widest text-white/60">Copia e cola</div>
              <div className="mt-2 text-xs text-white/70 break-all">{pendingPayment.pixCode}</div>
              <button
                type="button"
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(pendingPayment.pixCode || "");
                  } catch {}
                }}
                className="mt-4 px-4 py-3 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/10 text-white font-black uppercase tracking-widest text-[10px] inline-flex items-center gap-2"
              >
                <Copy className="w-4 h-4" />
                Copiar
              </button>
            </div>
            <div className="rounded-2xl bg-[#020617]/40 border border-white/10 p-4">
              <div className="text-[10px] font-black uppercase tracking-widest text-white/60">QR Code</div>
              <div className="mt-3 rounded-xl overflow-hidden bg-white/5 border border-white/10 flex items-center justify-center p-3">
                <img alt="QR Code PIX" src={pendingPayment.pixUrl} className="max-w-full h-auto" />
              </div>
              <div className="mt-4 text-[10px] font-bold uppercase tracking-widest text-white/50">
                Após pagar, a assinatura ativa automaticamente via webhook Efí.
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="rounded-[2.5rem] border border-white/10 bg-white/5 backdrop-blur-2xl p-8 overflow-x-auto">
        <div className="text-xs font-black uppercase tracking-widest text-white/70">Histórico de pagamentos</div>
        <table className="w-full mt-5 text-sm">
          <thead className="text-white/50">
            <tr className="text-left">
              <th className="py-3 pr-4">Valor</th>
              <th className="py-3 pr-4">Status</th>
              <th className="py-3 pr-4">Criado</th>
              <th className="py-3 pr-0">PIX</th>
            </tr>
          </thead>
          <tbody>
            {payments.map((p) => (
              <tr key={p.id} className="border-t border-white/10">
                <td className="py-3 pr-4">R$ {Number(p.amount).toFixed(2)}</td>
                <td className="py-3 pr-4">{p.status}</td>
                <td className="py-3 pr-4">{new Date(p.createdAt).toLocaleString("pt-BR")}</td>
                <td className="py-3 pr-0">{p.pixCode ? "Gerado" : "—"}</td>
              </tr>
            ))}
            {payments.length === 0 && (
              <tr>
                <td colSpan={4} className="py-10 text-center text-white/50">
                  Nenhum pagamento
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
