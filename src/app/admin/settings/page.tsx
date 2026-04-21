"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { 
  CreditCard, 
  Smartphone, 
  Globe, 
  Lock, 
  Palette, 
  Image as ImageIcon,
  Save,
  Check,
  Activity,
  ChevronRight,
  ShieldAlert,
  Newspaper,
  Receipt,
  Database,
  Download,
  Upload,
  FileJson,
  Bot
} from "lucide-react";

export default function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState("sindicato");
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState<any>({
    unionName: "Dk Sind",
    initials: "",
    logoUrl: "",
    googleAnalyticsId: "",
    whatsAppToken: "",
    whatsAppApiKey: "",
    whatsAppInstance: "",
    whatsAppNumber: "",
    supportLink: "",
    monthlyGoal: 0,
    efiClientId: "",
    efiClientSecret: "",
    efiSandbox: true,
    efiCertificate: "",
    instagramAccount: "",
    youtubeAccount: "",
    facebookAccount: "",
    homePageContent: {
      heroTitle: "Dk Sind - Gestão Sindical de Alta Performance",
      heroSubtitle: "A infraestrutura digital completa para o seu sindicato, focada em resultados e transparência.",
      heroBg: "",
      stats: [
        { label: "Associados Ativos", value: "2.5k+", icon: "Users" },
        { label: "Processos Ganhos", value: "840", icon: "Target" },
        { label: "Anos de História", value: "15", icon: "Star" },
        { label: "Suporte 24/7", value: "Live", icon: "Zap" }
      ],
      affiliateLink: "",
      sections: [
        { title: "Nossa Missão", text: "Proteger e fortalecer a categoria através da união.", icon: "Shield" },
        { title: "Benefícios", text: "Acesso a convênios exclusivos para associados.", icon: "Gift" }
      ]
    },
    footerContent: {
      address: "Brasil",
      email: "contato@dksind.com.br",
      phone: "(86) 9999-9999",
      copyright: "© 2026 Dk Sind. Todos os direitos reservados."
    },
    cardDesign: {
      primaryColor: "#1e3a8a",
      secondaryColor: "#2563eb",
      backgroundImage: "",
      watermark: true,
    }
  });
  const [gatewayLoading, setGatewayLoading] = useState(false);
  const [gatewaySaving, setGatewaySaving] = useState(false);
  const [gateway, setGateway] = useState<any>({
    provider: "EFI",
    efiClientId: "",
    efiClientSecret: "",
    efiPixKey: "",
    efiSandbox: true,
    efiCertificate: "",
    mpAccessToken: "",
    bbClientId: "",
    bbClientSecret: "",
    bbDeveloperKey: "",
    sicoobClientId: "",
    sicoobCertificate: "",
    itauClientId: "",
    itauClientSecret: "",
    itauCertificate: "",
  });
  const fetchGateway = async () => {
    setGatewayLoading(true);
    try {
      const response = await axios.get("/api/admin/payment-gateway");
      if (response.data?.gateway) {
        setGateway({
          provider: response.data.gateway.provider || "EFI",
          efiClientId: response.data.gateway.efiClientId || "",
          efiClientSecret: response.data.gateway.efiClientSecret || "",
          efiPixKey: response.data.gateway.efiPixKey || "",
          efiSandbox: typeof response.data.gateway.efiSandbox === "boolean" ? response.data.gateway.efiSandbox : true,
          efiCertificate: response.data.gateway.efiCertificate || "",
          mpAccessToken: response.data.gateway.mpAccessToken || "",
          bbClientId: response.data.gateway.bbClientId || "",
          bbClientSecret: response.data.gateway.bbClientSecret || "",
          bbDeveloperKey: response.data.gateway.bbDeveloperKey || "",
          sicoobClientId: response.data.gateway.sicoobClientId || "",
          sicoobCertificate: response.data.gateway.sicoobCertificate || "",
          itauClientId: response.data.gateway.itauClientId || "",
          itauClientSecret: response.data.gateway.itauClientSecret || "",
          itauCertificate: response.data.gateway.itauCertificate || "",
        });
      }
    } catch (err) {
      console.error("Erro ao carregar gateway", err);
    } finally {
      setGatewayLoading(false);
    }
  };
  const saveGateway = async () => {
    setGatewaySaving(true);
    try {
      await axios.patch("/api/admin/payment-gateway", {
        provider: gateway.provider,
        efiClientId: gateway.efiClientId,
        efiClientSecret: gateway.efiClientSecret,
        efiPixKey: gateway.efiPixKey,
        efiSandbox: Boolean(gateway.efiSandbox),
        efiCertificate: gateway.efiCertificate,
        mpAccessToken: gateway.mpAccessToken,
        bbClientId: gateway.bbClientId,
        bbClientSecret: gateway.bbClientSecret,
        bbDeveloperKey: gateway.bbDeveloperKey,
        sicoobClientId: gateway.sicoobClientId,
        sicoobCertificate: gateway.sicoobCertificate,
        itauClientId: gateway.itauClientId,
        itauClientSecret: gateway.itauClientSecret,
        itauCertificate: gateway.itauCertificate,
      });
      alert("Gateway salvo com sucesso!");
    } catch (err: any) {
      const msg = err?.response?.data?.error || "Erro ao salvar gateway";
      alert(msg);
    } finally {
      setGatewaySaving(false);
    }
  };

  const handleFileToBase64 = (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSettings({ ...settings, [field]: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSettings({ ...settings, logoUrl: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);
  useEffect(() => {
    if (activeTab === "gateway") fetchGateway();
  }, [activeTab]);

  const fetchSettings = async () => {
    try {
      const response = await axios.get("/api/admin/settings");
      if (response.data) {
        setSettings(response.data);
      }
    } catch (err) {
      console.error("Erro ao carregar configurações", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      console.log("Salvando configurações...");
      const response = await axios.post("/api/admin/settings", settings);
      
      if (response.data) {
        // Garantir que não estamos salvando strings JSON como objetos se a API retornar algo estranho
        const newSettings = { ...response.data };
        if (typeof newSettings.homePageContent === 'string') newSettings.homePageContent = JSON.parse(newSettings.homePageContent);
        if (typeof newSettings.cardDesign === 'string') newSettings.cardDesign = JSON.parse(newSettings.cardDesign);
        if (typeof newSettings.footerContent === 'string') newSettings.footerContent = JSON.parse(newSettings.footerContent);
        
        setSettings(newSettings);
      }
      
      setSuccess(true);
      alert("Configurações salvas com sucesso!");
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      console.error("Erro ao salvar:", err);
      const errorMsg = err.response?.data?.message || err.response?.data?.error || "Ocorreu um erro inesperado ao salvar.";
      alert("ERRO AO SALVAR: " + errorMsg);
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    { id: "sindicato", label: "Sindicato", icon: Activity },
    { id: "home", label: "Página Inicial", icon: Globe },
    { id: "automation", label: "Automático AI", icon: Bot },
    { id: "financeiro", label: "Cobranças", icon: Receipt },
    { id: "carteirinha", label: "Carteirinha", icon: CreditCard },
    { id: "gateway", label: "Gateway Pag.", icon: CreditCard },
    { id: "integracoes", label: "Integrações API", icon: Smartphone },
    { id: "dados", label: "Dados & Backup", icon: Database },
    { id: "perfis", label: "Perfis de Acesso", icon: Lock },
    { id: "seguranca", label: "Segurança", icon: ShieldAlert },
    { id: "online", label: "Online", icon: Activity },
  ];

  const handleExport = async () => {
    try {
      const response = await axios.get("/api/admin/settings/export");
      const dataStr = JSON.stringify(response.data, null, 2);
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `backup_sindicato_${new Date().toISOString().split('T')[0]}.json`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Erro ao exportar:", err);
      alert("Erro ao exportar dados. Verifique o console para mais detalhes.");
    }
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!confirm("Isso irá sobrescrever os dados atuais. Tem certeza?")) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        await axios.post("/api/admin/settings/import", data);
        alert("Dados importados com sucesso!");
        fetchSettings();
      } catch (err) {
        alert("Erro ao importar dados. Verifique o formato do arquivo.");
      }
    };
    reader.readAsText(file);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-8 space-y-10 bg-[#020617] min-h-screen text-white">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black text-white uppercase tracking-tighter">Configurações</h1>
          <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mt-1">Personalize a identidade e integrações do sistema</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-10 py-4 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-2xl shadow-2xl shadow-blue-900/20 transition-all uppercase tracking-widest text-[10px] flex items-center gap-3 group"
        >
          {success ? <Check className="w-5 h-5" /> : <Save className={`w-5 h-5 ${saving ? "animate-spin" : "group-hover:scale-110 transition-transform"}`} />}
          {saving ? "Salvando..." : success ? "Salvo com Sucesso!" : "Salvar Alterações"}
        </button>
      </header>

      <div className="flex gap-10">
        {/* Sidebar Tabs */}
        <aside className="w-72 shrink-0">
          <div className="bg-slate-900/40 p-4 rounded-[2.5rem] border border-white/5 shadow-2xl space-y-2 sticky top-8 backdrop-blur-xl">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  if (tab.id === "perfis") window.location.href = "/admin/settings/profiles";
                  else if (tab.id === "seguranca") window.location.href = "/admin/security";
                  else if (tab.id === "online") window.location.href = "/admin/online";
                  else if (tab.id === "financeiro") window.location.href = "/admin/billing";
                  else setActiveTab(tab.id);
                }}
                className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all group ${
                  activeTab === tab.id 
                    ? "bg-blue-600 text-white shadow-xl shadow-blue-900/40" 
                    : "text-gray-500 hover:bg-white/10 hover:text-white"
                }`}
              >
                <tab.icon className={`w-5 h-5 ${activeTab === tab.id ? "text-white" : "group-hover:scale-110 transition-transform"}`} />
                <span className="text-[10px] font-black uppercase tracking-widest">{tab.label}</span>
                {activeTab === tab.id && <ChevronRight className="w-4 h-4 ml-auto" />}
              </button>
            ))}
          </div>
        </aside>

        {/* Content Area */}
        <main className="flex-1">
          <div className="bg-slate-900/40 p-12 rounded-[4rem] border border-white/5 shadow-2xl min-h-[600px] backdrop-blur-xl animate-in fade-in slide-in-from-right-10 duration-500">
            {activeTab === "sindicato" && (
              <div className="space-y-12">
                <div className="flex justify-between items-center pb-6 border-b border-white/5">
                  <h2 className="text-2xl font-black text-white uppercase tracking-tighter">Dados do Sindicato</h2>
                </div>
                <div className="grid grid-cols-2 gap-10">
                  <div className="col-span-2 space-y-3">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Nome Oficial do Sindicato</label>
                    <input
                      type="text"
                      value={settings.unionName}
                      onChange={(e) => setSettings({ ...settings, unionName: e.target.value })}
                      className="w-full px-8 py-5 bg-black/20 border border-white/10 rounded-[2rem] outline-none focus:ring-4 focus:ring-blue-500/20 transition-all text-sm font-bold text-white"
                    />
                  </div>
                  <div className="col-span-2 space-y-3">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Sigla do Sindicato</label>
                    <input
                      type="text"
                      placeholder="Ex: SINTASB"
                      value={settings.initials || ""}
                      onChange={(e) => setSettings({ ...settings, initials: e.target.value.toUpperCase() })}
                      className="w-full px-8 py-5 bg-black/20 border border-white/10 rounded-[2rem] outline-none focus:ring-4 focus:ring-blue-500/20 transition-all text-sm font-bold text-white"
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Logo do Sindicato</label>
                    <div className="relative h-48 bg-black/20 border-4 border-dashed border-white/10 rounded-[2.5rem] flex flex-col items-center justify-center gap-4 group hover:border-blue-500/50 transition-colors overflow-hidden">
                      {settings.logoUrl ? (
                        <img src={settings.logoUrl} alt="Logo" className="w-full h-full object-contain p-4" />
                      ) : (
                        <ImageIcon className="w-10 h-10 text-gray-600 group-hover:scale-110 transition-transform" />
                      )}
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={handleLogoUpload}
                        className="absolute inset-0 opacity-0 cursor-pointer" 
                      />
                      <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <ImageIcon className="w-8 h-8 text-white" />
                        <span className="text-[9px] font-black text-white uppercase tracking-widest">Alterar Imagem Logo</span>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-6">
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Meta do Mês (R$)</label>
                      <input
                        type="text"
                        placeholder="0,00"
                        value={settings.monthlyGoal}
                        onChange={(e) => {
                          const val = e.target.value.replace(/[^0-9.,]/g, "");
                          setSettings({ ...settings, monthlyGoal: val });
                        }}
                        className="w-full px-6 py-4 bg-black/20 border border-white/10 rounded-2xl outline-none text-white font-bold focus:ring-2 focus:ring-blue-500/20"
                      />
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Instagram</label>
                      <input
                        type="text"
                        placeholder="@perfil..."
                        value={settings.instagramAccount}
                        onChange={(e) => setSettings({ ...settings, instagramAccount: e.target.value })}
                        className="w-full px-6 py-4 bg-black/20 border border-white/10 rounded-2xl outline-none text-white font-bold focus:ring-2 focus:ring-blue-500/20"
                      />
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">YouTube Channel</label>
                      <input
                        type="text"
                        placeholder="ID do Canal..."
                        value={settings.youtubeAccount}
                        onChange={(e) => setSettings({ ...settings, youtubeAccount: e.target.value })}
                        className="w-full px-6 py-4 bg-black/20 border border-white/10 rounded-2xl outline-none text-white font-bold focus:ring-2 focus:ring-blue-500/20"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "home" && (
              <div className="space-y-12">
                <div className="flex justify-between items-center pb-6 border-b border-white/5">
                  <h2 className="text-2xl font-black text-white uppercase tracking-tighter">Página Inicial & Rodapé</h2>
                </div>
                <div className="space-y-10">
                  <div className="p-8 bg-blue-500/5 rounded-[2.5rem] border border-blue-500/10 space-y-6">
                    <h3 className="text-xs font-black text-blue-400 uppercase tracking-[0.2em] flex items-center gap-3">
                      <Palette className="w-4 h-4" />
                      Hero Section (Topo do Site)
                    </h3>
                    <div className="space-y-6">
                      <div className="space-y-3">
                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Título Principal</label>
                        <input
                          type="text"
                          value={settings.homePageContent?.heroTitle}
                          onChange={(e) => setSettings({ ...settings, homePageContent: { ...settings.homePageContent, heroTitle: e.target.value } })}
                          className="w-full px-6 py-4 bg-black/20 border border-white/10 rounded-2xl outline-none text-white font-bold focus:ring-2 focus:ring-blue-500/20"
                        />
                      </div>
                      <div className="space-y-3">
                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Subtítulo Informativo</label>
                        <textarea
                          rows={3}
                          value={settings.homePageContent?.heroSubtitle}
                          onChange={(e) => setSettings({ ...settings, homePageContent: { ...settings.homePageContent, heroSubtitle: e.target.value } })}
                          className="w-full px-6 py-4 bg-black/20 border border-white/10 rounded-2xl outline-none resize-none text-white font-bold focus:ring-2 focus:ring-blue-500/20"
                        />
                      </div>
                      <div className="space-y-3">
                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Link &quot;Se Filie&quot; Personalizado</label>
                        <input
                          type="text"
                          placeholder="https://wa.me/..."
                          value={settings.homePageContent?.affiliateLink}
                          onChange={(e) => setSettings({ ...settings, homePageContent: { ...settings.homePageContent, affiliateLink: e.target.value } })}
                          className="w-full px-6 py-4 bg-black/20 border border-white/10 rounded-2xl outline-none text-white font-bold focus:ring-2 focus:ring-blue-500/20"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="p-8 bg-black/20 border border-white/10 rounded-[2.5rem] space-y-6 shadow-2xl">
                    <h3 className="text-xs font-black text-white uppercase tracking-[0.2em] flex items-center gap-3">
                      <Activity className="w-4 h-4 text-blue-400" />
                      Números e Estatísticas
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                      {(settings.homePageContent?.stats || []).map((stat: any, idx: number) => (
                        <div key={idx} className="space-y-3 p-4 bg-white/5 rounded-2xl border border-white/5">
                          <label className="text-[8px] font-black text-gray-500 uppercase tracking-widest">{stat.label}</label>
                          <input
                            type="text"
                            value={stat.value}
                            onChange={(e) => {
                              const stats = [...settings.homePageContent.stats];
                              stats[idx].value = e.target.value;
                              setSettings({ ...settings, homePageContent: { ...settings.homePageContent, stats } });
                            }}
                            className="w-full bg-transparent border-b border-white/10 outline-none text-lg font-black text-white"
                          />
                          <input
                            type="text"
                            value={stat.label}
                            onChange={(e) => {
                              const stats = [...settings.homePageContent.stats];
                              stats[idx].label = e.target.value;
                              setSettings({ ...settings, homePageContent: { ...settings.homePageContent, stats } });
                            }}
                            className="w-full bg-transparent outline-none text-[9px] font-bold text-gray-500 uppercase"
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="p-8 bg-black/20 border border-white/10 rounded-[2.5rem] space-y-6 shadow-2xl">
                    <div className="flex justify-between items-center">
                      <h3 className="text-xs font-black text-white uppercase tracking-[0.2em] flex items-center gap-3">
                        <Check className="w-4 h-4 text-blue-400" />
                        Seções de Conteúdo (Cards)
                      </h3>
                      <button 
                        onClick={() => {
                          const sections = [...(settings.homePageContent?.sections || [])];
                          sections.push({ title: "Nova Seção", text: "Descrição aqui...", icon: "Activity" });
                          setSettings({ ...settings, homePageContent: { ...settings.homePageContent, sections } });
                        }}
                        className="px-4 py-2 bg-blue-500/10 text-blue-400 text-[9px] font-black uppercase rounded-xl hover:bg-blue-500/20 transition-colors"
                      >
                        + Adicionar Card
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {(settings.homePageContent?.sections || []).map((section: any, idx: number) => (
                        <div key={idx} className="p-6 bg-white/5 rounded-2xl border border-white/5 relative group">
                          <button 
                            onClick={() => {
                              const sections = settings.homePageContent.sections.filter((_: any, i: number) => i !== idx);
                              setSettings({ ...settings, homePageContent: { ...settings.homePageContent, sections } });
                            }}
                            className="absolute top-4 right-4 w-6 h-6 bg-red-500/10 text-red-500 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500 hover:text-white"
                          >
                            ×
                          </button>
                          <div className="space-y-4">
                            <input
                              type="text"
                              value={section.title}
                              onChange={(e) => {
                                const sections = [...settings.homePageContent.sections];
                                sections[idx].title = e.target.value;
                                setSettings({ ...settings, homePageContent: { ...settings.homePageContent, sections } });
                              }}
                              className="w-full bg-transparent border-b border-white/10 focus:border-blue-500 outline-none text-xs font-black uppercase tracking-widest text-white"
                              placeholder="Título da Seção"
                            />
                            <textarea
                              value={section.text}
                              onChange={(e) => {
                                const sections = [...settings.homePageContent.sections];
                                sections[idx].text = e.target.value;
                                setSettings({ ...settings, homePageContent: { ...settings.homePageContent, sections } });
                              }}
                              className="w-full bg-transparent resize-none outline-none text-[11px] font-bold text-gray-500"
                              rows={2}
                              placeholder="Texto da seção..."
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="p-8 bg-black/20 rounded-[2.5rem] border border-white/10 space-y-6 shadow-2xl">
                    <h3 className="text-xs font-black text-white uppercase tracking-[0.2em] flex items-center gap-3">
                      <Globe className="w-4 h-4 text-blue-400" />
                      Rodapé (Footer)
                    </h3>
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Endereço</label>
                        <input
                          type="text"
                          value={settings.footerContent?.address}
                          onChange={(e) => setSettings({ ...settings, footerContent: { ...settings.footerContent, address: e.target.value } })}
                          className="w-full px-6 py-4 bg-black/20 border border-white/10 rounded-2xl outline-none text-white font-bold"
                        />
                      </div>
                      <div className="space-y-3">
                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">E-mail de Contato</label>
                        <input
                          type="email"
                          value={settings.footerContent?.email}
                          onChange={(e) => setSettings({ ...settings, footerContent: { ...settings.footerContent, email: e.target.value } })}
                          className="w-full px-6 py-4 bg-black/20 border border-white/10 rounded-2xl outline-none text-white font-bold"
                        />
                      </div>
                      <div className="space-y-3">
                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Telefone/WhatsApp</label>
                        <input
                          type="text"
                          value={settings.footerContent?.phone}
                          onChange={(e) => setSettings({ ...settings, footerContent: { ...settings.footerContent, phone: e.target.value } })}
                          className="w-full px-6 py-4 bg-black/20 border border-white/10 rounded-2xl outline-none text-white font-bold"
                        />
                      </div>
                      <div className="space-y-3">
                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Copyright</label>
                        <input
                          type="text"
                          value={settings.footerContent?.copyright}
                          onChange={(e) => setSettings({ ...settings, footerContent: { ...settings.footerContent, copyright: e.target.value } })}
                          className="w-full px-6 py-4 bg-black/20 border border-white/10 rounded-2xl outline-none text-white font-bold"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "automation" && (
              <div className="space-y-12">
                <div className="flex justify-between items-center pb-6 border-b border-white/5">
                  <h2 className="text-2xl font-black text-white uppercase tracking-tighter">Automação AI WhatsApp</h2>
                  <div className="flex items-center gap-6">
                    <button 
                      onClick={async () => {
                        if (!confirm("Isso enviará 3 mensagens de teste para o primeiro associado ativo com WhatsApp. Deseja continuar?")) return;
                        try {
                          const response = await axios.post("/api/admin/automation/test");
                          alert(response.data.message);
                        } catch (err: any) {
                          alert("Erro ao enviar teste: " + err.response?.data?.error);
                        }
                      }}
                      className="px-6 py-3 bg-green-600/20 text-green-400 border border-green-500/20 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-green-500/30 transition-colors"
                    >
                      Testar Envio
                    </button>
                    <div className="flex items-center gap-3 bg-white/5 p-2 rounded-xl">
                      <span className="text-[9px] font-black uppercase tracking-widest text-gray-500 ml-2">Automação Ativa</span>
                      <button 
                        onClick={() => setSettings({ ...settings, automationEnabled: !settings.automationEnabled })}
                        className={`w-12 h-6 rounded-full transition-all relative ${settings.automationEnabled ? "bg-blue-500" : "bg-white/10"}`}
                      >
                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${settings.automationEnabled ? "left-7" : "left-1"}`} />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-10">
                  <div className="p-8 bg-blue-500/5 rounded-[2.5rem] border border-blue-500/10 space-y-6">
                    <h3 className="text-xs font-black text-blue-400 uppercase tracking-[0.2em] flex items-center gap-3">
                      <Receipt className="w-4 h-4" />
                      Mensagem de Cobrança Gerada
                    </h3>
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Mensagem Imediata (Use {"{nome}"} para o nome do associado)</label>
                      <textarea
                        rows={3}
                        value={settings.billingGeneratedMessage}
                        onChange={(e) => setSettings({ ...settings, billingGeneratedMessage: e.target.value })}
                        className="w-full px-6 py-4 bg-black/20 border border-white/10 rounded-2xl outline-none text-white font-bold focus:ring-2 focus:ring-blue-500/20"
                        placeholder="Ex: Olá {nome}, sua mensalidade já está disponível!"
                      />
                    </div>
                  </div>

                  <div className="p-8 bg-orange-500/5 rounded-[2.5rem] border border-orange-500/10 space-y-6">
                    <h3 className="text-xs font-black text-orange-400 uppercase tracking-[0.2em] flex items-center gap-3">
                      <Activity className="w-4 h-4" />
                      Lembrete de 3 Dias
                    </h3>
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Mensagem após 3 dias de atraso</label>
                      <textarea
                        rows={3}
                        value={settings.billingReminder3DaysMessage}
                        onChange={(e) => setSettings({ ...settings, billingReminder3DaysMessage: e.target.value })}
                        className="w-full px-6 py-4 bg-black/20 border border-white/10 rounded-2xl outline-none text-white font-bold focus:ring-2 focus:ring-orange-500/20"
                        placeholder="Ex: Olá {nome}, notamos que sua mensalidade ainda não foi paga..."
                      />
                    </div>
                  </div>

                  <div className="p-8 bg-red-500/5 rounded-[2.5rem] border border-red-500/10 space-y-6">
                    <h3 className="text-xs font-black text-red-400 uppercase tracking-[0.2em] flex items-center gap-3">
                      <ShieldAlert className="w-4 h-4" />
                      Lembrete de 15 Dias
                    </h3>
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Mensagem após 15 dias de atraso</label>
                      <textarea
                        rows={3}
                        value={settings.billingReminder15DaysMessage}
                        onChange={(e) => setSettings({ ...settings, billingReminder15DaysMessage: e.target.value })}
                        className="w-full px-6 py-4 bg-black/20 border border-white/10 rounded-2xl outline-none text-white font-bold focus:ring-2 focus:ring-red-500/20"
                        placeholder="Ex: Olá {nome}, sua mensalidade está com 15 dias de atraso..."
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "carteirinha" && (
              <div className="space-y-12">
                <div className="flex justify-between items-center pb-6 border-b border-white/5">
                  <h2 className="text-2xl font-black text-white uppercase tracking-tighter">Design da Carteirinha</h2>
                </div>
                <div className="grid grid-cols-2 gap-10">
                  <div className="space-y-8">
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Cor Primária (HEX)</label>
                      <div className="flex gap-4">
                        <input
                          type="color"
                          value={settings.cardDesign?.primaryColor}
                          onChange={(e) => setSettings({ ...settings, cardDesign: { ...settings.cardDesign, primaryColor: e.target.value } })}
                          className="w-20 h-14 bg-black/20 p-1 rounded-xl cursor-pointer border border-white/10"
                        />
                        <input
                          type="text"
                          value={settings.cardDesign?.primaryColor}
                          onChange={(e) => setSettings({ ...settings, cardDesign: { ...settings.cardDesign, primaryColor: e.target.value } })}
                          className="flex-1 px-6 py-4 bg-black/20 border border-white/10 rounded-xl outline-none text-[10px] font-black text-white"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Preview Area */}
                  <div className="space-y-6">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Preview do Design</label>
                    <div className="w-full aspect-[16/10] bg-black/20 rounded-[2.5rem] border border-white/5 flex items-center justify-center relative overflow-hidden group">
                      <div className="w-[300px] h-[180px] bg-[#020617] rounded-2xl shadow-2xl flex flex-col overflow-hidden transform group-hover:scale-105 transition-transform border border-white/10">
                        <div className="h-4 bg-blue-600" style={{ backgroundColor: settings.cardDesign?.primaryColor }}></div>
                        <div className="flex-1 p-4 flex gap-4">
                          <div className="w-14 h-20 bg-white/5 rounded"></div>
                          <div className="flex-1 space-y-2 pt-2">
                            <div className="h-2 w-3/4 bg-white/5 rounded"></div>
                            <div className="h-2 w-1/2 bg-white/5 rounded"></div>
                            <div className="h-2 w-2/3 bg-white/5 rounded mt-4"></div>
                          </div>
                        </div>
                        <div className="h-1 bg-blue-600 opacity-50" style={{ backgroundColor: settings.cardDesign?.primaryColor }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "gateway" && (
              <div className="space-y-12">
                <div className="flex justify-between items-center pb-6 border-b border-white/5">
                  <div>
                    <h2 className="text-2xl font-black text-white uppercase tracking-tighter">Gateway de Pagamento</h2>
                    <div className="mt-2 text-sm text-white/60">
                      Configure o gateway do sindicato para recebimentos PIX e acompanhamento de status
                    </div>
                  </div>
                  <button
                    onClick={saveGateway}
                    disabled={gatewayLoading || gatewaySaving}
                    className="px-6 py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black uppercase tracking-widest text-xs disabled:opacity-50"
                  >
                    {gatewaySaving ? "Salvando..." : "Salvar"}
                  </button>
                </div>

                <div className="p-8 bg-black/20 border border-white/10 rounded-[3rem] shadow-2xl space-y-6 backdrop-blur-xl">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Provedor</label>
                      <select
                        value={gateway.provider}
                        onChange={(e) => setGateway({ ...gateway, provider: e.target.value })}
                        className="w-full px-6 py-4 bg-black/20 border border-white/10 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all text-white font-bold"
                      >
                        <option value="EFI">Efí (Gerencianet)</option>
                        <option value="MERCADO_PAGO">Mercado Pago</option>
                        <option value="BANCO_DO_BRASIL">Banco do Brasil</option>
                        <option value="SICOOB">Sicoob</option>
                        <option value="ITAU">Itaú</option>
                      </select>
                    </div>
                    <div className="text-[10px] font-black uppercase tracking-widest text-white/50">
                      Status: PAGO / ATRASO / INADIMPLENTE
                    </div>
                  </div>
                </div>

                {gateway.provider === "EFI" && (
                  <div className="p-8 bg-black/20 border border-white/10 rounded-[3rem] shadow-2xl space-y-6 backdrop-blur-xl">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-black text-white uppercase tracking-widest">Efí PIX</h3>
                      <div className="flex items-center gap-3 bg-white/5 p-2 rounded-xl">
                        <span className="text-[9px] font-black uppercase tracking-widest text-gray-500 ml-2">Sandbox</span>
                        <button
                          onClick={() => setGateway({ ...gateway, efiSandbox: !gateway.efiSandbox })}
                          className={`w-12 h-6 rounded-full transition-all relative ${gateway.efiSandbox ? "bg-green-500" : "bg-white/10"}`}
                        >
                          <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${gateway.efiSandbox ? "left-7" : "left-1"}`} />
                        </button>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Client ID</label>
                        <input
                          type="text"
                          value={gateway.efiClientId}
                          onChange={(e) => setGateway({ ...gateway, efiClientId: e.target.value })}
                          className="w-full px-6 py-4 bg-black/20 border border-white/10 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all text-white font-bold"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Client Secret</label>
                        <input
                          type="password"
                          value={gateway.efiClientSecret}
                          onChange={(e) => setGateway({ ...gateway, efiClientSecret: e.target.value })}
                          className="w-full px-6 py-4 bg-black/20 border border-white/10 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all text-white font-bold"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Chave PIX</label>
                        <input
                          type="text"
                          value={gateway.efiPixKey}
                          onChange={(e) => setGateway({ ...gateway, efiPixKey: e.target.value })}
                          className="w-full px-6 py-4 bg-black/20 border border-white/10 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all text-white font-bold"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Certificado (.p12 Base64)</label>
                        <textarea
                          rows={3}
                          value={gateway.efiCertificate}
                          onChange={(e) => setGateway({ ...gateway, efiCertificate: e.target.value })}
                          className="w-full px-6 py-4 bg-black/20 border border-white/10 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all text-white font-bold"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {gateway.provider === "MERCADO_PAGO" && (
                  <div className="p-8 bg-black/20 border border-white/10 rounded-[3rem] shadow-2xl space-y-6 backdrop-blur-xl">
                    <h3 className="text-xs font-black text-white uppercase tracking-widest">Mercado Pago</h3>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Access Token</label>
                      <input
                        type="password"
                        value={gateway.mpAccessToken}
                        onChange={(e) => setGateway({ ...gateway, mpAccessToken: e.target.value })}
                        className="w-full px-6 py-4 bg-black/20 border border-white/10 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all text-white font-bold"
                      />
                    </div>
                  </div>
                )}

                {gateway.provider === "BANCO_DO_BRASIL" && (
                  <div className="p-8 bg-black/20 border border-white/10 rounded-[3rem] shadow-2xl space-y-6 backdrop-blur-xl">
                    <h3 className="text-xs font-black text-white uppercase tracking-widest">Banco do Brasil</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Client ID</label>
                        <input
                          type="text"
                          value={gateway.bbClientId}
                          onChange={(e) => setGateway({ ...gateway, bbClientId: e.target.value })}
                          className="w-full px-6 py-4 bg-black/20 border border-white/10 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all text-white font-bold"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Client Secret</label>
                        <input
                          type="password"
                          value={gateway.bbClientSecret}
                          onChange={(e) => setGateway({ ...gateway, bbClientSecret: e.target.value })}
                          className="w-full px-6 py-4 bg-black/20 border border-white/10 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all text-white font-bold"
                        />
                      </div>
                      <div className="col-span-2 space-y-2">
                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Developer Key</label>
                        <input
                          type="text"
                          value={gateway.bbDeveloperKey}
                          onChange={(e) => setGateway({ ...gateway, bbDeveloperKey: e.target.value })}
                          className="w-full px-6 py-4 bg-black/20 border border-white/10 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all text-white font-bold"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {gateway.provider === "SICOOB" && (
                  <div className="p-8 bg-black/20 border border-white/10 rounded-[3rem] shadow-2xl space-y-6 backdrop-blur-xl">
                    <h3 className="text-xs font-black text-white uppercase tracking-widest">Sicoob</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Client ID</label>
                        <input
                          type="text"
                          value={gateway.sicoobClientId}
                          onChange={(e) => setGateway({ ...gateway, sicoobClientId: e.target.value })}
                          className="w-full px-6 py-4 bg-black/20 border border-white/10 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all text-white font-bold"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Certificado (.pem / .p12 Base64)</label>
                        <textarea
                          rows={3}
                          value={gateway.sicoobCertificate}
                          onChange={(e) => setGateway({ ...gateway, sicoobCertificate: e.target.value })}
                          className="w-full px-6 py-4 bg-black/20 border border-white/10 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all text-white font-bold"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {gateway.provider === "ITAU" && (
                  <div className="p-8 bg-black/20 border border-white/10 rounded-[3rem] shadow-2xl space-y-6 backdrop-blur-xl">
                    <h3 className="text-xs font-black text-white uppercase tracking-widest">Itaú</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Client ID</label>
                        <input
                          type="text"
                          value={gateway.itauClientId}
                          onChange={(e) => setGateway({ ...gateway, itauClientId: e.target.value })}
                          className="w-full px-6 py-4 bg-black/20 border border-white/10 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all text-white font-bold"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Client Secret</label>
                        <input
                          type="password"
                          value={gateway.itauClientSecret}
                          onChange={(e) => setGateway({ ...gateway, itauClientSecret: e.target.value })}
                          className="w-full px-6 py-4 bg-black/20 border border-white/10 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all text-white font-bold"
                        />
                      </div>
                      <div className="col-span-2 space-y-2">
                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Certificado (.crt / .key Base64)</label>
                        <textarea
                          rows={3}
                          value={gateway.itauCertificate}
                          onChange={(e) => setGateway({ ...gateway, itauCertificate: e.target.value })}
                          className="w-full px-6 py-4 bg-black/20 border border-white/10 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all text-white font-bold"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === "integracoes" && (
              <div className="space-y-12">
                <div className="flex justify-between items-center pb-6 border-b border-white/5">
                  <h2 className="text-2xl font-black text-white uppercase tracking-tighter">Integrações API</h2>
                </div>
                <div className="grid grid-cols-1 gap-10">
                  {/* Google & WhatsApp */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <div className="p-8 bg-black/20 border border-white/10 rounded-[3rem] shadow-2xl space-y-6 group hover:border-blue-500/30 transition-all backdrop-blur-xl">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-400">
                          <Smartphone className="w-6 h-6" />
                        </div>
                        <h3 className="text-xs font-black text-white uppercase tracking-widest">Suporte WhatsApp</h3>
                      </div>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Link de Suporte (Portal)</label>
                          <input
                            type="text"
                            placeholder="https://wa.me/55..."
                            value={settings.supportLink}
                            onChange={(e) => setSettings({ ...settings, supportLink: e.target.value })}
                            className="w-full px-6 py-4 bg-black/20 border border-white/10 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500/20 transition-all text-white font-bold"
                          />
                          <p className="text-[8px] font-bold text-gray-500 uppercase tracking-widest mt-2 ml-1">
                            Este link será usado no botão de ajuda para os associados.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="p-8 bg-black/20 border border-white/10 rounded-[3rem] shadow-2xl space-y-6 group hover:border-blue-500/30 transition-all backdrop-blur-xl">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-orange-500/10 rounded-2xl flex items-center justify-center text-orange-400">
                          <Globe className="w-6 h-6" />
                        </div>
                        <h3 className="text-xs font-black text-white uppercase tracking-widest">Google Analytics</h3>
                      </div>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Measurement ID (G-XXXXXXX)</label>
                          <input
                            type="text"
                            value={settings.googleAnalyticsId}
                            onChange={(e) => setSettings({ ...settings, googleAnalyticsId: e.target.value })}
                            className="w-full px-6 py-4 bg-black/20 border border-white/10 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500/20 transition-all text-white font-bold"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "dados" && (
              <div className="space-y-12">
                <div className="flex justify-between items-center pb-6 border-b border-white/5">
                  <h2 className="text-2xl font-black text-white uppercase tracking-tighter">Dados & Backup</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="p-8 bg-blue-500/5 border border-blue-500/10 rounded-[2.5rem] space-y-6 group hover:border-blue-500/30 transition-all">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-500">
                        <Download className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="text-xs font-black text-white uppercase tracking-widest">Exportar Dados</h3>
                        <p className="text-[8px] font-bold text-gray-500 uppercase mt-1">Gera um arquivo JSON com todos os dados</p>
                      </div>
                    </div>
                    <button 
                      onClick={handleExport}
                      className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-xl transition-all uppercase tracking-widest text-[9px] flex items-center justify-center gap-2"
                    >
                      <FileJson className="w-4 h-4" /> Baixar Backup Completo
                    </button>
                  </div>

                  <div className="p-8 bg-orange-500/5 border border-orange-500/10 rounded-[2.5rem] space-y-6 group hover:border-orange-500/30 transition-all">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-orange-500/10 rounded-2xl flex items-center justify-center text-orange-500">
                        <Upload className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="text-xs font-black text-white uppercase tracking-widest">Importar Dados</h3>
                        <p className="text-[8px] font-bold text-gray-500 uppercase mt-1">Carregar dados de um arquivo de backup</p>
                      </div>
                    </div>
                    <div className="relative">
                      <input 
                        type="file" 
                        accept=".json"
                        onChange={handleImport}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                      <button className="w-full py-4 bg-orange-600 hover:bg-orange-500 text-white font-black rounded-xl transition-all uppercase tracking-widest text-[9px] flex items-center justify-center gap-2">
                        <Upload className="w-4 h-4" /> Selecionar Arquivo
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
