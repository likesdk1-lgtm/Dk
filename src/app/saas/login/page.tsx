"use client";

import React, { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { validateCPF, formatCPF } from "@/lib/utils";
import { motion } from "framer-motion";
import { User, Lock, ArrowRight, Shield, Building2 } from "lucide-react";

export default function SaasLoginPage() {
  const router = useRouter();
  const [cpf, setCpf] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const cleanCpf = cpf.replace(/\D/g, "");
    if (!validateCPF(cleanCpf)) {
      setError("CPF inválido.");
      setLoading(false);
      return;
    }

    const result = await signIn("admin-login", {
      cpf: cleanCpf,
      password: password.trim(),
      redirect: false,
    });

    if (result?.error) {
      setError("Acesso negado. Verifique as credenciais.");
      setLoading(false);
    } else {
      router.push("/saas/dashboard");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#020617] p-6 font-sans relative overflow-hidden">
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
        <div className="absolute top-1/4 right-1/4 w-[400px] h-[400px] bg-emerald-500/10 rounded-full blur-[100px] animate-pulse" />
        <div className="absolute bottom-1/4 left-1/4 w-[400px] h-[400px] bg-blue-500/10 rounded-full blur-[100px] animate-pulse delay-700" />
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-md w-full relative z-10">
        <div className="bg-white/5 backdrop-blur-2xl p-10 rounded-[3rem] border border-white/10 shadow-2xl space-y-8">
          <div className="text-center space-y-4">
            <div className="w-20 h-20 bg-gradient-to-br from-emerald-600 to-blue-700 rounded-3xl flex items-center justify-center mx-auto shadow-xl shadow-emerald-500/20">
              <Building2 className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-black text-white uppercase tracking-tighter">
              Portal <span className="text-emerald-500">SaaS</span>
            </h1>
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest leading-relaxed">
              Administração dos sindicatos clientes (Super Admin)
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-4">
                  Identificação (CPF)
                </label>
                <div className="relative">
                  <User className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
                  <input
                    type="text"
                    value={formatCPF(cpf)}
                    onChange={(e) => setCpf(e.target.value)}
                    placeholder="000.000.000-00"
                    className="w-full pl-14 pr-6 py-5 bg-white/5 border border-white/10 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none text-white font-bold transition-all"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-4">
                  Chave de Acesso
                </label>
                <div className="relative">
                  <Lock className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-14 pr-6 py-5 bg-white/5 border border-white/10 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none text-white font-bold transition-all"
                    required
                  />
                </div>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl">
                <Shield className="w-4 h-4 text-red-500 shrink-0" />
                <p className="text-red-500 text-[10px] font-bold uppercase tracking-widest">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-6 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-2xl shadow-xl shadow-emerald-900/40 transition-all uppercase tracking-widest text-[10px] flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50"
            >
              {loading ? (
                <div className="w-5 h-5 border-4 border-white/20 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Acessar Portal <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="text-center pt-6">
            <div className="flex flex-col gap-3">
              <a href="/admin/login" className="text-[10px] font-bold text-gray-600 hover:text-white uppercase tracking-widest transition-colors">
                Portal Administrativo do Sindicato
              </a>
              <a href="/login" className="text-[10px] font-bold text-gray-600 hover:text-white uppercase tracking-widest transition-colors">
                Portal do Associado
              </a>
              <a href="/partner/login" className="text-[10px] font-bold text-gray-600 hover:text-white uppercase tracking-widest transition-colors">
                Portal do Parceiro
              </a>
              <a href="/" className="text-[10px] font-bold text-gray-600 hover:text-white uppercase tracking-widest transition-colors">
                Voltar para o site
              </a>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

