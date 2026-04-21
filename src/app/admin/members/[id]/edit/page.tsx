"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { useRouter, useParams } from "next/navigation";
import { formatCPF } from "@/lib/utils";
import { 
  User, 
  ArrowLeft, 
  Save, 
  FileText, 
  Image as ImageIcon, 
  Trash2, 
  Eye,
  Download,
  Briefcase,
  Printer,
  Clock,
  ExternalLink,
  X,
  ShieldCheck
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function EditMemberPage() {
  const router = useRouter();
  const params = useParams();
  const memberId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    cpf: "",
    registrationNum: "",
    birthDate: "",
    healthUnit: "",
    modalityId: "",
    whatsapp: "",
    status: "ACTIVE",
  });
  const [billings, setBillings] = useState<any[]>([]);
  const [currentPhoto, setCurrentPhoto] = useState<string | null>(null);
  const [documents, setDocuments] = useState<any[]>([]);
  const [newPhoto, setPhoto] = useState<File | null>(null);
  const [newDocuments, setNewDocuments] = useState<FileList | null>(null);
  const [reportModal, setReportModal] = useState(false);
  const [settings, setSettings] = useState<any>(null);

  useEffect(() => {
    fetchMemberData();
    fetchSettings();
  }, [memberId]);

  const fetchSettings = async () => {
    try {
      const res = await axios.get("/api/admin/settings");
      setSettings(res.data);
    } catch (err) {
      console.error("Erro ao carregar settings");
    }
  };

  const fetchMemberData = async () => {
    try {
      console.log("Fetching member data for ID:", memberId);
      const response = await axios.get(`/api/admin/members/${memberId}`);
      const member = response.data;
      
      if (!member) throw new Error("Dados vazios recebidos da API");

      setFormData({
        name: member.name || "",
        cpf: member.cpf || "",
        registrationNum: member.registrationNum || "",
        birthDate: member.birthDate ? new Date(member.birthDate).toISOString().split('T')[0] : "",
        healthUnit: member.healthUnit || "",
        modalityId: member.modalityId || "",
        whatsapp: member.whatsapp || "",
        status: member.status || "ACTIVE",
      });
      setBillings(member.billing || []);
      setCurrentPhoto(member.photoUrl);
      setDocuments(member.documents || []);
      setLoading(false);
    } catch (err: any) {
      console.error("Erro ao carregar dados do associado:", err);
      setError(`Erro ao carregar dados: ${err.response?.data?.error || err.message}`);
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const data = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (key === "cpf") {
        data.append(key, value.replace(/\D/g, ""));
      } else {
        data.append(key, value);
      }
    });
    
    if (newPhoto) data.append("photo", newPhoto);
    if (newDocuments) {
      Array.from(newDocuments).forEach((file) => data.append("documents", file));
    }

    try {
      await axios.patch(`/api/admin/members/${memberId}`, data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      router.push("/admin/members");
    } catch (err: any) {
      setError(err.response?.data?.error || "Erro ao atualizar associado");
      setSaving(false);
    }
  };

  const handleDeleteMember = async () => {
    if (!confirm("Tem certeza que deseja excluir este associado? Esta ação é irreversível.")) return;
    
    try {
      await axios.delete(`/api/admin/members/${memberId}`);
      router.push("/admin/members");
    } catch (err) {
      alert("Erro ao excluir associado.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 font-sans bg-[#020617] min-h-screen text-white print:bg-white print:text-black print:p-0">
      <div className="max-w-4xl mx-auto space-y-8 print:space-y-0 print:max-w-none print:m-0">
        <div className="flex justify-between items-center print:hidden">
          <button 
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-xs font-bold uppercase tracking-widest"
          >
            <ArrowLeft className="w-4 h-4" /> Voltar
          </button>
          
          <button 
            onClick={handleDeleteMember}
            className="flex items-center gap-2 text-red-500 hover:text-red-400 transition-colors text-xs font-bold uppercase tracking-widest"
          >
            <Trash2 className="w-4 h-4" /> Excluir Associado
          </button>
        </div>

        <div className="bg-slate-900/40 backdrop-blur-3xl rounded-[3rem] border border-white/10 overflow-hidden shadow-2xl animate-in fade-in slide-in-from-bottom-10 duration-500 print:hidden">
          <div className="p-10 border-b border-white/5 bg-gradient-to-r from-emerald-600/10 to-transparent relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <h1 className="text-3xl font-black text-white uppercase tracking-tighter relative z-10">Editar Associado</h1>
            <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.3em] mt-2 relative z-10">Atualização estratégica • Dk Sind Elite</p>
          </div>

          <form onSubmit={handleSubmit} className="p-10 space-y-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Photo Section */}
              <div className="md:col-span-2 flex flex-col items-center gap-4 py-4">
                <div className="relative group">
                  <div className="w-32 h-32 rounded-full border-4 border-emerald-500/20 overflow-hidden bg-black/40 shadow-2xl group-hover:border-emerald-500/50 transition-all duration-500">
                    {newPhoto ? (
                      <img src={URL.createObjectURL(newPhoto)} className="w-full h-full object-cover" />
                    ) : currentPhoto ? (
                      <img src={currentPhoto} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <User className="w-12 h-12 text-gray-700" />
                      </div>
                    )}
                  </div>
                  <label className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer rounded-full">
                    <ImageIcon className="w-6 h-6 text-white" />
                    <input type="file" accept="image/*" onChange={(e) => setPhoto(e.target.files?.[0] || null)} className="hidden" />
                  </label>
                </div>
                <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest opacity-60">Clique na foto para trocar</span>
              </div>

              <div className="md:col-span-2 space-y-2">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-2">Nome Completo</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-6 py-4 bg-black/20 border border-white/10 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 outline-none text-white font-bold transition-all"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-2">CPF</label>
                <input
                  type="text"
                  value={formatCPF(formData.cpf)}
                  onChange={(e) => setFormData({ ...formData, cpf: e.target.value })}
                  className="w-full px-6 py-4 bg-black/20 border border-white/10 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 outline-none text-white font-bold transition-all"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-2">Data de Nascimento</label>
                <input
                  type="date"
                  value={formData.birthDate}
                  onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                  className="w-full px-6 py-4 bg-black/20 border border-white/10 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 outline-none text-white font-bold transition-all [color-scheme:dark]"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-2">Unidade de Saúde</label>
                <input
                  type="text"
                  value={formData.healthUnit}
                  onChange={(e) => setFormData({ ...formData, healthUnit: e.target.value })}
                  className="w-full px-6 py-4 bg-black/20 border border-white/10 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 outline-none text-white font-bold transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-2">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-6 py-4 bg-[#020617] border border-white/10 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 outline-none text-white font-bold transition-all"
                >
                  <option value="ACTIVE">ATIVO</option>
                  <option value="INACTIVE">INATIVO</option>
                  <option value="PENDING">PENDENTE</option>
                </select>
              </div>
            </div>

            {error && <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-500 text-[10px] font-black uppercase tracking-widest text-center">{error}</div>}

            <button
              type="submit"
              disabled={saving}
              className="w-full py-6 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-[2rem] shadow-2xl shadow-emerald-900/20 transition-all uppercase tracking-widest text-[10px] flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50"
            >
              {saving ? <div className="w-5 h-5 border-4 border-white/20 border-t-white rounded-full animate-spin" /> : <><Save className="w-4 h-4" /> Salvar Alterações</>}
            </button>
          </form>

          {/* Payment History Section */}
          <div className="p-10 border-t border-white/5 space-y-8">
            <div className="flex justify-between items-end">
              <div>
                <h3 className="text-xl font-black text-white uppercase tracking-tighter">Histórico Financeiro</h3>
                <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest mt-1">Mensalidades do associado</p>
              </div>
              <button 
                onClick={() => setReportModal(true)}
                className="px-6 py-3 bg-white/5 hover:bg-white/10 text-white font-black rounded-xl border border-white/10 transition-all uppercase tracking-widest text-[9px] flex items-center gap-2"
              >
                <Printer className="w-4 h-4 text-emerald-500" /> Gerar Relatório
              </button>
            </div>

            <div className="bg-black/20 rounded-3xl overflow-hidden border border-white/5">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-white/5 border-b border-white/5">
                    <th className="px-6 py-4 text-[9px] font-black text-gray-500 uppercase tracking-widest">Referência</th>
                    <th className="px-6 py-4 text-[9px] font-black text-gray-500 uppercase tracking-widest">Vencimento</th>
                    <th className="px-6 py-4 text-[9px] font-black text-gray-500 uppercase tracking-widest">Valor</th>
                    <th className="px-6 py-4 text-[9px] font-black text-gray-500 uppercase tracking-widest">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {billings.map((bill) => (
                    <tr key={bill.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-6 py-4 text-xs font-bold text-white uppercase">
                        {format(new Date(bill.dueDate), "MMMM/yyyy", { locale: ptBR })}
                      </td>
                      <td className="px-6 py-4 text-xs text-gray-500">
                        {format(new Date(bill.dueDate), "dd/MM/yyyy")}
                      </td>
                      <td className="px-6 py-4 text-xs font-black text-white">
                        {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(bill.amount)}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest ${
                          bill.status === "PAID" ? "bg-emerald-500/10 text-emerald-500" : "bg-orange-500/10 text-orange-500"
                        }`}>
                          {bill.status === "PAID" ? "Liquidado" : "Pendente"}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {billings.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-6 py-10 text-center text-[10px] font-black text-gray-600 uppercase tracking-widest">Nenhuma cobrança encontrada</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Report Modal */}
      <AnimatePresence>
        {reportModal && (
          <div id="report-portal-root" className="fixed inset-0 z-[100] flex items-center justify-center p-4 print:p-0 print:m-0 print:block print:static">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setReportModal(false)}
              className="absolute inset-0 bg-[#020617]/95 backdrop-blur-xl print:hidden"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white/5 border border-white/10 rounded-[3rem] p-10 shadow-2xl relative z-10 max-w-2xl w-full overflow-hidden print:block print:bg-white print:border-none print:p-0 print:shadow-none print:max-w-none print:opacity-100 print:transform-none print:overflow-visible"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-blue-500 print:hidden" />
              
              <div className="mb-8 flex justify-between items-center print:hidden">
                <h3 className="text-xl font-black text-white uppercase tracking-tighter">Relatório de Pagamentos</h3>
                <div className="flex gap-2">
                  <button onClick={() => window.print()} className="p-3 bg-white/5 hover:bg-emerald-500 text-gray-400 hover:text-white rounded-xl border border-white/10 transition-all"><Printer className="w-5 h-5" /></button>
                  <button onClick={() => setReportModal(false)} className="p-3 bg-white/5 hover:bg-red-500 text-gray-400 hover:text-white rounded-xl border border-white/10 transition-all"><X className="w-5 h-5" /></button>
                </div>
              </div>

              <div id="printable-report" className="bg-white text-black p-8 overflow-visible font-sans print:p-0 print:m-0 print:block">
                {/* Cabeçalho Profissional */}
                <div className="flex justify-between items-center mb-10 border-b-2 border-gray-200 pb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-emerald-600 rounded-xl flex items-center justify-center text-white">
                      <ShieldCheck className="w-10 h-10" />
                    </div>
                    <div>
                      <h1 className="text-xl font-black uppercase tracking-tight text-gray-900">{settings?.unionName || "SINDICATO DIGITAL"}</h1>
                      <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Extrato de Regularidade Sindical</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Emissão</p>
                    <p className="text-xs font-bold text-gray-900">{format(new Date(), "dd/MM/yyyy HH:mm")}</p>
                  </div>
                </div>

                {/* Grid de Informações do Associado */}
                <div className="grid grid-cols-4 gap-4 mb-6">
                  <div className="col-span-1">
                    <div className="w-24 h-24 rounded-xl border border-gray-100 overflow-hidden bg-gray-50">
                      {currentPhoto ? (
                        <img src={currentPhoto} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-200">
                          <User className="w-8 h-8" />
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="col-span-3 grid grid-cols-2 gap-y-2 gap-x-6 py-1">
                    <div className="col-span-2">
                      <p className="text-[7px] font-black text-gray-400 uppercase tracking-widest leading-none">Nome Completo</p>
                      <p className="text-sm font-black text-gray-900 uppercase">{formData.name}</p>
                    </div>
                    <div>
                      <p className="text-[7px] font-black text-gray-400 uppercase tracking-widest leading-none">CPF</p>
                      <p className="text-xs font-bold text-gray-900">{formatCPF(formData.cpf)}</p>
                    </div>
                    <div>
                      <p className="text-[7px] font-black text-gray-400 uppercase tracking-widest leading-none">Matrícula</p>
                      <p className="text-xs font-black text-emerald-600">{formData.registrationNum}</p>
                    </div>
                    <div>
                      <p className="text-[7px] font-black text-gray-400 uppercase tracking-widest leading-none">Unidade</p>
                      <p className="text-xs font-bold text-gray-900 uppercase">{formData.healthUnit || "-"}</p>
                    </div>
                    <div>
                      <p className="text-[7px] font-black text-gray-400 uppercase tracking-widest leading-none">Situação</p>
                      <p className="text-xs font-black text-gray-900 uppercase">{formData.status === "ACTIVE" ? "REGULAR" : "PENDENTE"}</p>
                    </div>
                  </div>
                </div>

                {/* Tabela de Pagamentos - Compacta */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-1 h-3 bg-emerald-500 rounded-full" />
                    <h3 className="text-[8px] font-black text-gray-900 uppercase tracking-widest">Histórico Financeiro</h3>
                  </div>
                  <table className="w-full border-collapse text-left">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="py-2 px-1 text-[7px] font-black text-gray-400 uppercase tracking-widest">Mês Referência</th>
                        <th className="py-2 px-1 text-[7px] font-black text-gray-400 uppercase tracking-widest">Vencimento</th>
                        <th className="py-2 px-1 text-[7px] font-black text-gray-400 uppercase tracking-widest">Valor</th>
                        <th className="py-2 px-1 text-right text-[7px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {billings.map((bill) => (
                        <tr key={bill.id}>
                          <td className="py-2 px-1 text-[10px] font-bold uppercase text-gray-900">{format(new Date(bill.dueDate), "MMMM/yyyy", { locale: ptBR })}</td>
                          <td className="py-2 px-1 text-[10px] text-gray-500">{format(new Date(bill.dueDate), "dd/MM/yyyy")}</td>
                          <td className="py-2 px-1 text-[10px] font-black text-gray-900">{new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(bill.amount)}</td>
                          <td className="py-2 px-1 text-right">
                            <span className={`text-[7px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded ${
                              bill.status === "PAID" ? "bg-emerald-50 text-emerald-600 border border-emerald-100" : "bg-red-50 text-red-600 border border-red-100"
                            }`}>
                              {bill.status === "PAID" ? "LIQUIDADO" : "PENDENTE"}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Assinaturas Compactas */}
                <div className="mt-12 grid grid-cols-2 gap-12 px-6">
                  <div className="text-center pt-2 border-t border-gray-200">
                    <p className="text-[8px] font-black text-gray-900 uppercase">{formData.name}</p>
                    <p className="text-[7px] text-gray-400 uppercase tracking-widest">Assinatura Associado</p>
                  </div>
                  <div className="text-center pt-2 border-t border-gray-200">
                    <p className="text-[8px] font-black text-gray-900 uppercase">{settings?.unionName || "DIRETORIA"}</p>
                    <p className="text-[7px] text-gray-400 uppercase tracking-widest">Responsável</p>
                  </div>
                </div>

                {/* Footer Discreto */}
                <div className="mt-16 pt-6 border-t border-gray-100 flex justify-between items-center opacity-40">
                  <p className="text-[7px] font-black text-gray-400 uppercase tracking-[0.4em]">Gerado via Dk Sind Elite CRM</p>
                  <p className="text-[7px] font-black text-gray-400 uppercase tracking-[0.4em]">Autenticação: {Math.random().toString(36).substring(2, 12).toUpperCase()}</p>
                </div>
              </div>

              <button onClick={() => setReportModal(false)} className="w-full py-5 bg-emerald-600 text-white font-black rounded-2xl shadow-xl mt-8 uppercase tracking-widest text-[10px] print:hidden">Fechar</button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
