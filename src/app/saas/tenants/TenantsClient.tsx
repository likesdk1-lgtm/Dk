"use client";

import React, { useState } from "react";
import { Copy, CreditCard, Edit, FileText, Search } from "lucide-react";

type TenantRow = {
  id: string;
  name: string;
  cnpj: string;
  subdomain: string;
  status: string;
  subscriptionStatus: string | null;
  billingStatus: string | null;
  createdAt?: string;
};

export function TenantsClient({ initialTenants }: { initialTenants: TenantRow[] }) {
  const [tenants, setTenants] = useState<TenantRow[]>(initialTenants);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [pixByTenant, setPixByTenant] = useState<Record<string, { pixCode: string; pixUrl: string }>>({});
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingTenant, setEditingTenant] = useState<TenantRow | null>(null);
  const [savingEdit, setSavingEdit] = useState(false);

  const filteredTenants = tenants.filter(t => 
    t.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    t.subdomain.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.cnpj.includes(searchTerm)
  );

  async function handleUpdateTenant() {
    if (!editingTenant) return;
    setSavingEdit(true);
    try {
      const res = await fetch(`/api/saas/tenants/${editingTenant.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingTenant),
      });
      if (res.ok) {
        setEditingTenant(null);
        await refresh();
      }
    } catch (err) {
      alert("Erro ao salvar");
    } finally {
      setSavingEdit(false);
    }
  }

  async function refresh() {
    const res = await fetch("/saas/tenants/data", { cache: "no-store" });
    if (!res.ok) return;
    const json = await res.json();
    setTenants(json.tenants || []);
  }

  async function createPayment(tenantId: string) {
    setLoadingId(tenantId);
    setError(null);
    try {
      const res = await fetch("/api/saas/subscriptions/create-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tenantId, planCode: "PRO" }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error || "Erro ao gerar PIX");
        return;
      }
      setPixByTenant((prev) => ({
        ...prev,
        [tenantId]: { pixCode: json.pixCode, pixUrl: json.pixUrl },
      }));
      await refresh();
    } finally {
      setLoadingId(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-white uppercase tracking-tighter leading-none">Clientes</h1>
          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-2">Gestão de Sindicatos e Assinaturas</p>
        </div>
        <div className="w-full md:w-96 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder="Buscar por nome, CNPJ ou subdomínio..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-6 py-4 bg-white/5 border border-white/10 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none text-white font-bold transition-all text-sm"
          />
        </div>
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
              <th className="py-3 pr-4 text-[10px] font-black uppercase tracking-widest">Sindicato</th>
              <th className="py-3 pr-4 text-[10px] font-black uppercase tracking-widest">Acesso</th>
              <th className="py-3 pr-4 text-[10px] font-black uppercase tracking-widest">Status</th>
              <th className="py-3 pr-4 text-[10px] font-black uppercase tracking-widest">Financeiro</th>
              <th className="py-3 pr-0 text-right text-[10px] font-black uppercase tracking-widest">Ações</th>
            </tr>
          </thead>
          <tbody>
            {filteredTenants.map((t) => {
              const pix = pixByTenant[t.id];
              return (
                <React.Fragment key={t.id}>
                  <tr className="border-t border-white/10 group hover:bg-white/[0.02] transition-colors">
                    <td className="py-6 pr-4">
                      <div className="font-black text-white uppercase tracking-tight">{t.name}</div>
                      <div className="text-[10px] text-white/40 font-bold">{t.cnpj}</div>
                    </td>
                    <td className="py-6 pr-4">
                      <div className="text-emerald-400 font-black text-xs">{t.subdomain}.dksind.tech</div>
                    </td>
                    <td className="py-6 pr-4">
                      <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${
                        t.status === "ACTIVE" ? "bg-emerald-500/10 text-emerald-500" : "bg-rose-500/10 text-rose-500"
                      }`}>
                        {t.status === "ACTIVE" ? "Ativo" : "Bloqueado"}
                      </span>
                    </td>
                    <td className="py-6 pr-4">
                      <div className="flex flex-col gap-1">
                        <span className="text-[10px] font-bold text-white/60 uppercase">{t.subscriptionStatus || "TRIAL"}</span>
                        <span className={`text-[9px] font-black uppercase ${
                          t.billingStatus === "PAID" ? "text-emerald-500" : "text-amber-500"
                        }`}>
                          {t.billingStatus === "PAID" ? "Em dia" : "Pendente"}
                        </span>
                      </div>
                    </td>
                    <td className="py-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          title="Gerar Cobrança PIX"
                          disabled={loadingId === t.id}
                          onClick={() => createPayment(t.id)}
                          className="p-3 rounded-xl bg-emerald-600/10 text-emerald-500 hover:bg-emerald-600 hover:text-white transition-all border border-emerald-500/20"
                        >
                          <CreditCard className="w-4 h-4" />
                        </button>
                        <button
                          title="Editar Sindicato"
                          onClick={() => setEditingTenant(t)}
                          className="p-3 rounded-xl bg-blue-600/10 text-blue-500 hover:bg-blue-600 hover:text-white transition-all border border-blue-500/20"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          title="Gerar Contrato de Serviço"
                          onClick={() => alert("Gerando contrato de serviço para " + t.name)}
                          className="p-3 rounded-xl bg-white/5 text-white/60 hover:bg-white/10 hover:text-white transition-all border border-white/10"
                        >
                          <FileText className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                  {pix && (
                    <tr className="border-t border-white/10">
                      <td colSpan={6} className="py-4">
                        <div className="grid md:grid-cols-2 gap-4">
                          <div className="rounded-2xl bg-[#020617]/40 border border-white/10 p-4">
                            <div className="text-[10px] font-black uppercase tracking-widest text-white/60">Copia e cola</div>
                            <div className="mt-2 text-xs text-white/70 break-all">{pix.pixCode}</div>
                            <button
                              type="button"
                              onClick={async () => {
                                try {
                                  await navigator.clipboard.writeText(pix.pixCode);
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
                              <img alt="QR Code PIX" src={pix.pixUrl} className="max-w-full h-auto" />
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
            {tenants.length === 0 && (
              <tr>
                <td colSpan={6} className="py-10 text-center text-white/50">
                  Nenhum cliente cadastrado
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Edit Modal */}
      {editingTenant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-[#020617]/90 backdrop-blur-xl">
          <div className="w-full max-w-lg bg-white/5 border border-white/10 rounded-[2.5rem] p-10 shadow-2xl space-y-8">
            <h2 className="text-2xl font-black text-white uppercase tracking-tighter">Editar Sindicato</h2>
            
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-4">Nome do Sindicato</label>
                <input
                  value={editingTenant.name}
                  onChange={(e) => setEditingTenant({ ...editingTenant, name: e.target.value })}
                  className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-white font-bold outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-4">Subdomínio</label>
                <input
                  value={editingTenant.subdomain}
                  onChange={(e) => setEditingTenant({ ...editingTenant, subdomain: e.target.value.toLowerCase() })}
                  className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-white font-bold outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-4">Status</label>
                <select
                  value={editingTenant.status}
                  onChange={(e) => setEditingTenant({ ...editingTenant, status: e.target.value })}
                  className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-white font-bold outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="ACTIVE" className="bg-[#020617]">Ativo</option>
                  <option value="BLOCKED" className="bg-[#020617]">Bloqueado</option>
                </select>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => setEditingTenant(null)}
                className="flex-1 py-4 rounded-2xl border border-white/10 text-white font-black uppercase tracking-widest text-[10px] hover:bg-white/5"
              >
                Cancelar
              </button>
              <button
                disabled={savingEdit}
                onClick={handleUpdateTenant}
                className="flex-1 py-4 bg-blue-600 text-white font-black rounded-2xl uppercase tracking-widest text-[10px] hover:bg-blue-500 disabled:opacity-50"
              >
                {savingEdit ? "Salvando..." : "Salvar Alterações"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
