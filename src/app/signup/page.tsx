"use client";
import React, { useMemo, useState } from "react";
import { BadgeCheck, Copy, CreditCard, Sparkles } from "lucide-react";

function SignupForm() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<{
    subdomain: string;
    trialEndsAt?: string;
    pixCode?: string;
    pixUrl?: string;
  } | null>(null);
  const [planCode, setPlanCode] = useState<"TRIAL" | "PRO">("TRIAL");
  const planPriceLabel = useMemo(() => (planCode === "PRO" ? "R$ 199/mês" : "R$ 0 (Teste)"), [planCode]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setSuccess(null);
    setError(null);
    const form = e.currentTarget;
    const formData = new FormData(form);
    let rawSub = String(formData.get("subdomain") || "");
    let subdomain = rawSub.trim().toLowerCase();
    subdomain = subdomain.replace(/^https?:\/\//, "");
    if (subdomain.includes("/")) subdomain = subdomain.split("/")[0];
    if (subdomain.includes(".")) subdomain = subdomain.split(".")[0];
    subdomain = subdomain.replace(/[^a-z0-9-]/g, "");
    if (subdomain.length < 3 || subdomain.length > 30) {
      setError("Subdomínio inválido. Use apenas letras minúsculas, números e hífen (3-30).");
      setLoading(false);
      return;
    }
    const payload = {
      companyName: String(formData.get("companyName") || ""),
      cnpj: String(formData.get("cnpj") || ""),
      subdomain,
      adminName: String(formData.get("adminName") || ""),
      adminCpf: String(formData.get("adminCpf") || ""),
      adminPassword: String(formData.get("adminPassword") || ""),
      planCode,
    };
    try {
      const res = await fetch("/api/public/tenant-signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error || "Erro ao cadastrar");
      } else {
        setSuccess({
          subdomain: json.subdomain,
          trialEndsAt: json.trialEndsAt,
          pixCode: json.pixCode,
          pixUrl: json.pixUrl,
        });
      }
    } catch (err: any) {
      setError("Erro inesperado");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#020617] p-6 font-sans relative overflow-hidden">
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-[520px] h-[520px] bg-emerald-500/20 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-[520px] h-[520px] bg-blue-500/20 rounded-full blur-[120px] animate-pulse delay-700" />
      </div>

      <div className="max-w-5xl w-full relative z-10 grid lg:grid-cols-2 gap-6">
        <div className="bg-white/5 backdrop-blur-2xl p-10 rounded-[3rem] border border-white/10 shadow-2xl space-y-8">
          <div className="space-y-4">
            <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-blue-600 rounded-3xl flex items-center justify-center shadow-xl shadow-emerald-500/20">
              <Sparkles className="w-10 h-10 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-white uppercase tracking-tighter">Criar teste grátis</h1>
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">SUBDOMÍNIO + PRIMEIRO ADMIN</p>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setPlanCode("TRIAL")}
              className={`text-left p-5 rounded-3xl border transition-all ${
                planCode === "TRIAL"
                  ? "border-emerald-500/40 bg-emerald-500/10"
                  : "border-white/10 bg-white/5 hover:bg-white/10"
              }`}
            >
              <div className="text-[10px] font-black uppercase tracking-widest text-white/60">Plano</div>
              <div className="mt-1 text-lg font-black text-white">Teste</div>
              <div className="mt-2 text-xs text-white/60">R$ 0 • 7 dias</div>
              <div className="mt-3 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-emerald-300">
                <BadgeCheck className="w-3 h-3" />
                Recomendado para começar
              </div>
            </button>
            <button
              type="button"
              onClick={() => setPlanCode("PRO")}
              className={`text-left p-5 rounded-3xl border transition-all ${
                planCode === "PRO"
                  ? "border-blue-500/40 bg-blue-500/10"
                  : "border-white/10 bg-white/5 hover:bg-white/10"
              }`}
            >
              <div className="text-[10px] font-black uppercase tracking-widest text-white/60">Plano</div>
              <div className="mt-1 text-lg font-black text-white">Profissional</div>
              <div className="mt-2 text-xs text-white/60">R$ 199/mês</div>
              <div className="mt-3 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-blue-300">
                <CreditCard className="w-3 h-3" />
                Pagamento via PIX Efí
              </div>
            </button>
          </div>

          <form onSubmit={onSubmit} className="space-y-5">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-4">Empresa</label>
                <input
                  name="companyName"
                  required
                  className="w-full px-6 py-5 bg-white/5 border border-white/10 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none text-white font-bold transition-all"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-4">CNPJ</label>
                <input
                  name="cnpj"
                  required
                  className="w-full px-6 py-5 bg-white/5 border border-white/10 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none text-white font-bold transition-all"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-4">Subdomínio Personalizado</label>
              <div className="flex items-center">
                <input
                  name="subdomain"
                  required
                  placeholder="ex: sindicato-elite"
                  className="flex-1 px-6 py-5 bg-white/5 border border-white/10 rounded-l-2xl focus:ring-2 focus:ring-emerald-500 outline-none text-white font-bold transition-all text-right"
                />
                <div className="px-6 py-5 bg-white/10 border border-white/10 border-l-0 rounded-r-2xl text-emerald-400 font-black text-sm uppercase tracking-tighter">
                  .dksind.tech
                </div>
              </div>
              <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest ml-4 mt-2">
                {planPriceLabel} • Escolha um nome exclusivo para seu portal
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-4">Admin (nome)</label>
                <input
                  name="adminName"
                  required
                  className="w-full px-6 py-5 bg-white/5 border border-white/10 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none text-white font-bold transition-all"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-4">Admin (CPF)</label>
                <input
                  name="adminCpf"
                  required
                  className="w-full px-6 py-5 bg-white/5 border border-white/10 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none text-white font-bold transition-all"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-4">Senha do Admin</label>
              <input
                name="adminPassword"
                type="password"
                required
                className="w-full px-6 py-5 bg-white/5 border border-white/10 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none text-white font-bold transition-all"
              />
            </div>

            {error && (
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl">
                <p className="text-red-500 text-[10px] font-bold uppercase tracking-widest">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-6 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-2xl shadow-xl shadow-emerald-900/40 transition-all uppercase tracking-widest text-[10px] flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50"
            >
              {loading ? "Provisionando..." : "Criar meu ambiente"}
            </button>
          </form>

          <div className="text-center pt-2">
            <a href="/login" className="text-[10px] font-bold text-gray-600 hover:text-white uppercase tracking-widest transition-colors">
              Já tenho conta — entrar
            </a>
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-2xl p-10 rounded-[3rem] border border-white/10 shadow-2xl">
          <div className="text-[10px] font-black uppercase tracking-widest text-white/60">Status do provisionamento</div>
          {!success ? (
            <div className="mt-6 space-y-4 text-white/70">
              <div className="rounded-3xl border border-white/10 bg-[#020617]/30 p-6">
                <div className="text-xs font-black uppercase tracking-widest text-white/70">O que você recebe</div>
                <div className="mt-4 space-y-3 text-sm">
                  <div className="flex items-center gap-2"><BadgeCheck className="w-4 h-4 text-emerald-400" /> Subdomínio reservado</div>
                  <div className="flex items-center gap-2"><BadgeCheck className="w-4 h-4 text-emerald-400" /> Primeiro admin criado</div>
                  <div className="flex items-center gap-2"><BadgeCheck className="w-4 h-4 text-emerald-400" /> Acesso ao painel e integrações</div>
                </div>
              </div>
              <div className="rounded-3xl border border-white/10 bg-[#020617]/30 p-6">
                <div className="text-xs font-black uppercase tracking-widest text-white/70">Próximo passo</div>
                <div className="mt-3 text-sm text-white/60 leading-relaxed">
                  No plano Profissional, o sistema gera um PIX imediatamente. Ao confirmar, sua assinatura fica ativa automaticamente.
                </div>
              </div>
            </div>
          ) : (
            <div className="mt-6 space-y-5">
              <div className="rounded-3xl border border-white/10 bg-[#020617]/30 p-6">
                <div className="text-xs font-black uppercase tracking-widest text-emerald-300">Ambiente criado</div>
                <div className="mt-2 text-sm text-white/70">
                  Subdomínio reservado: <span className="font-black text-white">{success.subdomain}</span>
                </div>
              </div>

              {success.pixCode ? (
                <div className="rounded-3xl border border-blue-500/20 bg-blue-500/10 p-6">
                  <div className="text-xs font-black uppercase tracking-widest text-blue-200">Pagamento do plano via PIX</div>
                  <div className="mt-3 grid md:grid-cols-2 gap-4 items-start">
                    <div className="rounded-2xl bg-[#020617]/40 border border-white/10 p-4">
                      <div className="text-[10px] font-black uppercase tracking-widest text-white/60">Copia e cola</div>
                      <div className="mt-2 text-xs text-white/70 break-all">
                        {success.pixCode}
                      </div>
                      <button
                        type="button"
                        onClick={async () => {
                          try {
                            await navigator.clipboard.writeText(success.pixCode || "");
                          } catch {}
                        }}
                        className="mt-4 w-full px-4 py-3 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/10 text-white font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-2"
                      >
                        <Copy className="w-4 h-4" />
                        Copiar PIX
                      </button>
                    </div>
                    <div className="rounded-2xl bg-[#020617]/40 border border-white/10 p-4">
                      <div className="text-[10px] font-black uppercase tracking-widest text-white/60">QR Code</div>
                      <div className="mt-3 rounded-xl overflow-hidden bg-white/5 border border-white/10 flex items-center justify-center p-3">
                        <img alt="QR Code PIX" src={success.pixUrl || ""} className="max-w-full h-auto" />
                      </div>
                      <div className="mt-4 text-[10px] font-bold uppercase tracking-widest text-white/50">
                        Após pagar, o sistema ativa automaticamente.
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="rounded-3xl border border-emerald-500/20 bg-emerald-500/10 p-6">
                  <div className="text-xs font-black uppercase tracking-widest text-emerald-200">Teste ativado</div>
                  <div className="mt-2 text-sm text-white/70">
                    Seu período de teste está ativo{success.trialEndsAt ? ` até ${new Date(success.trialEndsAt).toLocaleDateString("pt-BR")}` : ""}.
                  </div>
                  <a
                    href="/admin/login"
                    className="mt-4 inline-block px-5 py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black uppercase tracking-widest text-xs"
                  >
                    Entrar no admin
                  </a>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Page() {
  return <SignupForm />;
}
