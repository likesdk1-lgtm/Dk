"use client";

import React, { useState, useEffect } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { validateCPF, formatCPF } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { 
  User, 
  Calendar, 
  ArrowRight,
  ShieldCheck,
  Briefcase
} from "lucide-react";
import axios from "axios";

export default function MemberLoginPage() {
  const router = useRouter();
  const [cpf, setCpf] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [member, setMember] = useState<{ photoUrl: string; name: string } | null>(null);

  const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, "");
    if (val.length <= 11) {
      setCpf(val);
    }
  };

  useEffect(() => {
    if (cpf.length === 11) {
      checkMember(cpf);
    } else {
      setMember(null);
    }
  }, [cpf]);

  const checkMember = async (cleanCpf: string) => {
    setChecking(true);
    try {
      const response = await axios.get(`/api/public/member-photo?cpf=${cleanCpf}`);
      if (response.data.photoUrl) {
        setMember(response.data);
      }
    } catch (err: any) {
      setMember(null);
    } finally {
      setChecking(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    console.log("Enviando login:", { cpf, birthDate });

    if (!validateCPF(cpf)) {
      setError("CPF Inválido. Verifique os números.");
      setLoading(false);
      return;
    }

    const result = await signIn("member-login", {
      cpf: cpf,
      birthDate: birthDate,
      redirect: false,
    });

    if (result?.error) {
      setError("Dados não conferem. Verifique o CPF e a Data de Nascimento.");
      setLoading(false);
    } else {
      router.push("/portal/dashboard");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#020617] p-6 font-sans relative overflow-hidden">
      {/* Cyber Background */}
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-emerald-500/20 rounded-full blur-[100px] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-blue-500/20 rounded-full blur-[100px] animate-pulse delay-700" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full relative z-10"
      >
        <div className="bg-white/5 backdrop-blur-2xl p-10 rounded-[3rem] border border-white/10 shadow-2xl space-y-8">
          <div className="text-center space-y-4">
            <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-3xl flex items-center justify-center mx-auto shadow-xl shadow-emerald-500/20">
              <Briefcase className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-black text-white uppercase tracking-tighter">Dk <span className="text-emerald-400">Sind</span></h1>
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">INFRAESTRUTURA SINDICAL DIGITAL</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <AnimatePresence mode="wait">
              {checking ? (
                <motion.div 
                  key="checking"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center gap-2 py-4"
                >
                  <div className="w-20 h-20 rounded-full border-2 border-emerald-500/20 border-t-emerald-500 animate-spin" />
                  <span className="text-[8px] font-black text-emerald-500 uppercase tracking-widest animate-pulse">Localizando Cadastro...</span>
                </motion.div>
              ) : member ? (
                <motion.div 
                  key="member-photo"
                  initial={{ opacity: 0, scale: 0.5, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.5, y: -20 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className="flex flex-col items-center gap-3 py-4"
                >
                  <div className="relative">
                    <motion.div 
                      animate={{ 
                        boxShadow: ["0 0 0px 0px rgba(16, 185, 129, 0)", "0 0 20px 5px rgba(16, 185, 129, 0.2)", "0 0 0px 0px rgba(16, 185, 129, 0)"]
                      }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="absolute inset-0 bg-emerald-500 rounded-full blur-2xl opacity-20" 
                    />
                    <div className="w-28 h-28 rounded-full border-4 border-emerald-500/30 p-1 relative z-10 overflow-hidden bg-black/40 ring-4 ring-emerald-500/10">
                      <img src={member.photoUrl} alt={member.name} className="w-full h-full object-cover rounded-full scale-110 hover:scale-125 transition-transform duration-700" />
                    </div>
                  </div>
                  <motion.div 
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center"
                  >
                    <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest block">Bem-vindo(a)</span>
                    <span className="text-sm font-black text-white uppercase tracking-tight">{member.name}</span>
                  </motion.div>
                </motion.div>
              ) : null}
            </AnimatePresence>

            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-4">Identificação (CPF)</label>
                <div className="relative">
                  <User className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
                  <input
                    type="text"
                    value={formatCPF(cpf)}
                    onChange={handleCpfChange}
                    placeholder="000.000.000-00"
                    className="w-full pl-14 pr-6 py-5 bg-white/5 border border-white/10 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none text-white font-bold transition-all"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-4">Data de Nascimento</label>
                <div className="relative">
                  <Calendar className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
                  <input
                    type="date"
                    value={birthDate}
                    onChange={(e) => setBirthDate(e.target.value)}
                    className="w-full pl-14 pr-6 py-5 bg-white/5 border border-white/10 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none text-white font-bold transition-all [color-scheme:dark]"
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
              className="w-full py-6 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-2xl shadow-xl shadow-emerald-900/40 transition-all uppercase tracking-widest text-[10px] flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50"
            >
              {loading ? <div className="w-5 h-5 border-4 border-white/20 border-t-white rounded-full animate-spin" /> : <>Acessar Portal <ArrowRight className="w-4 h-4" /></>}
            </button>
          </form>

          <div className="text-center pt-6 flex flex-col gap-4">
            <a href="/signup" className="text-[10px] font-bold text-emerald-500 hover:text-emerald-400 uppercase tracking-widest transition-colors">
              Criar teste gratuito (SaaS)
            </a>
            <a href="/partner/login" className="text-[10px] font-bold text-blue-500 hover:text-blue-400 uppercase tracking-widest transition-colors flex items-center justify-center gap-2">
              <Briefcase className="w-3 h-3" />
              Portal do Parceiro
            </a>
            <a href="/admin/login" className="text-[10px] font-bold text-gray-600 hover:text-white uppercase tracking-widest transition-colors">Terminal Administrativo</a>
            <a href="/" className="text-[10px] font-bold text-gray-600 hover:text-white uppercase tracking-widest transition-colors">Voltar para o site</a>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
