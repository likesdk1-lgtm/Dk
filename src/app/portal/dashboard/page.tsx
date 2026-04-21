"use client";

import React, { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { MembershipCard } from "@/components/MembershipCard";
import { QRCodeSVG } from "qrcode.react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Briefcase as Tooth, 
  Wallet, 
  Bell, 
  Download, 
  LogOut, 
  User, 
  QrCode, 
  CreditCard,
  ShieldCheck,
  Zap,
  Clock,
  ChevronRight,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Printer,
  Calendar,
  HeartHandshake,
  X,
  MessageSquare,
  Building2,
  Newspaper,
  Settings
} from "lucide-react";

export default function MemberPortalDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [member, setMember] = useState<any>(null);
  const [billings, setBillings] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [settings, setSettings] = useState<any>(null);
  const [events, setEvents] = useState<any[]>([]);
  const [benefits, setBenefits] = useState<any[]>([]);
  const [redeemedBenefits, setRedeemedBenefits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"geral" | "financeiro" | "contratos">("geral");
  const [pixModal, setPixModal] = useState<{ isOpen: boolean; code: string; image: string; loading: boolean }>({
    isOpen: false,
    code: "",
    image: "",
    loading: false,
  });
  const [checkinModal, setCheckinModal] = useState(false);
  const [isCardModalOpen, setIsCardModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [selectedBenefit, setSelectedBenefit] = useState<any>(null);
  const [selectedRedeemed, setSelectedRedeemed] = useState<any>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated") {
      fetchDashboardData();
    }
  }, [status]);

  const fetchDashboardData = async () => {
    setError(null);
    try {
      console.log("[DASHBOARD] Buscando dados da API...");
      const dashRes = await axios.get("/api/portal/dashboard");
      console.log("[DASHBOARD] Dados recebidos:", JSON.stringify(dashRes.data, null, 2));

      if (!dashRes.data.member) {
        throw new Error("Dados do associado não encontrados na resposta da API.");
      }
      
      setMember(dashRes.data.member);
      setBillings(dashRes.data.billings || []);
      setNotifications(dashRes.data.notifications || []);
      setSettings(dashRes.data.settings || { unionName: "Dk Sind" });
      setEvents(dashRes.data.events || []);
      setBenefits(dashRes.data.benefits || []);
      setRedeemedBenefits(dashRes.data.redeemedBenefits || []);
      console.log("[DASHBOARD] Eventos setados:", dashRes.data.events?.length || 0);
      console.log("[DASHBOARD] Benefícios setados:", dashRes.data.benefits?.length || 0);
      console.log("[DASHBOARD] Resgatados setados:", dashRes.data.redeemedBenefits?.length || 0);
    } catch (err: any) {
      console.error("[DASHBOARD] Erro ao carregar dashboard:", err);
      const msg = err.response?.data?.error || err.message || "Erro desconhecido";
      setError(`Falha ao carregar dados: ${msg}`);
    } finally {
      setLoading(false);
    }
  };

  const handleGeneratePix = async (billingId: string) => {
    setPixModal({ isOpen: true, code: "", image: "", loading: true });
    try {
      const response = await axios.post("/api/portal/billing/generate-pix", { billingId });
      setPixModal({
        isOpen: true,
        code: response.data.pixCode,
        image: response.data.pixUrl, // A API retorna pixUrl que contém o QR Code Base64
        loading: false,
      });
    } catch (err: any) {
      console.error("Erro ao gerar PIX", err.response?.data || err.message);
      alert(err.response?.data?.error || "Erro ao gerar PIX. Verifique as configurações da API Efí.");
      setPixModal({ isOpen: false, code: "", image: "", loading: false });
    }
  };

  const handlePrintCard = () => {
    const printContent = document.getElementById("membership-card-to-print");
    if (!printContent) {
      window.print();
      return;
    }
    
    const originalContent = document.body.innerHTML;
    const cardHtml = printContent.innerHTML;
    
    document.body.innerHTML = `
      <html>
        <head>
          <title>Carteira Digital - ${member?.name}</title>
          <style>
            body { background: white; margin: 0; padding: 20px; display: flex; justify-content: center; align-items: center; min-height: 100vh; font-family: sans-serif; }
            @page { size: auto; margin: 0mm; }
            .print-container { width: 100%; max-width: 400px; }
            * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          </style>
        </head>
        <body>
          <div class="print-container">${cardHtml}</div>
          <script>
            setTimeout(() => {
              window.print();
              window.location.reload();
            }, 500);
          </script>
        </body>
      </html>
    `;
  };

  const handleSupport = () => {
    if (settings?.supportLink) {
      window.open(settings.supportLink, "_blank");
    } else if (settings?.whatsAppNumber) {
      window.open(`https://wa.me/${settings.whatsAppNumber.replace(/\D/g, "")}`, "_blank");
    } else {
      alert("Link de suporte não configurado. Por favor, entre em contato com a administração.");
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center">
        <div className="relative">
          <div className="w-24 h-24 border-4 border-emerald-500/10 border-t-emerald-500 rounded-full animate-spin shadow-[0_0_30px_rgba(16,185,129,0.3)]" />
          <div className="absolute inset-0 flex items-center justify-center">
            <Tooth className="w-8 h-8 text-emerald-500 animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020617] text-white font-sans selection:bg-emerald-500/30 overflow-x-hidden">
      {/* Dynamic Background Elements */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 right-0 w-[300px] md:w-[500px] h-[300px] md:h-[500px] bg-blue-600/5 rounded-full blur-[80px] md:blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-[300px] md:w-[500px] h-[300px] md:h-[500px] bg-emerald-600/5 rounded-full blur-[80px] md:blur-[120px]" />
      </div>

      {/* Header Profissional */}
      <header className="sticky top-0 z-50 bg-[#020617]/80 backdrop-blur-2xl border-b border-white/5">
        <div className="container mx-auto px-4 md:px-8 py-4 md:py-5 flex justify-between items-center">
          <div className="flex items-center gap-3 md:gap-4 group">
            <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-br from-emerald-600 to-blue-600 rounded-lg md:rounded-xl flex items-center justify-center text-white shadow-lg group-hover:rotate-6 transition-transform">
              <ShieldCheck className="w-5 h-5 md:w-6 md:h-6" />
            </div>
            <div>
              <h1 className="text-lg md:text-xl font-black text-white uppercase tracking-tighter leading-none">Portal do Associado</h1>
              <p className="text-[8px] md:text-[9px] font-bold text-emerald-400 uppercase tracking-[0.2em] md:tracking-[0.3em] mt-0.5 md:mt-1">
                {(session?.user as any)?.tenantInitials || "Dk Sind"}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 md:gap-6">
            <div className="hidden sm:flex flex-col items-end mr-2 md:mr-4">
              <span className="text-xs md:text-sm font-black text-white uppercase tracking-tight">{member?.name?.split(' ')[0]}</span>
              <span className="text-[8px] md:text-[9px] font-bold text-gray-500 uppercase tracking-widest">ID: {member?.registrationNum}</span>
            </div>
            <button 
              onClick={() => signOut()}
              className="p-2.5 md:p-3 bg-white/5 hover:bg-red-500/10 text-gray-400 hover:text-red-500 rounded-lg md:rounded-xl border border-white/10 transition-all group"
            >
              <LogOut className="w-4 h-4 md:w-5 md:h-5 group-hover:-translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Navigation Tabs */}
      <div className="container mx-auto px-4 mt-6 flex lg:hidden">
        <div className="flex bg-white/5 backdrop-blur-3xl p-1 rounded-xl border border-white/10 w-full">
          <button 
            onClick={() => setActiveTab("geral")}
            className={`flex-1 py-3 rounded-lg font-black uppercase tracking-widest text-[9px] transition-all ${
              activeTab === "geral" 
                ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/20" 
                : "text-gray-500 hover:text-white"
            }`}
          >
            Dashboard
          </button>
          <button 
            onClick={() => setActiveTab("financeiro")}
            className={`flex-1 py-3 rounded-lg font-black uppercase tracking-widest text-[9px] transition-all ${
              activeTab === "financeiro" 
                ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/20" 
                : "text-gray-500 hover:text-white"
            }`}
          >
            Financeiro
          </button>
          <button 
            onClick={() => setActiveTab("contratos")}
            className={`flex-1 py-3 rounded-lg font-black uppercase tracking-widest text-[9px] transition-all ${
              activeTab === "contratos" 
                ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/20" 
                : "text-gray-500 hover:text-white"
            }`}
          >
            Contratos
          </button>
        </div>
      </div>

      <main className="container mx-auto px-4 md:px-8 py-8 md:py-12 relative z-10">
        {error && (
          <div className="mb-8 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3 text-red-500">
            <AlertCircle className="w-5 h-5" />
            <p className="text-sm font-bold uppercase tracking-tight">{error}</p>
            <button 
              onClick={() => fetchDashboardData()}
              className="ml-auto px-4 py-2 bg-red-500 text-white text-[10px] font-black rounded-lg uppercase tracking-widest hover:bg-red-600 transition-colors"
            >
              Tentar Novamente
            </button>
          </div>
        )}
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-12">
          {/* Main Column - Financeiro */}
          <div className={`lg:col-span-2 space-y-8 md:space-y-12 ${activeTab === "geral" && "hidden lg:block"}`}>
            {activeTab === "financeiro" && (
              <section className="space-y-6 md:space-y-8 animate-in fade-in slide-in-from-left-4 duration-500">
                <div className="flex justify-between items-end">
                  <div>
                    <div className="flex items-center gap-2 md:gap-3 mb-1 md:mb-2">
                      <div className="w-6 h-6 md:w-8 md:h-8 bg-emerald-500/10 rounded-lg flex items-center justify-center text-emerald-500">
                        <Wallet className="w-4 h-4 md:w-5 md:h-5" />
                      </div>
                      <h2 className="text-2xl md:text-3xl font-black text-white uppercase tracking-tighter">Financeiro</h2>
                    </div>
                    <p className="text-gray-500 text-[8px] md:text-[10px] font-bold uppercase tracking-[0.2em] md:tracking-[0.3em] ml-8 md:ml-11">Histórico de mensalidades</p>
                  </div>
                </div>

                {/* Desktop View */}
                <div className="hidden md:block bg-white/5 backdrop-blur-3xl rounded-[2rem] md:rounded-[2.5rem] border border-white/10 overflow-hidden shadow-2xl">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-white/5 border-b border-white/5">
                        <th className="px-8 py-6 text-[10px] font-black text-emerald-500 uppercase tracking-[0.3em]">Mês Referência</th>
                        <th className="px-8 py-6 text-[10px] font-black text-emerald-500 uppercase tracking-[0.3em]">Vencimento</th>
                        <th className="px-8 py-6 text-[10px] font-black text-emerald-500 uppercase tracking-[0.3em]">Valor</th>
                        <th className="px-8 py-6 text-[10px] font-black text-emerald-500 uppercase tracking-[0.3em]">Status</th>
                        <th className="px-8 py-6 text-[10px] font-black text-emerald-500 uppercase tracking-[0.3em] text-right">Ação</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {billings.map((bill) => (
                        <tr key={bill.id} className="hover:bg-white/[0.02] transition-colors group/row">
                          <td className="px-8 py-6">
                            <span className="text-sm font-black text-white uppercase tracking-tighter group-hover/row:text-emerald-400 transition-colors">
                              {format(new Date(bill.dueDate), "MMMM/yyyy", { locale: ptBR })}
                            </span>
                          </td>
                          <td className="px-8 py-6">
                            <div className="flex items-center gap-2">
                              <Clock className="w-3.5 h-3.5 text-gray-600" />
                              <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">
                                {format(new Date(bill.dueDate), "dd/MM/yyyy")}
                              </span>
                            </div>
                          </td>
                          <td className="px-8 py-6">
                            <span className="text-sm font-black text-white tabular-nums tracking-tight">
                              {formatCurrency(Number(bill.amount))}
                            </span>
                          </td>
                          <td className="px-8 py-6">
                            <span className={`px-4 py-1.5 text-[9px] font-black rounded-full uppercase tracking-widest border shadow-sm ${
                              bill.status === "PAID" 
                                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" 
                                : "bg-amber-500/10 text-amber-400 border-amber-500/20 animate-pulse"
                            }`}>
                              {bill.status === "PAID" ? "Liquidado" : "Aguardando"}
                            </span>
                          </td>
                          <td className="px-8 py-6 text-right">
                            {bill.status !== "PAID" && (
                              <button 
                                onClick={() => handleGeneratePix(bill.id)}
                                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-xl shadow-lg shadow-emerald-900/20 transition-all uppercase tracking-widest text-[9px] flex items-center gap-2 ml-auto group/pix"
                              >
                                <Zap className="w-3.5 h-3.5 group-hover/pix:scale-125 transition-transform" /> Gerar PIX
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile View */}
                <div className="md:hidden space-y-4">
                  {billings.map((bill) => (
                    <div key={bill.id} className="bg-white/5 backdrop-blur-3xl p-6 rounded-3xl border border-white/10 shadow-xl">
                      <div className="flex justify-between items-start mb-6">
                        <div>
                          <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest mb-1">Mês Referência</p>
                          <h4 className="text-xl font-black text-white uppercase tracking-tighter">
                            {format(new Date(bill.dueDate), "MMMM/yyyy", { locale: ptBR })}
                          </h4>
                        </div>
                        <span className={`px-4 py-1.5 text-[9px] font-black rounded-full uppercase tracking-widest border shadow-sm ${
                          bill.status === "PAID" 
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" 
                            : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                        }`}>
                          {bill.status === "PAID" ? "Pago" : "Pendente"}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-6 mb-6">
                        <div>
                          <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest mb-1">Valor</p>
                          <p className="text-lg font-black text-white">{formatCurrency(Number(bill.amount))}</p>
                        </div>
                        <div>
                          <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest mb-1">Vencimento</p>
                          <p className="text-sm font-bold text-white/60">{format(new Date(bill.dueDate), "dd/MM/yyyy")}</p>
                        </div>
                      </div>
                      {bill.status !== "PAID" && (
                        <button 
                          onClick={() => handleGeneratePix(bill.id)}
                          className="w-full py-4 bg-emerald-600 text-white font-black rounded-2xl shadow-lg shadow-emerald-900/20 transition-all uppercase tracking-widest text-[10px] flex items-center justify-center gap-3"
                        >
                          <Zap className="w-4 h-4" /> Gerar PIX
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {activeTab === "contratos" && (
              <section className="space-y-6 md:space-y-8 animate-in fade-in slide-in-from-left-4 duration-500">
                <div className="flex justify-between items-end">
                  <div>
                    <div className="flex items-center gap-2 md:gap-3 mb-1 md:mb-2">
                      <div className="w-6 h-6 md:w-8 md:h-8 bg-blue-500/10 rounded-lg flex items-center justify-center text-blue-500">
                        <Newspaper className="w-4 h-4 md:w-5 md:h-5" />
                      </div>
                      <h2 className="text-2xl md:text-3xl font-black text-white uppercase tracking-tighter">Contratos</h2>
                    </div>
                    <p className="text-gray-500 text-[8px] md:text-[10px] font-bold uppercase tracking-[0.2em] md:tracking-[0.3em] ml-8 md:ml-11">Documentos e Termos de Adesão</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-8 bg-white/5 backdrop-blur-3xl rounded-[2.5rem] border border-white/10 space-y-6 group hover:border-blue-500/30 transition-all">
                    <div className="w-14 h-14 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-500">
                      <Download className="w-6 h-6" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-xl font-black text-white uppercase tracking-tight">Termo de Adesão</h3>
                      <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest leading-relaxed">
                        Baixe seu contrato de associado preenchido automaticamente com seus dados.
                      </p>
                    </div>
                    <button 
                      onClick={async () => {
                        alert("Gerando contrato em PDF... Aguarde um momento.");
                        // Futura implementação de PDF real
                      }}
                      className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-xl transition-all uppercase tracking-widest text-[9px] flex items-center justify-center gap-2"
                    >
                      <Download className="w-4 h-4" /> Baixar Contrato (PDF)
                    </button>
                  </div>

                  <div className="p-8 bg-white/5 backdrop-blur-3xl rounded-[2.5rem] border border-white/10 space-y-6 group hover:border-emerald-500/30 transition-all">
                    <div className="w-14 h-14 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-500">
                      <Settings className="w-6 h-6" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-xl font-black text-white uppercase tracking-tight">Solicitar Edição</h3>
                      <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest leading-relaxed">
                        Precisa alterar alguma informação no seu contrato? Solicite à nossa equipe.
                      </p>
                    </div>
                    <button 
                      onClick={handleSupport}
                      className="w-full py-4 bg-white/5 hover:bg-white/10 text-white font-black rounded-xl border border-white/10 transition-all uppercase tracking-widest text-[9px] flex items-center justify-center gap-2"
                    >
                      Solicitar Alteração
                    </button>
                  </div>
                </div>
              </section>
            )}
          </div>

          {/* Sidebar Column - Dashboard Info */}
          <div className={`space-y-8 md:space-y-12 ${activeTab === "financeiro" && "hidden lg:block"}`}>
            {/* Identidade Digital */}
            <section className="space-y-6 md:space-y-8">
              <div className="flex items-center gap-2 md:gap-3">
                <div className="w-6 h-6 md:w-8 md:h-8 bg-emerald-500/10 rounded-lg flex items-center justify-center text-emerald-500">
                  <CreditCard className="w-4 h-4 md:w-5 md:h-5" />
                </div>
                <h2 className="text-2xl md:text-3xl font-black text-white uppercase tracking-tighter">Identidade Digital</h2>
              </div>
              
              <div 
                onClick={() => setIsCardModalOpen(true)}
                className="relative group cursor-pointer"
              >
                <div className="absolute inset-0 bg-emerald-500/20 rounded-[2rem] md:rounded-[3rem] blur-[20px] md:blur-[40px] opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="scale-[0.85] sm:scale-100 origin-top" id="membership-card-to-print">
                  <MembershipCard 
                    member={member} 
                    unionName={settings?.unionName} 
                    initials={(session?.user as any)?.tenantInitials}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={() => setCheckinModal(true)}
                  className="flex flex-col items-center gap-2 p-4 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/10 transition-all group/btn"
                >
                  <QrCode className="w-5 h-5 text-blue-400 group-hover/btn:-translate-y-1 transition-transform" />
                  <span className="text-[8px] font-black text-white uppercase tracking-widest text-center">Check-in Digital</span>
                </button>
                <button 
                  onClick={handlePrintCard}
                  className="flex flex-col items-center gap-2 p-4 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/10 transition-all group/btn"
                >
                  <Printer className="w-5 h-5 text-emerald-400 group-hover/btn:-translate-y-1 transition-transform" />
                  <span className="text-[8px] font-black text-white uppercase tracking-widest text-center">Imprimir Cartão</span>
                </button>
              </div>
            </section>

            {/* Event Presence Section - Moved here for mobile dashboard visibility */}
            <section className="space-y-6 md:space-y-8">
              <div className="flex items-center gap-2 md:gap-3 mb-1 md:mb-2">
                <div className="w-6 h-6 md:w-8 md:h-8 bg-blue-500/10 rounded-lg flex items-center justify-center text-blue-500">
                  <Calendar className="w-4 h-4 md:w-5 md:h-5" />
                </div>
                <h2 className="text-2xl md:text-3xl font-black text-white uppercase tracking-tighter">Eventos</h2>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {events.length > 0 ? (
                  events.map((checkin) => (
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      key={checkin.id}
                      onClick={() => setSelectedEvent(checkin)}
                      className="bg-white/5 backdrop-blur-3xl p-5 rounded-3xl border border-white/10 shadow-xl cursor-pointer group hover:border-blue-500/30 transition-all"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div className="p-2 bg-blue-500/10 rounded-xl text-blue-500">
                          <CheckCircle2 className="w-4 h-4" />
                        </div>
                        <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-500 text-[7px] font-black rounded-full uppercase tracking-widest border border-emerald-500/20">
                          Presente
                        </span>
                      </div>
                      <h4 className="text-sm font-black text-white uppercase tracking-tighter group-hover:text-blue-400 transition-colors line-clamp-1">
                        {checkin.event.title}
                      </h4>
                      <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest mt-1">
                        {format(new Date(checkin.event.date), "dd/MM/yyyy")}
                      </p>
                    </motion.div>
                  ))
                ) : (
                  <div className="py-8 bg-white/5 rounded-[2rem] border border-white/10 border-dashed text-center">
                    <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Nenhum evento registrado</p>
                  </div>
                )}
              </div>
            </section>

            {/* Support Widget */}
            <section className="p-8 bg-gradient-to-br from-emerald-600/10 to-blue-600/10 rounded-[2.5rem] border border-white/10 relative overflow-hidden group">
              <div className="relative z-10 space-y-4">
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-emerald-600 shadow-xl">
                  <AlertCircle className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-black text-white uppercase tracking-tighter">Suporte Premium</h3>
                <p className="text-[10px] text-white/50 font-medium leading-relaxed uppercase tracking-wider">Precisa de auxílio? Nossa equipe de elite está pronta para atender.</p>
                <button 
                  onClick={handleSupport}
                  className="w-full py-4 bg-white text-[#020617] font-black rounded-xl hover:bg-emerald-500 hover:text-white transition-all uppercase tracking-widest text-[9px] flex items-center justify-center gap-2"
                >
                  Falar com Suporte <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </section>

            {/* Benefits Section */}
            <section className="space-y-6 md:space-y-8">
              <div className="flex items-center gap-2 md:gap-3 mb-1 md:mb-2">
                <div className="w-6 h-6 md:w-8 md:h-8 bg-pink-500/10 rounded-lg flex items-center justify-center text-pink-500">
                  <HeartHandshake className="w-4 h-4 md:w-5 md:h-5" />
                </div>
                <h2 className="text-2xl md:text-3xl font-black text-white uppercase tracking-tighter">Benefícios</h2>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {benefits.length > 0 ? (
                  benefits.map((benefit) => (
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      key={benefit.id}
                      onClick={() => setSelectedBenefit(benefit)}
                      className="bg-white/5 backdrop-blur-3xl p-5 rounded-3xl border border-white/10 shadow-xl cursor-pointer group hover:border-pink-500/30 transition-all overflow-hidden relative"
                    >
                      <div className="absolute top-0 right-0 p-4 flex flex-col items-end gap-2">
                        <span className="px-2.5 py-1 bg-pink-500/10 text-pink-500 text-[7px] font-black rounded-full uppercase tracking-widest border border-pink-500/20">
                          {benefit.category}
                        </span>
                        {benefit.company?.name && (
                          <span className="text-[7px] font-black text-blue-400 uppercase tracking-widest bg-blue-500/5 px-2 py-1 rounded-md border border-blue-500/10">
                            {benefit.company.name}
                          </span>
                        )}
                      </div>
                      
                      <div className="flex gap-4">
                        {benefit.imageUrl && (
                          <div className="w-16 h-16 rounded-2xl overflow-hidden border border-white/10 flex-shrink-0">
                            <img src={benefit.imageUrl} alt="" className="w-full h-full object-cover" />
                          </div>
                        )}
                        <div className="flex flex-col justify-center">
                          <h4 className="text-sm font-black text-white uppercase tracking-tighter group-hover:text-pink-400 transition-colors line-clamp-1 pr-20">
                            {benefit.title}
                          </h4>
                          <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest mt-1 line-clamp-2 pr-4">
                            {benefit.description}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="py-8 bg-white/5 rounded-[2rem] border border-white/10 border-dashed text-center">
                    <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Nenhum benefício disponível</p>
                  </div>
                )}
              </div>
            </section>

            {/* Redeemed Benefits Section */}
            <section className="space-y-6 md:space-y-8">
              <div className="flex items-center gap-2 md:gap-3 mb-1 md:mb-2">
                <div className="w-6 h-6 md:w-8 md:h-8 bg-emerald-500/10 rounded-lg flex items-center justify-center text-emerald-500">
                  <CheckCircle2 className="w-4 h-4 md:w-5 md:h-5" />
                </div>
                <h2 className="text-2xl md:text-3xl font-black text-white uppercase tracking-tighter">Benefícios Resgatados</h2>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {redeemedBenefits.length > 0 ? (
                  redeemedBenefits.map((usage) => (
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      key={usage.id}
                      onClick={() => setSelectedRedeemed(usage)}
                      className="bg-white/5 backdrop-blur-3xl p-5 rounded-3xl border border-white/10 shadow-xl cursor-pointer group hover:border-emerald-500/30 transition-all overflow-hidden relative"
                    >
                      <div className="absolute top-0 right-0 p-4">
                        <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-500 text-[7px] font-black rounded-full uppercase tracking-widest border border-emerald-500/20">
                          Utilizado
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 border border-emerald-500/20">
                          <Zap className="w-6 h-6" />
                        </div>
                        <div className="flex flex-col justify-center">
                          <h4 className="text-sm font-black text-white uppercase tracking-tighter group-hover:text-emerald-400 transition-colors line-clamp-1 pr-20">
                            {usage.benefit.title}
                          </h4>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[9px] font-black text-blue-400 uppercase tracking-widest">{usage.company.name}</span>
                            <div className="w-1 h-1 rounded-full bg-white/10" />
                            <span className="text-[8px] font-bold text-gray-500 uppercase tracking-widest">
                              {format(new Date(usage.usedAt), "dd/MM/yyyy")}
                            </span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="py-8 bg-white/5 rounded-[2rem] border border-white/10 border-dashed text-center">
                    <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Nenhum benefício resgatado ainda</p>
                  </div>
                )}
              </div>
            </section>
          </div>
        </div>

        {/* Footer Credit */}
        <div className="mt-20 py-8 border-t border-white/5 text-center">
          <p className="text-[10px] font-black text-gray-700 uppercase tracking-[0.5em]">Desenvolvido por Dk Code</p>
        </div>
      </main>

      {/* Elite PIX Modal */}
      <AnimatePresence>
        {pixModal.isOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setPixModal({ ...pixModal, isOpen: false })}
              className="absolute inset-0 bg-[#020617]/90 backdrop-blur-xl"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-lg bg-white/5 border border-white/10 rounded-[2rem] md:rounded-[4rem] p-8 md:p-12 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1 md:h-2 bg-gradient-to-r from-emerald-600 via-blue-600 to-emerald-600" />
              
              <div className="text-center space-y-6 md:space-y-8">
                <div className="w-16 h-16 md:w-20 md:h-20 bg-emerald-500/10 rounded-2xl md:rounded-3xl flex items-center justify-center text-emerald-500 mx-auto border border-emerald-500/20 shadow-inner">
                  <Zap className="w-8 h-8 md:w-10 md:h-10" />
                </div>
                
                <p className="text-xl md:text-2xl font-black text-white uppercase tracking-tighter px-4 md:px-8">Escaneie o QR Code abaixo para efetuar o pagamento.</p>

                <div className="bg-white p-6 md:p-10 rounded-[2rem] md:rounded-[3rem] shadow-inner max-w-[240px] md:max-w-[280px] mx-auto group">
                  {pixModal.loading ? (
                    <div className="aspect-square flex items-center justify-center">
                      <div className="w-12 h-12 md:w-16 md:h-16 border-4 border-emerald-500/10 border-t-emerald-500 rounded-full animate-spin" />
                    </div>
                  ) : (
                    <img src={pixModal.image} alt="PIX QR Code" className="w-full group-hover:scale-105 transition-transform duration-500" />
                  )}
                </div>

                <div className="space-y-3 md:space-y-4 pt-4 md:pt-8">
                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText(pixModal.code);
                      alert("Código PIX copiado!");
                    }}
                    className="w-full py-4 md:py-5 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-xl md:rounded-2xl shadow-xl shadow-emerald-900/20 transition-all uppercase tracking-widest text-[9px] md:text-[10px] flex items-center justify-center gap-2 md:gap-3"
                  >
                    <CheckCircle2 className="w-4 h-4 md:w-5 md:h-5" /> Copiar Código
                  </button>
                  <button 
                    onClick={() => setPixModal({ ...pixModal, isOpen: false })}
                    className="w-full py-4 md:py-5 bg-white/5 hover:bg-white/10 text-white font-black rounded-xl md:rounded-2xl border border-white/10 transition-all uppercase tracking-widest text-[9px] md:text-[10px]"
                  >
                    Fechar Terminal
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Check-in QR Code Modal */}
      <AnimatePresence>
        {checkinModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setCheckinModal(false)}
              className="absolute inset-0 bg-[#020617]/95 backdrop-blur-xl"
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white/5 border border-white/10 rounded-[3rem] p-10 shadow-2xl relative z-10 max-w-sm w-full overflow-hidden text-center"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-emerald-500" />
              
              <div className="mb-8">
                <h3 className="text-xl font-black text-white uppercase tracking-tighter">
                  Check-in <span className="text-blue-500">Digital</span>
                </h3>
                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mt-1">Apresente este QR Code para acesso</p>
              </div>

              <div className="bg-white p-8 rounded-[2.5rem] shadow-2xl inline-block group">
                <QRCodeSVG 
                  value={JSON.stringify({
                    id: member?.id,
                    name: member?.name,
                    registration: member?.registrationNum,
                    timestamp: new Date().toISOString()
                  })} 
                  size={200}
                  className="w-48 h-48 group-hover:scale-105 transition-transform duration-500"
                />
              </div>

              <div className="mt-8 space-y-4">
                <div className="px-6 py-4 bg-white/5 rounded-2xl border border-white/10">
                  <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Status de Acesso</p>
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-xs font-black text-white uppercase tracking-widest">Validado • {member?.status === "ACTIVE" ? "Ativo" : "Inativo"}</span>
                  </div>
                </div>
                
                <button
                  onClick={() => setCheckinModal(false)}
                  className="w-full py-5 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-2xl shadow-xl shadow-blue-900/40 transition-all uppercase tracking-widest text-[10px]"
                >
                  Fechar
                </button>
              </div>
            </motion.div>
          </div>
        )}
       </AnimatePresence>

      {/* Modal da Carteirinha com Opções */}
      <AnimatePresence>
        {isCardModalOpen && member && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCardModalOpen(false)}
              className="absolute inset-0 bg-[#020617]/95 backdrop-blur-xl"
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white/5 border border-white/10 rounded-[3rem] p-6 md:p-10 shadow-2xl relative z-10 max-w-lg w-full overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-blue-500" />
              
              <div className="mb-8 text-center">
                <h3 className="text-xl font-black text-white uppercase tracking-tighter">
                  Identidade <span className="text-emerald-500">Digital</span>
                </h3>
                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mt-1">{settings?.unionName || "Dk Sind"} • Sindicato Digital</p>
              </div>

              <div className="relative group mb-8">
                <div className="absolute -inset-4 bg-emerald-500/10 rounded-[2rem] blur-2xl opacity-50" />
                <MembershipCard member={member} unionName={settings?.unionName} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={handlePrintCard}
                  className="flex flex-col items-center gap-2 p-4 bg-white/5 hover:bg-white/10 text-white font-black rounded-2xl border border-white/10 transition-all uppercase tracking-widest text-[9px] group/btn"
                >
                  <Printer className="w-5 h-5 text-emerald-500 group-hover/btn:-translate-y-1 transition-transform" />
                  Imprimir
                </button>
                <button
                  onClick={() => {
                    setIsCardModalOpen(false);
                    setCheckinModal(true);
                  }}
                  className="flex flex-col items-center gap-2 p-4 bg-white/5 hover:bg-white/10 text-white font-black rounded-2xl border border-white/10 transition-all uppercase tracking-widest text-[9px] group/btn"
                >
                  <QrCode className="w-5 h-5 text-blue-500 group-hover/btn:-translate-y-1 transition-transform" />
                  Check-in
                </button>
              </div>

              <button
                onClick={() => setIsCardModalOpen(false)}
                className="w-full mt-6 py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-2xl shadow-xl shadow-emerald-900/40 transition-all uppercase tracking-widest text-[10px]"
              >
                Fechar
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Event Presence Modal */}
      <AnimatePresence>
        {selectedEvent && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedEvent(null)}
              className="absolute inset-0 bg-[#020617]/95 backdrop-blur-xl"
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white/5 border border-white/10 rounded-[3rem] p-8 md:p-12 shadow-2xl relative z-10 max-w-md w-full overflow-hidden text-center"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-emerald-500" />
              
              <div className="w-20 h-20 bg-emerald-500/10 rounded-3xl flex items-center justify-center text-emerald-500 mx-auto mb-8 border border-emerald-500/20 shadow-inner">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <h3 className="text-2xl font-black text-white uppercase tracking-tighter mb-2">Presença Confirmada</h3>
              <p className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.3em] mb-8">Acesso Validado com Sucesso</p>

              <div className="space-y-6 text-left">
                <div className="bg-white/5 p-6 rounded-2xl border border-white/5">
                  <p className="text-[8px] font-black text-gray-500 uppercase tracking-widest mb-1">Evento</p>
                  <p className="text-lg font-black text-white uppercase tracking-tight">{selectedEvent.event.title}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                    <p className="text-[8px] font-black text-gray-500 uppercase tracking-widest mb-1">Data</p>
                    <p className="text-xs font-black text-white uppercase">{format(new Date(selectedEvent.checkedAt), "dd/MM/yyyy")}</p>
                  </div>
                  <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                    <p className="text-[8px] font-black text-gray-500 uppercase tracking-widest mb-1">Horário</p>
                    <p className="text-xs font-black text-white uppercase">{format(new Date(selectedEvent.checkedAt), "HH:mm:ss")}</p>
                  </div>
                </div>

                {selectedEvent.event.location && (
                  <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                    <p className="text-[8px] font-black text-gray-500 uppercase tracking-widest mb-1">Local</p>
                    <p className="text-xs font-black text-white uppercase truncate">{selectedEvent.event.location}</p>
                  </div>
                )}
              </div>

              <button
                onClick={() => setSelectedEvent(null)}
                className="w-full mt-10 py-5 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-2xl shadow-xl shadow-blue-900/40 transition-all uppercase tracking-widest text-[10px]"
              >
                Fechar
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Benefit Detail Modal */}
      <AnimatePresence>
        {selectedRedeemed && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedRedeemed(null)}
              className="absolute inset-0 bg-[#020617]/95 backdrop-blur-xl"
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white/5 border border-white/10 rounded-[3rem] p-8 md:p-10 shadow-2xl relative z-10 max-w-lg w-full overflow-hidden"
            >
              <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-500">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <h3 className="text-2xl font-black text-white uppercase tracking-tighter">Benefício <span className="text-emerald-500">Resgatado</span></h3>
                </div>
                <button onClick={() => setSelectedRedeemed(null)} className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl text-gray-400 transition-colors"><X className="w-5 h-5" /></button>
              </div>

              <div className="space-y-8">
                <div className="bg-emerald-500/5 border border-emerald-500/10 p-6 rounded-[2rem] text-center">
                  <h4 className="text-xl font-black text-white uppercase tracking-tighter mb-2">{selectedRedeemed.benefit.title}</h4>
                  <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Resgate Confirmado</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/5 p-5 rounded-3xl border border-white/10">
                    <p className="text-[8px] font-black text-gray-500 uppercase tracking-widest mb-1">Empresa</p>
                    <p className="text-xs font-black text-white uppercase tracking-tight">{selectedRedeemed.company.name}</p>
                  </div>
                  <div className="bg-white/5 p-5 rounded-3xl border border-white/10">
                    <p className="text-[8px] font-black text-gray-500 uppercase tracking-widest mb-1">Data do Uso</p>
                    <p className="text-xs font-black text-white uppercase tracking-tight">{format(new Date(selectedRedeemed.usedAt), "dd/MM/yyyy")}</p>
                  </div>
                </div>

                <div className="bg-white/5 p-6 rounded-3xl border border-white/10 flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-500">
                    <Building2 className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-[8px] font-black text-gray-500 uppercase tracking-widest mb-0.5">Local do Resgate</p>
                    <p className="text-sm font-black text-white uppercase tracking-tight">{selectedRedeemed.company.name}</p>
                  </div>
                </div>

                <button 
                  onClick={() => setSelectedRedeemed(null)}
                  className="w-full py-5 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-2xl uppercase tracking-widest text-[10px] shadow-2xl shadow-emerald-900/20 transition-all"
                >
                  Fechar Detalhes
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedBenefit && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedBenefit(null)}
              className="absolute inset-0 bg-[#020617]/95 backdrop-blur-xl"
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white/5 border border-white/10 rounded-[3rem] p-8 md:p-12 shadow-2xl relative z-10 max-w-lg w-full overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-pink-500 to-blue-500" />
              
              <div className="flex justify-between items-start mb-8">
                <span className="px-4 py-1.5 bg-pink-500/10 text-pink-500 text-[9px] font-black rounded-full uppercase tracking-widest border border-pink-500/20">
                  {selectedBenefit.category}
                </span>
                <button
                  onClick={() => setSelectedBenefit(null)}
                  className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/10 text-gray-400 hover:text-white transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {selectedBenefit.imageUrl && (
                <div className="w-full aspect-video rounded-[2rem] overflow-hidden mb-8 border border-white/10 shadow-2xl">
                  <img src={selectedBenefit.imageUrl} alt="" className="w-full h-full object-cover" />
                </div>
              )}

              <div className="text-center md:text-left">
                <h3 className="text-2xl font-black text-white uppercase tracking-tighter mb-4">{selectedBenefit.title}</h3>
                <p className="text-sm text-gray-400 font-medium leading-relaxed mb-10">
                  {selectedBenefit.description}
                </p>
              </div>

              <div className="space-y-4">
                {selectedBenefit.link && (
                  <button
                    onClick={() => window.open(selectedBenefit.link, "_blank")}
                    className="w-full py-5 bg-pink-600 hover:bg-pink-500 text-white font-black rounded-2xl shadow-xl shadow-pink-900/40 transition-all uppercase tracking-widest text-[10px] flex items-center justify-center gap-3"
                  >
                    <ExternalLink className="w-4 h-4" /> Acessar Benefício
                  </button>
                )}
                <button
                  onClick={() => setSelectedBenefit(null)}
                  className="w-full py-5 bg-white/5 hover:bg-white/10 text-white font-black rounded-2xl border border-white/10 transition-all uppercase tracking-widest text-[10px]"
                >
                  Fechar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
