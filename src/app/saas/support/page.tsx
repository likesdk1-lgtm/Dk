"use client";

import React, { useEffect, useState } from "react";

type Ticket = {
  id: string;
  tenantId?: string | null;
  tenant?: { name: string; subdomain: string } | null;
  adminId?: string | null;
  subject: string;
  message: string;
  status: string;
  responseMessage?: string | null;
  createdAt: string;
  respondedAt?: string | null;
};

export default function Page() {
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [draftById, setDraftById] = useState<Record<string, { status: string; responseMessage: string }>>({});

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/saas/support", { cache: "no-store" });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error || "Erro ao carregar tickets");
        return;
      }
      const list: Ticket[] = json.tickets || [];
      setTickets(list);
      setDraftById((prev) => {
        const next = { ...prev };
        for (const t of list) {
          next[t.id] ||= { status: t.status || "OPEN", responseMessage: t.responseMessage || "" };
        }
        return next;
      });
    } finally {
      setLoading(false);
    }
  }

  async function saveTicket(id: string) {
    setSavingId(id);
    setError(null);
    try {
      const draft = draftById[id];
      const res = await fetch(`/api/saas/support/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: draft?.status,
          responseMessage: draft?.responseMessage,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error || "Erro ao salvar ticket");
        return;
      }
      setTickets((prev) => prev.map((t) => (t.id === id ? { ...t, ...json.ticket } : t)));
    } finally {
      setSavingId(null);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  return (
    <div className="space-y-8">
      <div className="flex items-end justify-between gap-4">
        <div>
          <div className="text-[10px] font-black uppercase tracking-widest text-white/60">Suporte</div>
          <h1 className="text-3xl md:text-4xl font-black tracking-tight">Atendimento aos sindicatos</h1>
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

      <div className="rounded-[2.5rem] border border-white/10 bg-white/5 backdrop-blur-2xl p-8 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-white/50">
            <tr className="text-left">
              <th className="py-3 pr-4">Sindicato</th>
              <th className="py-3 pr-4">Assunto</th>
              <th className="py-3 pr-4">Mensagem</th>
              <th className="py-3 pr-4">Status</th>
              <th className="py-3 pr-4">Resposta</th>
              <th className="py-3 pr-0 text-right">Ação</th>
            </tr>
          </thead>
          <tbody>
            {tickets.map((t) => {
              const draft = draftById[t.id] || { status: t.status, responseMessage: t.responseMessage || "" };
              return (
                <tr key={t.id} className="border-t border-white/10 align-top">
                  <td className="py-4 pr-4">
                    <div className="font-black text-white">{t.tenant?.name || "—"}</div>
                    <div className="text-[10px] text-emerald-400 font-bold">{t.tenant?.subdomain || t.tenantId}</div>
                    <div className="text-[10px] text-white/50 mt-1">{new Date(t.createdAt).toLocaleString("pt-BR")}</div>
                  </td>
                  <td className="py-4 pr-4 font-black">{t.subject}</td>
                  <td className="py-4 pr-4 text-white/80">{t.message}</td>
                  <td className="py-4 pr-4">
                    <select
                      value={draft.status}
                      onChange={(e) =>
                        setDraftById((p) => ({ ...p, [t.id]: { ...draft, status: e.target.value } }))
                      }
                      className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white"
                    >
                      <option value="OPEN">OPEN</option>
                      <option value="IN_PROGRESS">IN_PROGRESS</option>
                      <option value="RESOLVED">RESOLVED</option>
                    </select>
                  </td>
                  <td className="py-4 pr-4">
                    <textarea
                      rows={3}
                      value={draft.responseMessage}
                      onChange={(e) =>
                        setDraftById((p) => ({ ...p, [t.id]: { ...draft, responseMessage: e.target.value } }))
                      }
                      className="w-80 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white"
                    />
                  </td>
                  <td className="py-4 text-right">
                    <button
                      type="button"
                      disabled={savingId === t.id}
                      onClick={() => saveTicket(t.id)}
                      className="px-4 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black uppercase tracking-widest text-[10px] disabled:opacity-50"
                    >
                      {savingId === t.id ? "Salvando..." : "Salvar"}
                    </button>
                  </td>
                </tr>
              );
            })}
            {!loading && tickets.length === 0 && (
              <tr>
                <td colSpan={6} className="py-10 text-center text-white/50">
                  Sem tickets
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
