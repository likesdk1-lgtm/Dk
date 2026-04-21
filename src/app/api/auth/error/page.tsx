"use client";

import React, { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { ShieldAlert, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";

function AuthErrorPageInner() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  let errorMessage = "OCORREU UM ERRO INESPERADO NO SERVIDOR.";

  if (error === "CredentialsSignin") {
    errorMessage = "CPF OU SENHA INCORRETOS. VERIFIQUE SEUS DADOS.";
  } else if (error === "SessionRequired") {
    errorMessage = "SUA SESSÃO EXPIROU. POR FAVOR, FAÇA LOGIN NOVAMENTE.";
  } else if (error) {
    errorMessage = `FALHA TÉCNICA: ${error.toUpperCase()}. TENTE NOVAMENTE EM INSTANTES.`;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#020617] p-6 font-sans relative overflow-hidden">
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-red-500/20 rounded-full blur-[100px] animate-pulse" />
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full relative z-10"
      >
        <div className="bg-white/5 backdrop-blur-2xl p-10 rounded-[3rem] border border-white/10 shadow-2xl text-center space-y-6">
          <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto">
            <ShieldAlert className="w-10 h-10 text-red-500" />
          </div>
          
          <h1 className="text-2xl font-black text-white uppercase tracking-tight">Falha na Autenticação</h1>
          
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl">
              <p className="text-red-400 text-xs font-bold uppercase tracking-widest">
                {errorMessage}
              </p>
              {error && error !== "CredentialsSignin" && (
                <p className="text-[8px] text-red-500/50 mt-2 font-mono break-all">
                  REF_CODE: {error}
                </p>
              )}
            </div>

          <Link 
            href="/login" 
            className="w-full py-5 bg-white/10 hover:bg-white/20 text-white font-black rounded-2xl transition-all uppercase tracking-widest text-[10px] flex items-center justify-center gap-3"
          >
            <ArrowLeft className="w-4 h-4" /> Voltar para o Login
          </Link>
        </div>
      </motion.div>
    </div>
  );
}

export default function AuthErrorPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#020617] flex items-center justify-center text-white">Carregando...</div>}>
      <AuthErrorPageInner />
    </Suspense>
  );
}
