"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Scanner } from "@yudiel/react-qr-scanner";
import { 
  Building2, 
  Activity, 
  Users, 
  QrCode, 
  LogOut, 
  CheckCircle2, 
  XCircle, 
  RefreshCw, 
  Camera,
  Search,
  FileText,
  ChevronRight,
  TrendingUp,
  User,
  ShieldCheck,
  Calendar,
  Plus,
  X,
  Trash2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function PartnerDashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isScanning, setIsScanning] = useState(false);
  const [selectedBenefit, setSelectedBenefit] = useState<any>(null);
  const [validationResult, setValidationResult] = useState<any>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // New Benefit Form State
  const [isNewBenefitOpen, setIsNewBenefitOpen] = useState(false);
  const [benefitFormData, setBenefitFormData] = useState({
    title: "",
    description: "",
    category: "Promoção",
    link: "",
    monthlyLimit: 0
  });

  const handleSaveBenefit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post("/api/partner/benefits", benefitFormData);
      setIsNewBenefitOpen(false);
      setBenefitFormData({ title: "", description: "", category: "Promoção", link: "", monthlyLimit: 0 });
      fetchDashboardData();
    } catch (err: any) {
      alert(err.response?.data?.error || "Erro ao salvar benefício");
    }
  };

  const handleDeleteBenefit = async (id: string) => {
    if (!confirm("Deseja realmente excluir este benefício?")) return;
    try {
      await axios.delete(`/api/partner/benefits/${id}`);
      fetchDashboardData();
    } catch (err: any) {
      alert(err.response?.data?.error || "Erro ao excluir benefício");
    }
  };

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/partner/login");
    } else if (status === "authenticated") {
      fetchDashboardData();
    }
  }, [status]);

  const fetchDashboardData = async () => {
    try {
      const response = await axios.get("/api/partner/dashboard");
      setData(response.data);
    } catch (err) {
      console.error("Erro ao carregar dados do parceiro", err);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleScan = async (detectedCodes: any[]) => {
    if (detectedCodes.length === 0 || !selectedBenefit || isValidating) return;

    const qrData = detectedCodes[0].rawValue;
    setIsValidating(true);
    setError(null);

    try {
      const response = await axios.post("/api/partner/validate", { 
        qrData, 
        benefitId: selectedBenefit.id 
      });
      setValidationResult(response.data);
      setIsScanning(false);
      fetchDashboardData(); // Atualizar estatísticas e relatório
    } catch (err: any) {
      console.error("Erro ao validar:", err);
      setError(err.response?.data?.error || "Falha na validação");
    } finally {
      setIsValidating(false);
    }
  };

  if (loading || status === "loading") {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020617] text-white font-sans p-6 md:p-10">
      <div className="max-w-7xl mx-auto space-y-10 print:hidden">
        {/* Top Header */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl flex items-center justify-center shadow-xl shadow-blue-500/10 border border-white/10 overflow-hidden">
              {data?.partner.logoUrl ? <img src={data.partner.logoUrl} className="w-full h-full object-cover" /> : <Building2 className="w-8 h-8 text-white" />}
            </div>
            <div>
              <h1 className="text-3xl font-black uppercase tracking-tighter">{data?.partner.name}</h1>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Portal do Parceiro</span>
                <div className="w-1 h-1 rounded-full bg-white/20" />
                <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{data?.partner.document}</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsNewBenefitOpen(true)}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl shadow-lg shadow-blue-900/20 transition-all flex items-center gap-2 text-[10px] font-black uppercase tracking-widest"
            >
              <Plus className="w-4 h-4" /> Criar Benefício
            </button>
            <button 
              onClick={() => signOut({ callbackUrl: "/partner/login" })}
              className="px-6 py-3 bg-white/5 hover:bg-red-500/10 text-gray-400 hover:text-red-500 rounded-xl border border-white/10 transition-all flex items-center gap-2 text-[10px] font-black uppercase tracking-widest"
            >
              <LogOut className="w-4 h-4" /> Sair
            </button>
          </div>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white/5 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/10 shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
              <TrendingUp className="w-12 h-12 text-blue-500" />
            </div>
            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Usos este Mês</p>
            <h2 className="text-5xl font-black text-white tracking-tighter">{data?.stats.thisMonthUsages}</h2>
          </div>
          <div className="bg-white/5 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/10 shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
              <Users className="w-12 h-12 text-emerald-500" />
            </div>
            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Total Histórico</p>
            <h2 className="text-5xl font-black text-white tracking-tighter">{data?.stats.totalUsages}</h2>
          </div>
          <div className="bg-white/5 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/10 shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
              <Activity className="w-12 h-12 text-pink-500" />
            </div>
            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Benefícios Ativos</p>
            <h2 className="text-5xl font-black text-white tracking-tighter">{data?.stats.activeBenefits}</h2>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Main: Benefits & Scanner */}
          <div className="lg:col-span-2 space-y-10">
            <section className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-500">
                  <QrCode className="w-5 h-5" />
                </div>
                <h2 className="text-2xl font-black uppercase tracking-tighter">Validar <span className="text-blue-500">Benefício</span></h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {data?.benefits.map((benefit: any) => (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    key={benefit.id}
                    onClick={() => {
                      setSelectedBenefit(benefit);
                      setIsScanning(true);
                      setValidationResult(null);
                      setError(null);
                    }}
                    className="p-6 bg-white/5 hover:bg-white/10 rounded-3xl border border-white/10 text-left transition-all group relative overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                      <ShieldCheck className="w-12 h-12" />
                    </div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="px-2.5 py-1 bg-blue-500/10 text-blue-500 text-[7px] font-black rounded-full uppercase tracking-widest border border-blue-500/20 block w-fit">
                        {benefit.category}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteBenefit(benefit.id);
                        }}
                        className="flex items-center gap-2 px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-all shadow-lg shadow-red-900/20 group/del"
                        title="Excluir Benefício"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span className="text-[8px] font-black uppercase tracking-widest">Excluir</span>
                      </button>
                    </div>
                    <h4 className="text-lg font-black text-white uppercase tracking-tight mb-2 group-hover:text-blue-400 transition-colors">
                      {benefit.title}
                    </h4>
                    <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest">Clique para escanear</p>
                  </motion.button>
                ))}
              </div>
            </section>

            {/* Monthly Report */}
            <section className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-500">
                    <FileText className="w-5 h-5" />
                  </div>
                  <h2 className="text-2xl font-black uppercase tracking-tighter">Relatório <span className="text-emerald-500">Mensal</span></h2>
                </div>
                <button 
                  onClick={handlePrint}
                  className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 hover:text-white transition-colors flex items-center gap-2"
                >
                  Imprimir Relatório <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              <div className="bg-white/5 rounded-[2.5rem] border border-white/10 overflow-hidden shadow-2xl">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-white/5 border-b border-white/5">
                      <th className="px-8 py-6 text-[9px] font-black text-blue-500 uppercase tracking-widest">Associado</th>
                      <th className="px-8 py-6 text-[9px] font-black text-blue-500 uppercase tracking-widest">Benefício</th>
                      <th className="px-8 py-6 text-[9px] font-black text-blue-500 uppercase tracking-widest">Data / Hora</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {data?.monthlyUsages.map((usage: any) => (
                      <tr key={usage.id} className="hover:bg-white/[0.02] transition-colors group/row">
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/10 overflow-hidden">
                              {usage.member.photoUrl ? <img src={usage.member.photoUrl} className="w-full h-full object-cover" /> : <User className="w-5 h-5 text-gray-700" />}
                            </div>
                            <div>
                              <p className="text-sm font-black text-white uppercase tracking-tight group-hover/row:text-blue-400 transition-colors">{usage.member.name}</p>
                              <p className="text-[8px] font-black text-gray-500 uppercase tracking-widest">MAT: {usage.member.registrationNum}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <span className="text-xs font-black text-gray-400 uppercase tracking-widest">{usage.benefit.title}</span>
                        </td>
                        <td className="px-8 py-6">
                          <div className="flex flex-col items-start gap-1">
                            <span className="text-[10px] font-black text-white uppercase tracking-widest">{format(new Date(usage.usedAt), "dd/MM/yyyy")}</span>
                            <span className="text-[8px] font-black text-gray-600 uppercase">{format(new Date(usage.usedAt), "HH:mm:ss")}</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {data?.monthlyUsages.length === 0 && (
                      <tr>
                        <td colSpan={3} className="px-8 py-20 text-center">
                          <Calendar className="w-10 h-10 text-gray-800 mx-auto mb-4" />
                          <p className="text-[10px] font-black text-gray-600 uppercase tracking-[0.3em]">Nenhum registro este mês</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          </div>

          {/* Sidebar: Activity/Quick Info */}
          <div className="space-y-8">
            <section className="p-8 bg-gradient-to-br from-blue-600/10 to-emerald-600/10 rounded-[2.5rem] border border-white/10">
              <h3 className="text-lg font-black uppercase tracking-tighter mb-4">Instruções de <span className="text-blue-500">Uso</span></h3>
              <div className="space-y-4">
                {[
                  "Selecione o benefício que o associado deseja utilizar.",
                  "Aponte a câmera para o QR Code da carteirinha digital.",
                  "Aguarde a validação do status (deve estar ATIVO).",
                  "O uso será registrado automaticamente no relatório."
                ].map((step, i) => (
                  <div key={i} className="flex gap-4">
                    <span className="w-6 h-6 rounded-lg bg-white/5 flex items-center justify-center text-[10px] font-black text-blue-500 border border-white/5 shrink-0">{i+1}</span>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider leading-relaxed">{step}</p>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      </div>

      {/* Scanner Modal */}
      <AnimatePresence>
        {isScanning && selectedBenefit && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsScanning(false)}
              className="absolute inset-0 bg-[#020617]/95 backdrop-blur-xl"
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white/5 border border-white/10 rounded-[3rem] p-8 md:p-10 shadow-2xl relative z-10 max-w-lg w-full text-center"
            >
              <div className="mb-8">
                <h3 className="text-2xl font-black text-white uppercase tracking-tighter">Validando <span className="text-blue-500">{selectedBenefit.title}</span></h3>
                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mt-1">Escaneie o QR Code do Associado</p>
              </div>

              <div className="relative aspect-square bg-black/40 rounded-[2.5rem] border border-white/10 overflow-hidden shadow-2xl mb-8">
                <Scanner
                  onScan={handleScan}
                  onError={(err) => console.error(err)}
                  constraints={{ facingMode: "environment" }}
                  styles={{ container: { width: "100%", height: "100%" } }}
                />
                {/* Scanner Overlay UI */}
                <div className="absolute inset-0 pointer-events-none border-[40px] border-black/60">
                  <div className="w-full h-full border-2 border-blue-500/50 rounded-2xl relative">
                    <motion.div 
                      animate={{ top: ["0%", "100%", "0%"] }}
                      transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                      className="absolute left-0 right-0 h-0.5 bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.8)] z-20"
                    />
                  </div>
                </div>
                {isValidating && (
                  <div className="absolute inset-0 bg-[#020617]/80 backdrop-blur-md flex flex-col items-center justify-center z-30">
                    <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                    <p className="mt-4 text-[10px] font-black text-blue-500 uppercase tracking-widest">Processando...</p>
                  </div>
                )}
              </div>

              <button
                onClick={() => setIsScanning(false)}
                className="w-full py-5 bg-white/5 hover:bg-white/10 text-white font-black rounded-2xl border border-white/10 transition-all uppercase tracking-widest text-[10px]"
              >
                Cancelar Scanner
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Result Modal */}
      <AnimatePresence>
        {(validationResult || error) && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => { setValidationResult(null); setError(null); }}
              className="absolute inset-0 bg-[#020617]/95 backdrop-blur-xl"
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className={`bg-white/5 border ${error ? "border-red-500/20" : "border-emerald-500/20"} rounded-[3rem] p-10 shadow-2xl relative z-10 max-w-md w-full text-center`}
            >
              {error ? (
                <>
                  <div className="w-20 h-20 bg-red-500/10 rounded-3xl flex items-center justify-center text-red-500 mx-auto mb-6 border border-red-500/20">
                    <XCircle className="w-10 h-10" />
                  </div>
                  <h3 className="text-2xl font-black text-white uppercase tracking-tighter mb-2">Acesso <span className="text-red-500">Negado</span></h3>
                  <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-8">{error}</p>
                </>
              ) : (
                <>
                  <div className="w-20 h-20 bg-emerald-500/10 rounded-3xl flex items-center justify-center text-emerald-500 mx-auto mb-6 border border-emerald-500/20">
                    <CheckCircle2 className="w-10 h-10" />
                  </div>
                  <h3 className="text-2xl font-black text-white uppercase tracking-tighter mb-2">Acesso <span className="text-emerald-500">Liberado</span></h3>
                  <p className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.3em] mb-8">Benefício Registrado com Sucesso</p>
                  
                  <div className="bg-white/5 p-6 rounded-3xl border border-white/5 flex flex-col items-center mb-8">
                    <div className="w-20 h-20 rounded-2xl bg-white/5 overflow-hidden mb-4 border border-white/10 shadow-xl">
                      {validationResult.member.photoUrl ? <img src={validationResult.member.photoUrl} className="w-full h-full object-cover" /> : <User className="w-8 h-8 text-gray-700 mt-6 mx-auto" />}
                    </div>
                    <h4 className="text-lg font-black text-white uppercase tracking-tight">{validationResult.member.name}</h4>
                    <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest mt-1">MATRÍCULA: {validationResult.member.registrationNum}</p>
                  </div>
                </>
              )}

              <button
                onClick={() => { setValidationResult(null); setError(null); }}
                className={`w-full py-5 ${error ? "bg-red-600 hover:bg-red-500" : "bg-blue-600 hover:bg-blue-500"} text-white font-black rounded-2xl shadow-xl transition-all uppercase tracking-widest text-[10px]`}
              >
                Continuar
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* New Benefit Modal */}
      <AnimatePresence>
        {isNewBenefitOpen && (
          <div className="fixed inset-0 z-[160] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsNewBenefitOpen(false)}
              className="absolute inset-0 bg-[#020617]/95 backdrop-blur-xl"
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white/5 border border-white/10 rounded-[3rem] p-8 md:p-10 shadow-2xl relative z-10 max-w-lg w-full"
            >
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-2xl font-black text-white uppercase tracking-tighter">Novo <span className="text-blue-500">Benefício</span></h3>
                <button onClick={() => setIsNewBenefitOpen(false)} className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl text-gray-400"><X className="w-5 h-5" /></button>
              </div>

              <form onSubmit={handleSaveBenefit} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Título do Benefício</label>
                  <input
                    type="text" required
                    placeholder="Ex: 20% de Desconto na Mensalidade"
                    value={benefitFormData.title}
                    onChange={(e) => setBenefitFormData({ ...benefitFormData, title: e.target.value })}
                    className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 text-sm font-bold text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Categoria</label>
                    <select
                      value={benefitFormData.category}
                      onChange={(e) => setBenefitFormData({ ...benefitFormData, category: e.target.value })}
                      className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase text-white [color-scheme:dark] outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Saúde" className="bg-slate-900">Saúde</option>
                      <option value="Educação" className="bg-slate-900">Educação</option>
                      <option value="Alimentação" className="bg-slate-900">Alimentação</option>
                      <option value="Lazer" className="bg-slate-900">Lazer</option>
                      <option value="Jurídico" className="bg-slate-900">Jurídico</option>
                      <option value="Comércio" className="bg-slate-900">Comércio</option>
                      <option value="Serviços" className="bg-slate-900">Serviços</option>
                      <option value="Promoção" className="bg-slate-900">Promoção</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Limite Mensal por Associado</label>
                    <input
                      type="number" required min="0"
                      placeholder="0 = Sem limite"
                      value={benefitFormData.monthlyLimit}
                      onChange={(e) => setBenefitFormData({ ...benefitFormData, monthlyLimit: parseInt(e.target.value) })}
                      className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 text-sm font-bold text-white"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Descrição</label>
                  <textarea
                    required rows={3}
                    placeholder="Descreva o benefício e como o associado pode utilizá-lo..."
                    value={benefitFormData.description}
                    onChange={(e) => setBenefitFormData({ ...benefitFormData, description: e.target.value })}
                    className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 text-sm font-bold resize-none text-white"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Link (Opcional)</label>
                  <input
                    type="url"
                    placeholder="https://seusite.com.br/promo"
                    value={benefitFormData.link}
                    onChange={(e) => setBenefitFormData({ ...benefitFormData, link: e.target.value })}
                    className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 text-sm font-bold text-white"
                  />
                </div>

                <button type="submit" className="w-full py-5 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-2xl uppercase tracking-widest text-[10px] shadow-2xl shadow-blue-900/20 transition-all">
                  Cadastrar Benefício
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Printable Report (Hidden by default, visible only on print) */}
      <div id="printable-report" className="hidden print:block bg-white text-black p-10 min-h-screen">
        <div className="flex justify-between items-start border-b-2 border-black pb-8 mb-8">
          <div>
            <h1 className="text-4xl font-black uppercase tracking-tighter mb-2">{data?.partner.name}</h1>
            <p className="text-sm font-bold uppercase tracking-widest text-gray-600">Relatório de Uso de Benefícios - {format(new Date(), "MMMM 'de' yyyy", { locale: ptBR })}</p>
            <p className="text-xs font-bold text-gray-500 mt-1">CNPJ/CPF: {data?.partner.document}</p>
          </div>
          <div className="text-right">
            <p className="text-xs font-bold uppercase tracking-widest text-gray-500">Documento Gerado em</p>
            <p className="text-sm font-black uppercase">{format(new Date(), "dd/MM/yyyy HH:mm")}</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-8 mb-10">
          <div className="border border-gray-200 p-6 rounded-2xl">
            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Usos este Mês</p>
            <p className="text-3xl font-black">{data?.stats.thisMonthUsages}</p>
          </div>
          <div className="border border-gray-200 p-6 rounded-2xl">
            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Total Histórico</p>
            <p className="text-3xl font-black">{data?.stats.totalUsages}</p>
          </div>
          <div className="border border-gray-200 p-6 rounded-2xl">
            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Benefícios Ativos</p>
            <p className="text-3xl font-black">{data?.stats.activeBenefits}</p>
          </div>
        </div>

        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-300">
              <th className="py-4 text-xs font-black uppercase tracking-widest">Associado</th>
              <th className="py-4 text-xs font-black uppercase tracking-widest">Matrícula</th>
              <th className="py-4 text-xs font-black uppercase tracking-widest">Benefício</th>
              <th className="py-4 text-xs font-black uppercase tracking-widest text-right">Data / Hora</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {data?.monthlyUsages.map((usage: any) => (
              <tr key={usage.id}>
                <td className="py-4">
                  <p className="text-sm font-black uppercase">{usage.member.name}</p>
                </td>
                <td className="py-4">
                  <p className="text-xs font-bold text-gray-600 uppercase">{usage.member.registrationNum}</p>
                </td>
                <td className="py-4">
                  <p className="text-xs font-black text-blue-600 uppercase">{usage.benefit.title}</p>
                </td>
                <td className="py-4 text-right">
                  <p className="text-xs font-black">{format(new Date(usage.usedAt), "dd/MM/yyyy")}</p>
                  <p className="text-[10px] font-bold text-gray-500">{format(new Date(usage.usedAt), "HH:mm")}</p>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="mt-20 pt-10 border-t border-gray-200 text-center">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.5em]">Dk Sind - Sistema de Gestão Sindical Elite</p>
        </div>
      </div>
    </div>
  );
}
