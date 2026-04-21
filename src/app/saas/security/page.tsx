"use client";

import React, { useEffect, useMemo, useState } from "react";

type Tenant = { id: string; name: string; subdomain: string };
type SecurityEvent = {
  id: string;
  tenantId: string | null;
  portal: string;
  action: string;
  ipAddress: string | null;
  userAgent: string | null;
  device: string | null;
  location: string | null;
  actorRole: string | null;
  actorId: string | null;
  details: string | null;
  createdAt: string;
};

export default function Page() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [events, setEvents] = useState<SecurityEvent[]>([]);
  const [tenantId, setTenantId] = useState("");
  const [portal, setPortal] = useState("");
  const [action, setAction] = useState("");

  async function loadTenants() {
    const res = await fetch("/saas/tenants/data", { cache: "no-store" });
    const json = await res.json();
    if (res.ok) {
      setTenants((json.tenants || []).map((t: any) => ({ id: t.id, name: t.name, subdomain: t.subdomain })));
    }
  }

  async function loadEvents() {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (tenantId) params.set("tenantId", tenantId);
      if (portal) params.set("portal", portal);
      if (action) params.set("action", action.toUpperCase());
      params.set("limit", "200");
      const res = await fetch(`/api/saas/security?${params.toString()}`, { cache: "no-store" });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error || "Erro ao carregar logs");
        return;
      }
      setEvents(json.events || []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadTenants();
    void loadEvents();
  }, []);

  const tenantNameById = useMemo(() => {
    const map: Record<string, string> = {};
    for (const t of tenants) map[t.id] = `${t.name} (${t.subdomain})`;
    return map;
  }, [tenants]);

  return (
    <div className="space-y-8">
      <div className="flex items-end justify-between gap-4">
        <div>
          <div className="text-[10px] font-black uppercase tracking-widest text-white/60">Auditoria</div>
          <h1 className="text-3xl md:text-4xl font-black tracking-tight">Logs de segurança</h1>
          <div className="mt-2 text-sm text-white/60">Login e ações administrativas para auditoria futura</div>
        </div>
        <button
          type="button"
          disabled={loading}
          onClick={() => loadEvents()}
          className="px-4 py-3 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 text-white font-black uppercase tracking-widest text-[10px] disabled:opacity-50"
        >
          Atualizar
        </button>
      </div>

      <div className="rounded-[2.5rem] border border-white/10 bg-white/5 backdrop-blur-2xl p-8 space-y-6">
        <div className="grid md:grid-cols-3 gap-6">
          <div>
            <div className="text-[10px] font-black uppercase tracking-widest text-white/60">Sindicato</div>
            <select
              value={tenantId}
              onChange={(e) => setTenantId(e.target.value)}
              className="mt-2 w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white"
            >
              <option value="">Todos</option>
              {tenants.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} ({t.subdomain})
                </option>
              ))}
            </select>
          </div>
          <div>
            <div className="text-[10px] font-black uppercase tracking-widest text-white/60">Portal</div>
            <select
              value={portal}
              onChange={(e) => setPortal(e.target.value)}
              className="mt-2 w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white"
            >
              <option value="">Todos</option>
              <option value="SAAS">SAAS</option>
              <option value="ADMIN">ADMIN</option>
              <option value="PORTAL">PORTAL</option>
              <option value="PARTNER">PARTNER</option>
            </select>
          </div>
          <div>
            <div className="text-[10px] font-black uppercase tracking-widest text-white/60">Ação</div>
            <input
              value={action}
              onChange={(e) => setAction(e.target.value)}
              placeholder="ex: LOGIN_SUCCESS"
              className="mt-2 w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white"
            />
          </div>
        </div>

        <button
          type="button"
          onClick={() => loadEvents()}
          className="px-6 py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black uppercase tracking-widest text-xs"
        >
          Aplicar filtros
        </button>

        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl">
            <div className="text-[10px] font-black uppercase tracking-widest text-red-400">{error}</div>
          </div>
        )}
      </div>

      <div className="rounded-[2.5rem] border border-white/10 bg-white/5 backdrop-blur-2xl p-8 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-white/50">
            <tr className="text-left">
              <th className="py-3 pr-4">Data</th>
              <th className="py-3 pr-4">Sindicato</th>
              <th className="py-3 pr-4">Portal</th>
              <th className="py-3 pr-4">Ação</th>
              <th className="py-3 pr-4">IP</th>
              <th className="py-3 pr-4">Dispositivo</th>
              <th className="py-3 pr-4">Role</th>
              <th className="py-3 pr-0">Detalhes</th>
            </tr>
          </thead>
          <tbody>
            {events.map((e) => (
              <tr key={e.id} className="border-t border-white/10 align-top">
                <td className="py-4 pr-4 whitespace-nowrap">{new Date(e.createdAt).toLocaleString("pt-BR")}</td>
                <td className="py-4 pr-4">{e.tenantId ? tenantNameById[e.tenantId] || e.tenantId : "—"}</td>
                <td className="py-4 pr-4">{e.portal}</td>
                <td className="py-4 pr-4 font-black">{e.action}</td>
                <td className="py-4 pr-4">{e.ipAddress || "—"}</td>
                <td className="py-4 pr-4">{e.device || "—"}</td>
                <td className="py-4 pr-4">{e.actorRole || "—"}</td>
                <td className="py-4 pr-0">
                  <div className="text-white/80">{e.details || "—"}</div>
                  {e.userAgent && <div className="mt-1 text-[10px] text-white/40 break-all">{e.userAgent}</div>}
                </td>
              </tr>
            ))}
            {!loading && events.length === 0 && (
              <tr>
                <td colSpan={8} className="py-10 text-center text-white/50">
                  Sem logs
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

