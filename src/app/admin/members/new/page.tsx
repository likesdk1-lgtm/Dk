"use client";

import React, { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { formatCPF } from "@/lib/utils";

export default function NewMemberPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    cpf: "",
    birthDate: "",
    institution: "", 
    modalityId: "",
    whatsapp: "",
    registrationMode: "AUTO",
    registrationNum: "",
  });
  const [photo, setPhoto] = useState<File | null>(null);
  const [documents, setDocuments] = useState<FileList | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const data = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (key === "cpf") {
        data.append(key, value.replace(/\D/g, ""));
      } else {
        data.append(key, value);
      }
    });
    if (photo) data.append("photo", photo);
    if (documents) {
      Array.from(documents).forEach((file) => data.append("documents", file));
    }

    try {
      await axios.post("/api/admin/members", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      router.push("/admin/members");
    } catch (err: any) {
      setError(err.response?.data?.error || "Erro ao cadastrar associado");
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 font-sans bg-[#020617] min-h-screen text-white">
      <div className="max-w-2xl mx-auto bg-slate-900/40 backdrop-blur-3xl rounded-[3rem] shadow-2xl border border-white/10 overflow-hidden animate-in fade-in slide-in-from-bottom-10 duration-500">
        <div className="p-10 border-b border-white/5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <h1 className="text-3xl font-black text-white uppercase tracking-tighter relative z-10">
            Novo Associado
          </h1>
          <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.3em] mt-2 relative z-10">
            Cadastro estratégico • Dk Sind Elite
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-10 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="md:col-span-2 space-y-2">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">
                Nome Completo
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-6 py-4 bg-black/20 border border-white/10 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all text-white font-bold"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">
                CPF
              </label>
              <input
                type="text"
                value={formatCPF(formData.cpf)}
                onChange={(e) => setFormData({ ...formData, cpf: e.target.value })}
                className="w-full px-6 py-4 bg-black/20 border border-white/10 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all text-white font-bold"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">
                Data de Nascimento
              </label>
              <input
                type="date"
                value={formData.birthDate}
                onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                className="w-full px-6 py-4 bg-black/20 border border-white/10 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all text-white font-bold [color-scheme:dark]"
                required
              />
            </div>

            <div className="md:col-span-2 space-y-2">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">
                Instituição
              </label>
              <input
                type="text"
                value={formData.institution}
                onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
                placeholder="Ex: Secretaria de Saúde"
                className="w-full px-6 py-4 bg-black/20 border border-white/10 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all text-white font-bold"
              />
            </div>

            <div className="md:col-span-2 space-y-4 p-6 bg-white/5 rounded-[2rem] border border-white/5">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">
                Matrícula do Associado
              </label>
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, registrationMode: "AUTO" })}
                  className={`flex-1 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${formData.registrationMode === "AUTO" ? "bg-emerald-600 text-white" : "bg-black/20 text-gray-500 border border-white/5"}`}
                >
                  Automática
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, registrationMode: "MANUAL" })}
                  className={`flex-1 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${formData.registrationMode === "MANUAL" ? "bg-emerald-600 text-white" : "bg-black/20 text-gray-500 border border-white/5"}`}
                >
                  Manual
                </button>
              </div>
              
              {formData.registrationMode === "MANUAL" && (
                <input
                  type="text"
                  placeholder="Digite o número da matrícula..."
                  value={formData.registrationNum}
                  onChange={(e) => setFormData({ ...formData, registrationNum: e.target.value })}
                  className="w-full px-6 py-4 bg-black/40 border border-emerald-500/30 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all text-white font-bold animate-in slide-in-from-top-2"
                  required
                />
              )}
            </div>

            <div className="md:col-span-2 space-y-2">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">
                Número do WhatsApp (Opcional)
              </label>
              <input
                type="text"
                value={formData.whatsapp}
                onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                placeholder="Ex: 86999998888"
                className="w-full px-6 py-4 bg-black/20 border border-white/10 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all text-white font-bold"
              />
              <p className="text-[9px] text-emerald-500 font-black uppercase tracking-widest mt-2 ml-1">
                Usado para CRM e notificações automáticas
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">
                Foto de Perfil
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setPhoto(e.target.files?.[0] || null)}
                className="w-full px-6 py-3 bg-black/20 border border-white/10 rounded-2xl text-[10px] font-black text-gray-500"
              />
            </div>
          </div>

          {error && <p className="text-red-500 text-[10px] font-black text-center uppercase tracking-widest bg-red-500/10 py-3 rounded-xl border border-red-500/20">{error}</p>}

          <div className="flex gap-6 pt-6">
            <button
              type="button"
              onClick={() => router.back()}
              className="flex-1 py-5 bg-white/5 hover:bg-white/10 text-gray-500 hover:text-white font-black rounded-2xl transition-all uppercase tracking-widest text-[10px] border border-white/10"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-5 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-2xl shadow-2xl shadow-emerald-900/20 transition-all uppercase tracking-widest text-[10px] disabled:opacity-50"
            >
              {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto" /> : "Finalizar Cadastro"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
