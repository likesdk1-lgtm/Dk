"use client";

import React, { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { 
  Building2, 
  ArrowRight,
  ShieldCheck,
  Lock,
  FileText
} from "lucide-react";

export default function PartnerLoginPage() {
  const router = useRouter();
  const [document, setDocument] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const result = await signIn("partner-login", {
      document: document.replace(/\D/g, ""),
      password: password,
      redirect: false,
    });

    if (result?.error) {
      setError("Documento ou senha inválidos. Verifique os dados.");
      setLoading(false);
    } else {
      router.push("/partner/dashboard");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#020617] p-6 font-sans relative overflow-hidden">
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-blue-500/20 rounded-full blur-[100px] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-emerald-500/20 rounded-full blur-[100px] animate-pulse delay-700" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full relative z-10"
      >
        <div className="bg-white/5 backdrop-blur-2xl p-10 rounded-[3rem] border border-white/10 shadow-2xl space-y-8">
          <div className="text-center space-y-4">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-700 rounded-3xl flex items-center justify-center mx-auto shadow-xl shadow-blue-500/20">
              <Building2 className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-black text-white uppercase tracking-tighter">Portal do <span className="text-blue-400">Empresário</span></h1>
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">SINDICATO DIGITAL • PARCERIAS</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-4">CNPJ ou CPF</label>
                <div className="relative">
                  <FileText className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
                  <input
                    type="text"
                    value={document}
                    onChange={(e) => setDocument(e.target.value)}
                    placeholder="CNPJ ou CPF da Empresa"
                    className="w-full pl-14 pr-6 py-5 bg-white/5 border border-white/10 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none text-white font-bold transition-all"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-4">Senha de Acesso</label>
                <div className="relative">
                  <Lock className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-14 pr-6 py-5 bg-white/5 border border-white/10 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none text-white font-bold transition-all"
                    required
                  />
                </div>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl">
                <ShieldCheck className="w-4 h-4 text-red-500 shrink-0" />
                <p className="text-red-500 text-[10px] font-bold uppercase tracking-widest">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-6 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-2xl shadow-xl shadow-blue-900/40 transition-all uppercase tracking-widest text-[10px] flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50"
            >
              {loading ? <div className="w-5 h-5 border-4 border-white/20 border-t-white rounded-full animate-spin" /> : <>Acessar Portal <ArrowRight className="w-4 h-4" /></>}
            </button>
          </form>

          <div className="text-center pt-6 border-t border-white/5">
            <a href="/login" className="text-[10px] font-bold text-gray-600 hover:text-white uppercase tracking-widest transition-colors">Voltar ao Portal do Associado</a>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
