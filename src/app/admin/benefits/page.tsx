"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { 
  HeartHandshake, 
  Activity, 
  Search, 
  Filter, 
  Plus, 
  ExternalLink, 
  Trash2,
  ChevronRight,
  Building2,
  X,
  ShieldCheck,
  Phone,
  MapPin,
  Mail,
  Lock,
  Calendar,
  XCircle
} from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

export default function AdminBenefitsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const userRole = (session?.user as any)?.role?.toUpperCase();
  const isAdmin = userRole === "ADMIN" || userRole === "SUPER_ADMIN";
  const categories: string[] = ["Saúde", "Educação", "Serviços", "Lazer", "Comércio", "Outros"];

  const [benefits, setBenefits] = useState<any[]>([]);
  const [partners, setPartners] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<"benefits" | "partners">("benefits");
  const [isNewBenefitOpen, setIsNewBenefitOpen] = useState(false);
  const [isNewPartnerOpen, setIsNewPartnerOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }

    if (status === "authenticated" && userRole === "MEMBER") {
      router.push("/portal/dashboard");
      return;
    }

    const loadData = async () => {
      setError(null);
      try {
        await Promise.all([
          fetchBenefits(),
          fetchPartners()
        ]);
      } catch (err: any) {
        console.error("Erro ao carregar dados", err);
        setError("Não foi possível carregar todas as informações. Verifique sua conexão.");
      } finally {
        setLoading(false);
      }
    };
    
    if (status === "authenticated") {
      loadData();
    }
  }, [status, userRole]);

  const fetchBenefits = async () => {
    try {
      const response = await axios.get("/api/admin/benefits");
      if (response.data.error) throw new Error(response.data.error);
      setBenefits(Array.isArray(response.data) ? response.data : []);
    } catch (err: any) {
      console.error("Falha ao carregar benefícios");
      throw err;
    }
  };

  const fetchPartners = async () => {
    try {
      const response = await axios.get("/api/admin/benefits/partners");
      if (response.data.error) throw new Error(response.data.error);
      setPartners(Array.isArray(response.data) ? response.data : []);
    } catch (err: any) {
      console.error("Falha ao carregar parceiros");
      throw err;
    }
  };

  // Form states
  const [benefitFormData, setBenefitFormData] = useState({
    title: "",
    description: "",
    category: "Saúde",
    link: "",
    companyId: "",
    monthlyLimit: 0,
  });

  const [partnerFormData, setPartnerFormData] = useState({
    name: "",
    document: "",
    email: "",
    password: "",
    phone: "",
    address: "",
    category: "Geral",
  });

  const handleSaveBenefit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post("/api/admin/benefits", benefitFormData);
      setIsNewBenefitOpen(false);
      setBenefitFormData({ title: "", description: "", category: "Saúde", link: "", companyId: "", monthlyLimit: 0 });
      fetchBenefits();
    } catch (err) {
      console.error("Erro ao salvar benefício", err);
    }
  };

  const handleSavePartner = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post("/api/admin/benefits/partners", partnerFormData);
      setIsNewPartnerOpen(false);
      setPartnerFormData({ name: "", document: "", email: "", password: "", phone: "", address: "", category: "Geral" });
      fetchPartners();
    } catch (err: any) {
      alert(err.response?.data?.error || "Erro ao salvar parceiro");
    }
  };

  const handleDeleteBenefit = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este benefício?")) return;
    try {
      await axios.delete(`/api/admin/benefits/${id}`);
      fetchBenefits();
    } catch (err) {
      console.error("Erro ao excluir benefício", err);
      alert("Erro ao excluir benefício");
    }
  };

  const handleDeletePartner = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir esta empresa parceira?")) return;
    try {
      await axios.delete(`/api/admin/benefits/partners/${id}`);
      fetchPartners();
    } catch (err) {
      console.error("Erro ao excluir parceiro", err);
      alert("Erro ao excluir parceiro");
    }
  };

  const filteredBenefits = benefits.filter(b => 
    b.title.toLowerCase().includes(search.toLowerCase()) || 
    (b.company?.name && b.company.name.toLowerCase().includes(search.toLowerCase()))
  );

  const filteredPartners = partners.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) || 
    p.document.includes(search)
  );

  if (loading || status === "loading") {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest animate-pulse">Carregando Informações...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-10 bg-[#020617] min-h-screen text-white font-sans">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h1 className="text-4xl font-black text-white uppercase tracking-tighter">
            Benefícios & <span className="text-emerald-500">Parcerias</span>
          </h1>
          <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mt-1">Gestão de convênios e empresas parceiras do sindicato</p>
        </div>
        
        <div className="flex gap-4">
          {isAdmin && (
            <>
              <button
                onClick={() => setIsNewPartnerOpen(true)}
                className="px-6 py-4 bg-white/5 hover:bg-white/10 text-white font-black rounded-2xl border border-white/10 transition-all uppercase tracking-widest text-[10px] flex items-center gap-2"
              >
                <Building2 className="w-4 h-4 text-blue-500" />
                Nova Empresa
              </button>
              <button
                onClick={() => setIsNewBenefitOpen(true)}
                className="px-6 py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-2xl shadow-xl shadow-emerald-900/20 transition-all uppercase tracking-widest text-[10px] flex items-center gap-2 group"
              >
                <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform duration-300" />
                Novo Benefício
              </button>
            </>
          )}
        </div>
      </header>

      {/* Tabs */}
      <div className="flex gap-2 p-1.5 bg-white/5 rounded-2xl w-fit border border-white/5">
        <button
          onClick={() => setActiveTab("benefits")}
          className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
            activeTab === "benefits" ? "bg-emerald-600 text-white shadow-lg" : "text-gray-500 hover:text-white"
          }`}
        >
          Benefícios
        </button>
        <button
          onClick={() => setActiveTab("partners")}
          className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
            activeTab === "partners" ? "bg-blue-600 text-white shadow-lg" : "text-gray-500 hover:text-white"
          }`}
        >
          Empresas Parceiras
        </button>
      </div>

      {/* Search & Filter */}
      <div className="bg-white/5 backdrop-blur-xl p-6 rounded-[2.5rem] border border-white/10 shadow-2xl flex flex-col md:flex-row gap-6">
        <div className="flex-1 relative">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
          <input
            type="text"
            placeholder={activeTab === "benefits" ? "BUSCAR BENEFÍCIO..." : "BUSCAR EMPRESA..."}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-14 pr-6 py-4 bg-white/5 border border-white/10 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500 transition-all text-[10px] font-black uppercase tracking-widest text-white"
          />
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === "benefits" ? (
          <motion.div 
            key="benefits"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {filteredBenefits.length > 0 ? (
              filteredBenefits.map((benefit) => (
                <div key={benefit.id} className="bg-white/5 backdrop-blur-xl p-8 rounded-[3rem] border border-white/10 shadow-2xl hover:border-emerald-500/30 transition-all group relative overflow-hidden">
                  <div className="relative z-10">
                    <div className="flex justify-between items-start mb-6">
                      <div className="w-16 h-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-500 group-hover:scale-110 transition-transform border border-emerald-500/20">
                        <Activity className="w-8 h-8" />
                      </div>
                      <div className="absolute top-0 right-0 p-6 flex flex-col items-end gap-2">
                        <span className="px-3 py-1 bg-emerald-500/10 text-emerald-500 text-[8px] font-black rounded-full uppercase tracking-widest border border-emerald-500/20">
                          {benefit.category}
                        </span>
                        {benefit.company?.name && (
                          <span className="px-3 py-1 bg-blue-500/10 text-blue-500 text-[8px] font-black rounded-full uppercase tracking-widest border border-blue-500/20">
                            {benefit.company.name}
                          </span>
                        )}
                      </div>
                    </div>
                    <h3 className="text-xl font-black text-white uppercase tracking-tight mb-4 group-hover:text-emerald-400 transition-colors">
                      {benefit.title}
                    </h3>
                    <p className="text-xs text-gray-400 font-medium leading-relaxed mb-8 line-clamp-3">
                      {benefit.description}
                    </p>
                    
                    {benefit.company && (
                      <div className="mb-6 flex items-center gap-2 p-3 bg-white/5 rounded-xl border border-white/5">
                        <Building2 className="w-3.5 h-3.5 text-blue-400" />
                        <span className="text-[9px] font-black text-blue-400 uppercase tracking-widest truncate">{benefit.company.name}</span>
                      </div>
                    )}

                    <div className="flex gap-4">
                      <a
                        href={benefit.link}
                        target="_blank"
                        className="flex-1 py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-xl transition-all text-[9px] uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/20"
                      >
                        Acessar
                        <ExternalLink className="w-3 h-3" />
                      </a>
                      {isAdmin && (
                        <button 
                          onClick={() => handleDeleteBenefit(benefit.id)}
                          className="w-14 h-14 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white rounded-xl flex items-center justify-center transition-all border border-red-500/20"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full py-20 bg-white/5 rounded-[3rem] border border-white/10 border-dashed text-center">
                <p className="text-gray-500 text-xs font-black uppercase tracking-[0.3em]">Nenhum benefício encontrado</p>
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div 
            key="partners"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {filteredPartners.length > 0 ? (
              filteredPartners.map((partner) => (
                <div key={partner.id} className="bg-white/5 backdrop-blur-xl p-8 rounded-[3rem] border border-white/10 shadow-2xl hover:border-blue-500/30 transition-all group relative">
                  <div className="flex justify-between items-start mb-6">
                    <div className="w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-500 border border-blue-500/20">
                      <Building2 className="w-8 h-8" />
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span className={`px-3 py-1 text-[8px] font-black uppercase tracking-widest rounded-full border ${
                        partner.status === "ACTIVE" ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-red-500/10 text-red-500 border-red-500/20"
                      }`}>
                        {partner.status === "ACTIVE" ? "Ativo" : "Inativo"}
                      </span>
                      <span className="text-[8px] font-black text-gray-500 uppercase tracking-widest">{partner.category}</span>
                    </div>
                  </div>

                  <h3 className="text-xl font-black text-white uppercase tracking-tight mb-6">{partner.name}</h3>

                  <div className="space-y-3 mb-8">
                    <div className="flex items-center gap-3 text-gray-400">
                      <ShieldCheck className="w-4 h-4 text-blue-500" />
                      <span className="text-[10px] font-bold uppercase tracking-widest">{partner.document}</span>
                    </div>
                    {partner.email && (
                      <div className="flex items-center gap-3 text-gray-400">
                        <Mail className="w-4 h-4 text-blue-500" />
                        <span className="text-[10px] font-bold uppercase tracking-widest truncate">{partner.email}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-3 text-gray-400">
                      <Calendar className="w-4 h-4 text-blue-500" />
                      <span className="text-[10px] font-bold uppercase tracking-widest">{partner._count?.usages || 0} Usos este mês</span>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <button
                      onClick={() => window.location.href = `/admin/benefits/partners/${partner.id}`}
                      className="flex-1 py-4 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-xl transition-all text-[9px] uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-blue-900/20"
                    >
                      Ver Relatório
                      <ChevronRight className="w-3 h-3" />
                    </button>
                    {isAdmin && (
                      <button 
                        onClick={() => handleDeletePartner(partner.id)}
                        className="w-14 h-14 bg-white/5 hover:bg-red-500/10 text-gray-400 hover:text-red-500 rounded-xl flex items-center justify-center transition-all border border-white/10"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full py-20 bg-white/5 rounded-[3rem] border border-white/10 border-dashed text-center">
                <p className="text-gray-500 text-xs font-black uppercase tracking-[0.3em]">Nenhuma empresa parceira encontrada</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modals ... */}
      <AnimatePresence>
        {isNewBenefitOpen && (
          <div className="fixed inset-0 bg-[#020617]/90 backdrop-blur-xl z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-slate-900 border border-white/10 rounded-[3rem] p-10 shadow-2xl w-full max-w-xl relative"
            >
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-3xl font-black text-white uppercase tracking-tighter">Novo <span className="text-emerald-500">Benefício</span></h3>
                <button onClick={() => setIsNewBenefitOpen(false)} className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl text-gray-400"><X className="w-5 h-5" /></button>
              </div>
              
              <form onSubmit={handleSaveBenefit} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Título</label>
                  <input
                    type="text" required
                    value={benefitFormData.title}
                    onChange={(e) => setBenefitFormData({ ...benefitFormData, title: e.target.value })}
                    className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500 text-sm font-bold text-white"
                  />
                </div>

                <div className="grid grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Categoria</label>
                    <select
                      value={benefitFormData.category}
                      onChange={(e) => setBenefitFormData({ ...benefitFormData, category: e.target.value })}
                      className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase text-white [color-scheme:dark] outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      {categories.map((c: string) => (
                        <option key={c} value={c} className="bg-slate-900">
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Empresa Parceira</label>
                    <select
                      value={benefitFormData.companyId}
                      onChange={(e) => setBenefitFormData({ ...benefitFormData, companyId: e.target.value })}
                      className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase text-white [color-scheme:dark] outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="" className="bg-slate-900">Nenhuma</option>
                      {partners.map(p => <option key={p.id} value={p.id} className="bg-slate-900">{p.name}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Limite Mensal</label>
                    <input
                      type="number" required min="0"
                      value={benefitFormData.monthlyLimit}
                      onChange={(e) => setBenefitFormData({ ...benefitFormData, monthlyLimit: parseInt(e.target.value) })}
                      className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500 text-sm font-bold text-white"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Link de Acesso</label>
                  <input
                    type="url" required
                    value={benefitFormData.link}
                    onChange={(e) => setBenefitFormData({ ...benefitFormData, link: e.target.value })}
                    className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500 text-sm font-bold text-white"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Descrição</label>
                  <textarea
                    required rows={3}
                    value={benefitFormData.description}
                    onChange={(e) => setBenefitFormData({ ...benefitFormData, description: e.target.value })}
                    className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500 text-sm font-bold resize-none text-white"
                  />
                </div>

                <button type="submit" className="w-full py-5 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-2xl uppercase tracking-widest text-[10px] shadow-2xl shadow-emerald-900/20 transition-all">
                  Cadastrar Benefício
                </button>
              </form>
            </motion.div>
          </div>
        )}

        {isNewPartnerOpen && (
          <div className="fixed inset-0 bg-[#020617]/90 backdrop-blur-xl z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-slate-900 border border-white/10 rounded-[3rem] p-10 shadow-2xl w-full max-w-xl relative"
            >
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-3xl font-black text-white uppercase tracking-tighter">Nova <span className="text-blue-500">Empresa Parceira</span></h3>
                <button onClick={() => setIsNewPartnerOpen(false)} className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl text-gray-400"><X className="w-5 h-5" /></button>
              </div>
              
              <form onSubmit={handleSavePartner} className="space-y-5">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Nome da Empresa</label>
                  <input
                    type="text" required
                    value={partnerFormData.name}
                    onChange={(e) => setPartnerFormData({ ...partnerFormData, name: e.target.value })}
                    className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 text-sm font-bold text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">CNPJ / CPF</label>
                    <input
                      type="text" required
                      value={partnerFormData.document}
                      onChange={(e) => setPartnerFormData({ ...partnerFormData, document: e.target.value })}
                      className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 text-sm font-bold text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Categoria</label>
                    <input
                      type="text"
                      value={partnerFormData.category}
                      onChange={(e) => setPartnerFormData({ ...partnerFormData, category: e.target.value })}
                      className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 text-sm font-bold text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">E-mail de Login</label>
                    <input
                      type="email"
                      value={partnerFormData.email}
                      onChange={(e) => setPartnerFormData({ ...partnerFormData, email: e.target.value })}
                      className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 text-sm font-bold text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Senha de Acesso</label>
                    <input
                      type="password" required
                      value={partnerFormData.password}
                      onChange={(e) => setPartnerFormData({ ...partnerFormData, password: e.target.value })}
                      className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 text-sm font-bold text-white"
                    />
                  </div>
                </div>

                <button type="submit" className="w-full py-5 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-2xl uppercase tracking-widest text-[10px] shadow-2xl shadow-blue-900/20 transition-all mt-4">
                  Cadastrar Empresa Parceira
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
