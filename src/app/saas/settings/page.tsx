"use client";

import React, { useEffect, useState } from "react";

type Settings = {
  efiClientId?: string | null;
  efiClientSecret?: string | null;
  efiPixKey?: string | null;
  efiSandbox?: boolean | null;
  efiCertificate?: string | null;
};

type SettingsForm = {
  efiClientId: string;
  efiClientSecret: string;
  efiPixKey: string;
  efiSandbox: boolean;
  efiCertificate: string;
};

export default function Page() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [form, setForm] = useState<SettingsForm>({
    efiClientId: "",
    efiClientSecret: "",
    efiPixKey: "",
    efiSandbox: true,
    efiCertificate: "",
  });

  async function load() {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch("/api/saas/settings", { cache: "no-store" });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error || "Erro ao carregar configurações");
        return;
      }
      const s: Settings = json.settings || {};
      setForm({
        efiClientId: s.efiClientId || "",
        efiClientSecret: s.efiClientSecret || "",
        efiPixKey: s.efiPixKey || "",
        efiSandbox: typeof s.efiSandbox === "boolean" ? s.efiSandbox : true,
        efiCertificate: s.efiCertificate || "",
      });
    } finally {
      setLoading(false);
    }
  }

  async function save() {
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch("/api/saas/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          efiClientId: form.efiClientId,
          efiClientSecret: form.efiClientSecret,
          efiPixKey: form.efiPixKey,
          efiCertificate: form.efiCertificate,
          efiSandbox: form.efiSandbox,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error || "Erro ao salvar configurações");
        return;
      }
      setSuccess("Configurações salvas");
    } finally {
      setSaving(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <div className="text-[10px] font-black uppercase tracking-widest text-white/60">Integração PIX (Efí)</div>
        <h1 className="text-3xl md:text-4xl font-black tracking-tight">Configurações</h1>
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl">
          <div className="text-[10px] font-black uppercase tracking-widest text-red-400">{error}</div>
        </div>
      )}
      {success && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl">
          <div className="text-[10px] font-black uppercase tracking-widest text-emerald-300">{success}</div>
        </div>
      )}

      <div className="rounded-[2.5rem] border border-white/10 bg-white/5 backdrop-blur-2xl p-8 space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="text-[10px] font-black text-white/60 uppercase tracking-widest">Client ID</label>
            <input
              value={form.efiClientId}
              onChange={(e) => setForm((p) => ({ ...p, efiClientId: e.target.value }))}
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white"
              disabled={loading}
            />
          </div>
          <div>
            <label className="text-[10px] font-black text-white/60 uppercase tracking-widest">Client Secret</label>
            <input
              value={form.efiClientSecret}
              onChange={(e) => setForm((p) => ({ ...p, efiClientSecret: e.target.value }))}
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white"
              disabled={loading}
            />
          </div>
          <div>
            <label className="text-[10px] font-black text-white/60 uppercase tracking-widest">PIX Key</label>
            <input
              value={form.efiPixKey}
              onChange={(e) => setForm((p) => ({ ...p, efiPixKey: e.target.value }))}
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white"
              disabled={loading}
            />
          </div>
          <div>
            <label className="text-[10px] font-black text-white/60 uppercase tracking-widest">Sandbox</label>
            <select
              value={String(form.efiSandbox)}
              onChange={(e) => setForm((p) => ({ ...p, efiSandbox: e.target.value === "true" }))}
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white"
              disabled={loading}
            >
              <option value="true">true</option>
              <option value="false">false</option>
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="text-[10px] font-black text-white/60 uppercase tracking-widest">Certificado (.p12 Base64)</label>
            <textarea
              rows={6}
              value={form.efiCertificate}
              onChange={(e) => setForm((p) => ({ ...p, efiCertificate: e.target.value }))}
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white"
              disabled={loading}
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            disabled={loading || saving}
            onClick={() => save()}
            className="px-6 py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black uppercase tracking-widest text-xs disabled:opacity-50"
          >
            {saving ? "Salvando..." : "Salvar"}
          </button>
          <button
            type="button"
            disabled={loading || saving}
            onClick={() => load()}
            className="px-6 py-4 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 text-white font-black uppercase tracking-widest text-xs disabled:opacity-50"
          >
            Recarregar
          </button>
        </div>
      </div>
    </div>
  );
}
