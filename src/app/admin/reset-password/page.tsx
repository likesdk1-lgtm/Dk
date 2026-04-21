"use client";

import React, { useState } from "react";
import axios from "axios";
import { Lock, ShieldAlert, CheckCircle2, AlertCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function ResetPasswordPage() {
  const [formData, setFormData] = useState({
    cpf: "",
    newPassword: "",
    secret: "",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const response = await axios.post("/api/admin/reset-password", formData);
      setMessage({ type: "success", text: "Senha redefinida com sucesso!" });
      setFormData({ cpf: "", newPassword: "", secret: "" });
    } catch (err: any) {
      setMessage({ 
        type: "error", 
        text: err.response?.data?.error || "Erro ao redefinir senha. Verifique a chave secreta." 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-blue-950 flex items-center justify-center p-6 font-sans">
      <div className="max-w-md w-full">
        <Link 
          href="/login" 
          className="inline-flex items-center gap-2 text-blue-300 hover:text-white text-[10px] font-black uppercase tracking-widest mb-8 transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Voltar para o Login
        </Link>

        <div className="bg-white/10 backdrop-blur-2xl p-10 rounded-[3rem] border border-white/20 shadow-2xl relative overflow-hidden">
          {/* Decorative Background */}
          <div className="absolute -right-10 -top-10 w-32 h-32 bg-blue-500/20 rounded-full blur-3xl" />
          <div className="absolute -left-10 -bottom-10 w-32 h-32 bg-red-500/10 rounded-full blur-3xl" />

          <div className="relative z-10">
            <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20 mb-8 mx-auto">
              <Lock className="w-8 h-8 text-white" />
            </div>

            <div className="text-center mb-10">
              <h1 className="text-3xl font-black text-white uppercase tracking-tighter">Resgate de Acesso</h1>
              <p className="text-blue-200/60 text-[10px] font-black uppercase tracking-widest mt-2">Redefinição de emergência para administradores</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-blue-200 uppercase tracking-widest ml-1">CPF do Administrador</label>
                <input
                  type="text"
                  required
                  placeholder="000.000.000-00"
                  value={formData.cpf}
                  onChange={(e) => setFormData({ ...formData, cpf: e.target.value.replace(/\D/g, "") })}
                  className="w-full px-6 py-4 bg-black/20 border border-white/10 rounded-2xl outline-none focus:ring-2 focus:ring-blue-400 transition-all text-white font-bold placeholder:text-white/20"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-blue-200 uppercase tracking-widest ml-1">Nova Senha Mestra</label>
                <input
                  type="password"
                  required
                  placeholder="********"
                  value={formData.newPassword}
                  onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                  className="w-full px-6 py-4 bg-black/20 border border-white/10 rounded-2xl outline-none focus:ring-2 focus:ring-blue-400 transition-all text-white font-bold placeholder:text-white/20"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 mb-1">
                  <ShieldAlert className="w-3 h-3 text-red-400" />
                  <label className="text-[10px] font-black text-red-400 uppercase tracking-widest">Chave Secreta de Segurança</label>
                </div>
                <input
                  type="password"
                  required
                  placeholder="INSIRA A CHAVE DO .ENV"
                  value={formData.secret}
                  onChange={(e) => setFormData({ ...formData, secret: e.target.value })}
                  className="w-full px-6 py-4 bg-black/20 border border-red-500/20 rounded-2xl outline-none focus:ring-2 focus:ring-red-400 transition-all text-white font-bold placeholder:text-white/20"
                />
              </div>

              {message && (
                <div className={`p-4 rounded-2xl flex items-center gap-3 animate-in fade-in zoom-in duration-300 ${
                  message.type === "success" ? "bg-green-500/10 text-green-400 border border-green-500/20" : "bg-red-500/10 text-red-400 border border-red-500/20"
                }`}>
                  {message.type === "success" ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
                  <span className="text-[10px] font-black uppercase tracking-widest">{message.text}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-5 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-[2rem] shadow-2xl shadow-blue-600/20 transition-all uppercase tracking-widest text-xs flex items-center justify-center gap-3 disabled:opacity-50 group"
              >
                {loading ? "PROCESSANDO..." : "Redefinir Senha agora"}
                {!loading && <CheckCircle2 className="w-4 h-4 group-hover:scale-110 transition-transform" />}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
