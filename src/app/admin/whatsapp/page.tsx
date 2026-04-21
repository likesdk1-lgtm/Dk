"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { useSession } from "next-auth/react";
import { 
  MessageSquare, 
  Send, 
  Search, 
  User, 
  Clock, 
  CheckCheck, 
  Phone,
  ExternalLink,
  ShieldCheck,
  Zap,
  MoreVertical,
  Filter,
  X,
  Paperclip,
  Image as ImageIcon,
  FileText,
  Video,
  Mic,
  Download,
  Globe,
  Users,
  LogOut,
  Smartphone
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { motion, AnimatePresence } from "framer-motion";

interface Message {
  id: string;
  memberId: string | null;
  adminId: string | null;
  admin?: { name: string };
  text: string | null;
  type: "SENT" | "RECEIVED";
  status: "DELIVERED" | "READ" | "PENDING";
  mediaUrl?: string | null;
  mediaType?: string | null;
  caption?: string | null;
  fileName?: string | null;
  createdAt: string;
  isGroup?: boolean;
  groupName?: string;
  remoteId?: string;
}

interface Conversation {
  number: string;
  member: Member | null;
  lastMessage: string;
  lastUpdate: string;
  lastAdmin?: string;
  isGroup?: boolean;
  groupName?: string;
  unreadCount?: number;
}

const QUICK_RESPONSES = [
  { id: 1, title: "Boas-vindas", text: "Olá! Seja bem-vindo ao atendimento do Dk Sind. Como podemos ajudar hoje?" },
  { id: 2, title: "Cobrança", text: "Olá {nome}, notamos uma pendência em sua mensalidade. Gostaria que enviássemos o código PIX para regularização?" },
  { id: 3, title: "Benefícios", text: "Como associado, você tem acesso a diversos convênios de saúde e lazer. Posso te enviar a lista completa?" },
  { id: 4, title: "Documentos", text: "Para prosseguir, preciso que você envie uma foto do seu RG e comprovante de residência por aqui mesmo." },
];

interface Member {
  id: string;
  name: string;
  whatsapp: string;
  registrationNum: string;
  photoUrl?: string;
}

export default function WhatsAppCRMPage() {
  const { data: session } = useSession();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [apiStatus, setApiStatus] = useState<{
    connected: boolean;
    message?: string;
    number?: string;
    profilePic?: string | null;
  } | null>(null);
  const [selectedConv, setSelectedConv] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [loadingQr, setLoadingQr] = useState(false);
  const [isAssociateModalOpen, setIsAssociateModalOpen] = useState(false);
  const [isStartChatModalOpen, setIsStartChatModalOpen] = useState(false);
  const [newChatData, setNewChatData] = useState({ number: "", name: "" });
  const [associateData, setAssociateData] = useState({ registrationNum: "", cpf: "" });
  const [associating, setAssociating] = useState(false);
  const [selectedFile, setSelectedFile] = useState<{ base64: string; type: string; name: string } | null>(null);
  const [lastMessageCount, setLastMessageCount] = useState<number>(0);
  const [showProfileSidebar, setShowProfileSidebar] = useState(true);

  const applyQuickResponse = (text: string) => {
    const personalized = text.replace("{nome}", selectedConv?.member?.name || "Associado");
    setInputText(personalized);
  };

  useEffect(() => {
    // Solicitar permissão para notificações
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
    
    fetchConversations(true); // Primeira carga
    // Refresh status every 10 seconds (mais agressivo)
    const interval = setInterval(() => fetchConversations(false), 10000);
    const healthCheckInterval = setInterval(async () => {
      try {
        await axios.get("/api/admin/whatsapp/health");
        console.log("[Health Check] Verificação de status da conexão realizada.");
      } catch (err) {
        console.error("[Health Check] Falha na verificação de saúde.");
      }
    }, 30000); // A cada 30 segundos

    return () => {
      clearInterval(interval);
      clearInterval(healthCheckInterval);
    };
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        let type = "document";
        if (file.type.startsWith("image/")) type = "image";
        else if (file.type.startsWith("video/")) type = "video";
        else if (file.type.startsWith("audio/")) type = "audio";
        
        setSelectedFile({
          base64: reader.result as string,
          type,
          name: file.name
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleConnect = async () => {
    setLoadingQr(true);
    setQrCode(null);
    try {
      console.log("Iniciando conexão WhatsApp...");
      const response = await axios.get("/api/admin/whatsapp/connect", {
        headers: { 'Cache-Control': 'no-cache' }
      });
      
      if (response.data?.base64) {
        setQrCode(response.data.base64);
        console.log("QR Code recebido com sucesso");
      } else if (response.data?.code) {
        setQrCode(response.data.code);
        console.log("Código recebido com sucesso");
      } else if (response.data?.connected) {
        setApiStatus({ connected: true, message: "WhatsApp Conectado!" });
        setQrCode(null);
        console.log("WhatsApp já estava conectado");
        checkStatus();
      } else {
        throw new Error("Resposta do servidor não contém imagem ou código.");
      }
    } catch (err: any) {
      console.error("Erro detalhado ao conectar:", err);
      const errorMsg = err.response?.data?.message || err.message;
      alert("ERRO AO GERAR QR CODE: " + errorMsg + "\n\nTente novamente em 5 segundos.");
    } finally {
      setLoadingQr(false);
    }
  };

  const handleDisconnect = async () => {
    if (!confirm("Deseja realmente desconectar o WhatsApp?")) return;
    try {
      await axios.delete("/api/admin/whatsapp/connect");
      setApiStatus({ connected: false });
      setQrCode(null);
      alert("WhatsApp desconectado com sucesso!");
    } catch (err: any) {
      alert("Erro ao desconectar");
    }
  };

  const checkStatus = async () => {
    try {
      const response = await axios.get("/api/admin/whatsapp/health");
      setApiStatus(response.data);
    } catch (err) {
      setApiStatus({ connected: false });
    }
  };

  useEffect(() => {
    if (selectedConv) {
      fetchMessages(selectedConv.number);
    }
  }, [selectedConv]);

  const fetchConversations = async (initial = false) => {
    try {
      const response = await axios.get("/api/admin/whatsapp", {
        headers: { 'Cache-Control': 'no-cache' }
      });
      
      const newConversations = response.data.conversations || [];
      setConversations(newConversations);
      setApiStatus(response.data.status);
      setLoading(false);

      // Lógica de Notificação
      const currentTotalMessages = newConversations.reduce((acc: number, conv: any) => acc + (conv.lastMessage ? 1 : 0), 0);
      
      if (!initial && currentTotalMessages > lastMessageCount) {
        const latestConv = newConversations[0];
        if (latestConv && latestConv.lastMessage && !latestConv.lastAdmin) {
          if ("Notification" in window && Notification.permission === "granted") {
            new Notification("Nova Mensagem - Sindicato Elite", {
              body: `${latestConv.member?.name || latestConv.number}: ${latestConv.lastMessage}`,
              icon: "/logo.png"
            });
          }
        }
      }
      setLastMessageCount(currentTotalMessages);
      
      if (response.data.status?.connected) {
        setQrCode(null);
      }
    } catch (err) {
      console.error("Erro ao carregar conversas:", err);
      setLoading(false);
    }
  };

  const handleStartChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChatData.number) return;
    
    // Check if conversation already exists
    const exists = conversations.find(c => c.number === newChatData.number);
    if (exists) {
      setSelectedConv(exists);
    } else {
      const newConv: Conversation = {
        number: newChatData.number,
        member: null,
        lastMessage: "",
        lastUpdate: new Date().toISOString()
      };
      setConversations([newConv, ...conversations]);
      setSelectedConv(newConv);
    }
    
    setIsStartChatModalOpen(false);
    setNewChatData({ number: "", name: "" });
  };

  const fetchMessages = async (number: string) => {
    try {
      // Create a specific endpoint for messages of a number or filter in client
      // For now let's assume the GET /api/admin/whatsapp also returns messages for a number if passed as param
      const response = await axios.get(`/api/admin/whatsapp/messages?number=${number}`);
      setMessages(response.data);
    } catch (err) {
      console.error("Erro ao carregar mensagens:", err);
      // Fallback mock if endpoint doesn't exist yet
      setMessages([]);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!inputText.trim() && !selectedFile) || !selectedConv) return;

    const tempId = Math.random().toString(36).substr(2, 9);
    const newMessage: Message = {
      id: tempId,
      memberId: selectedConv.member?.id || null,
      adminId: session?.user?.id || null,
      admin: { name: session?.user?.name || "Administrador" },
      text: inputText || (selectedFile ? `[Arquivo: ${selectedFile.name}]` : ""),
      type: "SENT",
      status: "PENDING",
      createdAt: new Date().toISOString(),
      mediaType: selectedFile?.type || null,
      fileName: selectedFile?.name || null,
    };

    setMessages([...messages, newMessage]);
    const currentInput = inputText;
    const currentFile = selectedFile;
    
    setInputText("");
    setSelectedFile(null);

    try {
      await axios.post("/api/admin/whatsapp", {
        number: selectedConv.number,
        text: currentInput,
        mediaUrl: currentFile?.base64,
        mediaType: currentFile?.type,
        fileName: currentFile?.name,
        memberId: selectedConv.member?.id
      });
      fetchMessages(selectedConv.number);
    } catch (err) {
      console.error("Erro ao enviar mensagem:", err);
    }
  };

  const handleAssociate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedConv) return;
    setAssociating(true);
    try {
      await axios.patch("/api/admin/whatsapp", {
        number: selectedConv.number,
        ...associateData
      });
      setIsAssociateModalOpen(false);
      setAssociateData({ registrationNum: "", cpf: "" });
      fetchConversations();
      alert("Número associado com sucesso!");
    } catch (err: any) {
      alert(err.response?.data?.error || "Erro ao associar número");
    } finally {
      setAssociating(false);
    }
  };

  const filteredConversations = conversations.filter(c => 
    (c.member?.name || "").toLowerCase().includes(searchTerm.toLowerCase()) || 
    (c.groupName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.number.includes(searchTerm) ||
    (c.member?.registrationNum || "").includes(searchTerm)
  );

  const [activeFilter, setActiveFilter] = useState<"ALL" | "MEMBERS" | "GROUPS" | "UNREAD">("ALL");

  const displayedConversations = filteredConversations.filter(c => {
    if (activeFilter === "MEMBERS") return c.member !== null && !c.isGroup;
    if (activeFilter === "GROUPS") return c.isGroup;
    // For UNREAD we would need a lastMessageStatus or similar, defaulting for now
    return true;
  });

  return (
    <div className="flex h-[calc(100vh-120px)] gap-8 animate-in fade-in duration-700">
      {/* Sidebar - Member List */}
      <aside className="w-96 flex flex-col bg-slate-900/40 backdrop-blur-3xl rounded-[3rem] border border-white/10 shadow-2xl overflow-hidden">
        <div className="p-8 border-b border-white/5 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-black text-white uppercase tracking-tighter">Conversas</h2>
            <div className="flex gap-2">
              {apiStatus?.connected && (
                <button 
                  onClick={handleDisconnect}
                  className="p-2 bg-rose-500/10 text-rose-500 border border-rose-500/20 rounded-xl hover:bg-rose-500/20 transition-all"
                  title="Desconectar"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              )}
              <button 
                onClick={handleConnect}
                disabled={loadingQr}
                className={`px-4 py-2 rounded-xl flex items-center gap-2 border transition-all ${
                  apiStatus?.connected 
                    ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" 
                    : "bg-rose-500/10 text-rose-500 border-rose-500/20 hover:bg-rose-500/20"
                }`}
              >
                <div className={`w-2 h-2 rounded-full ${apiStatus?.connected ? "bg-emerald-500 animate-pulse" : "bg-rose-500"}`} />
                <span className="text-[9px] font-black uppercase tracking-widest">
                  {loadingQr ? "GERANDO..." : (apiStatus?.connected ? "CONECTADO" : "CONECTAR")}
                </span>
              </button>
            </div>
          </div>

          {apiStatus?.connected && apiStatus.number && (
            <div className="p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl border border-emerald-500/20 overflow-hidden bg-black/40">
                {apiStatus.profilePic ? (
                  <img src={apiStatus.profilePic} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Smartphone className="w-4 h-4 text-emerald-500/40" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">Conectado em:</p>
                <p className="text-xs font-bold text-white truncate">{apiStatus.number}</p>
              </div>
            </div>
          )}

          {/* QR Code Display if needed */}
          <AnimatePresence>
            {qrCode && !apiStatus?.connected && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="p-6 bg-white rounded-3xl flex flex-col items-center gap-4 border-4 border-emerald-500/20">
                  <p className="text-[10px] font-black text-black uppercase tracking-widest text-center">Escaneie com o WhatsApp</p>
                  <img src={qrCode} alt="WhatsApp QR Code" className="w-48 h-48" />
                  <button 
                    onClick={() => setQrCode(null)}
                    className="text-[9px] font-black text-rose-600 uppercase tracking-widest hover:underline"
                  >
                    Fechar QR Code
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <button 
            onClick={() => setIsStartChatModalOpen(true)}
            className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-2xl shadow-xl shadow-emerald-900/20 transition-all uppercase tracking-widest text-[9px] flex items-center justify-center gap-2"
          >
            <Send className="w-4 h-4" /> Iniciar Nova Conversa
          </button>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input 
              type="text"
              placeholder="BUSCAR CONVERSA..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-6 py-4 bg-black/20 border border-white/10 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500 transition-all text-[10px] font-black uppercase tracking-widest text-white"
            />
          </div>

          {/* Filtros Profissionais */}
          <div className="flex gap-2">
            {[
              { id: "ALL", label: "TODAS" },
              { id: "MEMBERS", label: "SÓCIOS" },
              { id: "GROUPS", label: "GRUPOS" }
            ].map(f => (
              <button
                key={f.id}
                onClick={() => setActiveFilter(f.id as any)}
                className={`flex-1 py-2 rounded-xl text-[8px] font-black tracking-widest transition-all border ${
                  activeFilter === f.id 
                    ? "bg-white/10 text-white border-white/20" 
                    : "text-gray-600 border-transparent hover:text-gray-400"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-2">
          {displayedConversations.map((conv) => (
            <button
              key={conv.number}
              onClick={() => setSelectedConv(conv)}
              className={`w-full flex items-center gap-4 p-5 rounded-3xl transition-all group ${
                selectedConv?.number === conv.number 
                  ? "bg-emerald-600 text-white shadow-xl shadow-emerald-900/20" 
                  : "hover:bg-white/5 text-gray-400 hover:text-white"
              }`}
            >
              <div className="w-12 h-12 rounded-2xl border-2 border-white/10 overflow-hidden bg-black/40 shrink-0 flex items-center justify-center relative">
                {conv.isGroup ? (
                  <Users className="w-6 h-6 text-blue-400 opacity-50" />
                ) : conv.member?.photoUrl ? (
                  <img src={conv.member.photoUrl} className="w-full h-full object-cover" />
                ) : (
                  <User className="w-6 h-6 opacity-20" />
                )}
                {conv.isGroup && (
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-blue-600 rounded-full flex items-center justify-center border-2 border-[#0f172a]">
                    <Globe className="w-2 h-2 text-white" />
                  </div>
                )}
              </div>
              <div className="flex-1 text-left min-w-0">
                <p className="text-xs font-black uppercase tracking-tight truncate">
                  {conv.isGroup ? (conv.groupName || "Grupo WhatsApp") : (conv.member?.name || `Número: ${conv.number}`)}
                </p>
                <p className={`text-[9px] font-bold mt-0.5 ${selectedConv?.number === conv.number ? "text-white/60" : "text-gray-600"}`}>
                  {conv.isGroup ? "GRUPO DE COMUNICAÇÃO" : (conv.member ? conv.member.registrationNum : "NÃO ASSOCIADO")}
                </p>
              </div>
              {conv.unreadCount && conv.unreadCount > 0 && (
                <div className="w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center border-2 border-[#0f172a] shadow-lg shadow-emerald-900/40">
                  <span className="text-[8px] font-black text-white">{conv.unreadCount}</span>
                </div>
              )}
              {selectedConv?.number === conv.number && <Zap className="w-3 h-3 animate-pulse text-emerald-300" />}
            </button>
          ))}
        </div>
      </aside>

      {/* Main Chat Area */}
      <main className="flex-1 flex bg-slate-900/40 backdrop-blur-3xl rounded-[3rem] border border-white/10 shadow-2xl overflow-hidden relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(16,185,129,0.03),transparent_50%)] pointer-events-none" />
        
        {selectedConv ? (
          <>
            <div className="flex-1 flex flex-col min-w-0 border-r border-white/5">
              {/* Chat Header */}
              <header className="p-8 border-b border-white/5 flex items-center justify-between relative z-10">
                <div className="flex items-center gap-5">
                  <div className="w-14 h-14 rounded-2xl border-2 border-emerald-500/20 overflow-hidden bg-black/40 flex items-center justify-center">
                    {selectedConv.isGroup ? (
                      <Users className="w-8 h-8 text-blue-400 opacity-50" />
                    ) : selectedConv.member?.photoUrl ? (
                      <img src={selectedConv.member.photoUrl} className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-8 h-8 opacity-20" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-white uppercase tracking-tighter">
                      {selectedConv.isGroup ? (selectedConv.groupName || "Grupo WhatsApp") : (selectedConv.member?.name || `Desconhecido (${selectedConv.number})`)}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">
                        {selectedConv.isGroup ? "Canal de Comunicação Ativo" : "Online • Dk Sind Elite CRM"}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {!selectedConv.isGroup && (
                    <button 
                      onClick={() => setShowProfileSidebar(!showProfileSidebar)}
                      className={`p-4 rounded-2xl border transition-all ${showProfileSidebar ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-white/5 text-gray-400 border-white/10 hover:text-white"}`}
                    >
                      <User className="w-5 h-5" />
                    </button>
                  )}
                  <button className="p-4 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/10 text-gray-400 hover:text-white transition-all">
                    <Phone className="w-5 h-5" />
                  </button>
                </div>
              </header>

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-10 space-y-8 custom-scrollbar relative z-10">
                {messages.map((msg) => (
                  <div 
                    key={msg.id}
                    className={`flex ${msg.type === "SENT" ? "justify-end" : "justify-start"}`}
                  >
                    <div className={`max-w-[70%] space-y-2 ${msg.type === "SENT" ? "items-end" : "items-start"}`}>
                      <div className={`p-6 rounded-[2rem] text-sm font-medium shadow-2xl ${
                        msg.type === "SENT" 
                          ? "bg-emerald-600 text-white rounded-tr-none" 
                          : "bg-white/5 text-gray-200 border border-white/10 rounded-tl-none"
                      }`}>
                        {msg.mediaType === "IMAGE" && msg.mediaUrl && (
                          <div className="mb-4 rounded-xl overflow-hidden border border-white/10">
                            <img src={msg.mediaUrl} alt="WhatsApp Image" className="max-w-full h-auto" />
                          </div>
                        )}
                        {msg.mediaType === "VIDEO" && msg.mediaUrl && (
                          <div className="mb-4 rounded-xl overflow-hidden border border-white/10">
                            <video src={msg.mediaUrl} controls className="max-w-full h-auto" />
                          </div>
                        )}
                        {msg.mediaType === "AUDIO" && msg.mediaUrl && (
                          <div className="mb-4">
                            <audio src={msg.mediaUrl} controls className="max-w-full h-auto" />
                          </div>
                        )}
                        {msg.mediaType === "DOCUMENT" && (
                          <div className="mb-4 p-4 bg-black/20 rounded-xl flex items-center gap-3 border border-white/10">
                            <FileText className="w-8 h-8 text-blue-400" />
                            <div className="flex-1 min-w-0">
                              <p className="text-[10px] font-black uppercase truncate">{msg.fileName || "documento"}</p>
                            </div>
                            {msg.mediaUrl && (
                              <a href={msg.mediaUrl} download={msg.fileName} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                                <Download className="w-4 h-4" />
                              </a>
                            )}
                          </div>
                        )}
                        {msg.text}
                      </div>
                      <div className="flex items-center gap-3 px-2">
                        <span className="text-[9px] font-black text-gray-600 uppercase tracking-[0.2em] flex items-center gap-2">
                          {format(new Date(msg.createdAt), "HH:mm")}
                          {msg.type === "SENT" && msg.admin?.name && (
                            <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-500 rounded-full border border-emerald-500/20">
                              {msg.admin.name}
                            </span>
                          )}
                        </span>
                        {msg.type === "SENT" && (
                          <CheckCheck className={`w-3 h-3 ${msg.status === "READ" ? "text-blue-400" : msg.status === "DELIVERED" ? "text-emerald-500" : "text-gray-700"}`} />
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Input Area */}
              <footer className="p-8 border-t border-white/5 bg-black/20 relative z-10 space-y-6">
                {/* Respostas Rápidas */}
                <div className="flex gap-3 overflow-x-auto pb-2 custom-scrollbar no-scrollbar">
                  {QUICK_RESPONSES.map(resp => (
                    <button
                      key={resp.id}
                      onClick={() => applyQuickResponse(resp.text)}
                      className="whitespace-nowrap px-4 py-2 bg-white/5 hover:bg-emerald-500/10 border border-white/10 hover:border-emerald-500/20 rounded-xl text-[9px] font-black text-gray-400 hover:text-emerald-500 transition-all uppercase tracking-widest"
                    >
                      {resp.title}
                    </button>
                  ))}
                </div>

                <form onSubmit={handleSendMessage} className="space-y-4">
                  {selectedFile && (
                    <div className="flex items-center gap-4 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl animate-in slide-in-from-bottom-2 duration-300">
                      <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center text-emerald-500">
                        {selectedFile.type === "image" ? <ImageIcon className="w-6 h-6" /> : 
                         selectedFile.type === "video" ? <Video className="w-6 h-6" /> :
                         selectedFile.type === "audio" ? <Mic className="w-6 h-6" /> : <FileText className="w-6 h-6" />}
                      </div>
                      <div className="flex-1">
                        <p className="text-[10px] font-black text-white uppercase tracking-tight truncate">{selectedFile.name}</p>
                        <p className="text-[8px] font-bold text-emerald-500 uppercase tracking-widest">{selectedFile.type}</p>
                      </div>
                      <button 
                        type="button"
                        onClick={() => setSelectedFile(null)}
                        className="p-2 hover:bg-rose-500/20 text-rose-500 rounded-lg transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                  <div className="flex gap-4">
                    <div className="relative">
                      <input 
                        type="file" 
                        onChange={handleFileSelect}
                        className="absolute inset-0 opacity-0 cursor-pointer w-16 h-16"
                      />
                      <button 
                        type="button"
                        className="w-16 h-16 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white rounded-[2rem] border border-white/10 flex items-center justify-center transition-all"
                      >
                        <Paperclip className="w-6 h-6" />
                      </button>
                    </div>
                    <input 
                      type="text"
                      placeholder="DIGITE SUA MENSAGEM ESTRATÉGICA..."
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      className="flex-1 px-8 py-5 bg-white/5 border border-white/10 rounded-[2rem] outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all text-white font-bold text-xs"
                    />
                    <button 
                      type="submit"
                      className="w-16 h-16 bg-emerald-600 hover:bg-emerald-500 text-white rounded-[2rem] flex items-center justify-center shadow-xl shadow-emerald-900/20 transition-all active:scale-90"
                    >
                      <Send className="w-6 h-6" />
                    </button>
                  </div>
                </form>
              </footer>
            </div>

            {/* Profile Sidebar */}
            <AnimatePresence>
              {showProfileSidebar && !selectedConv.isGroup && (
                <motion.aside
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: 400, opacity: 1 }}
                  exit={{ width: 0, opacity: 0 }}
                  className="bg-black/20 backdrop-blur-3xl overflow-hidden flex flex-col relative z-10"
                >
                  <div className="p-10 flex-1 overflow-y-auto custom-scrollbar space-y-12">
                    {/* Header Perfil */}
                    <div className="flex flex-col items-center text-center space-y-6">
                      <div className="w-32 h-32 rounded-[3rem] border-4 border-emerald-500/20 overflow-hidden bg-black/40 shadow-2xl">
                        {selectedConv.member?.photoUrl ? (
                          <img src={selectedConv.member.photoUrl} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <User className="w-16 h-16 opacity-20" />
                          </div>
                        )}
                      </div>
                      <div>
                        <h3 className="text-2xl font-black text-white uppercase tracking-tighter">
                          {selectedConv.member?.name || "Associado Não Identificado"}
                        </h3>
                        <p className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.3em] mt-2">
                          {selectedConv.member ? "Membro Ativo • Elite" : "Aguardando Vínculo"}
                        </p>
                      </div>
                    </div>

                    {/* Ações Rápidas Perfil */}
                    {!selectedConv.member && (
                      <div className="p-8 bg-blue-600/10 border border-blue-500/20 rounded-[2.5rem] space-y-6">
                        <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest text-center leading-relaxed">
                          Este número não está vinculado a nenhum associado.
                        </p>
                        <button 
                          onClick={() => setIsAssociateModalOpen(true)}
                          className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-2xl transition-all uppercase tracking-widest text-[9px]"
                        >
                          Vincular Agora
                        </button>
                      </div>
                    )}

                    {selectedConv.member && (
                      <>
                        {/* Dados Básicos */}
                        <div className="space-y-4">
                          <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] px-2">Informações Estratégicas</h4>
                          <div className="grid grid-cols-1 gap-3">
                            {[
                              { label: "Matrícula", value: selectedConv.member.registrationNum, icon: ShieldCheck },
                              { label: "WhatsApp", value: selectedConv.number, icon: Phone },
                              { label: "Unidade", value: "Sede Central", icon: Globe },
                            ].map((info, i) => (
                              <div key={i} className="flex items-center gap-4 p-5 bg-white/5 border border-white/10 rounded-3xl">
                                <info.icon className="w-4 h-4 text-emerald-500" />
                                <div>
                                  <p className="text-[8px] font-black text-gray-600 uppercase tracking-widest">{info.label}</p>
                                  <p className="text-xs font-black text-white uppercase">{info.value}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Status Financeiro */}
                        <div className="space-y-4">
                          <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] px-2">Saúde Financeira</h4>
                          <div className="p-6 bg-emerald-500/5 border border-emerald-500/10 rounded-[2rem] flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center text-emerald-500">
                                <Zap className="w-5 h-5" />
                              </div>
                              <div>
                                <p className="text-[10px] font-black text-white uppercase">Adimplente</p>
                                <p className="text-[8px] font-bold text-emerald-500 uppercase">Ciclo 2026 Ativo</p>
                              </div>
                            </div>
                            <CheckCheck className="w-5 h-5 text-emerald-500" />
                          </div>
                        </div>

                        <button className="w-full py-5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-[2rem] text-[10px] font-black text-white uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3">
                          <ExternalLink className="w-4 h-4" /> Ver Ficha Completa
                        </button>
                      </>
                    )}
                  </div>
                </motion.aside>
              )}
            </AnimatePresence>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-20 text-center space-y-8">
            <div className="w-32 h-32 bg-emerald-500/5 rounded-[3rem] border border-emerald-500/10 flex items-center justify-center relative group">
              <div className="absolute inset-0 bg-emerald-500/10 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
              <MessageSquare className="w-12 h-12 text-emerald-500/20" />
            </div>
            <div className="space-y-3">
              <h3 className="text-3xl font-black text-white uppercase tracking-tighter">Terminal CRM Elite</h3>
              <p className="text-gray-500 text-xs font-bold uppercase tracking-[0.3em] max-w-sm mx-auto leading-relaxed">
                Selecione um associado no menu lateral para iniciar uma comunicação direta via WhatsApp Business.
              </p>
            </div>
            <div className="flex gap-4 pt-4">
              <div className="px-6 py-3 bg-white/5 border border-white/10 rounded-2xl flex items-center gap-3">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Conexão Segura</span>
              </div>
              <div className="px-6 py-3 bg-white/5 border border-white/10 rounded-2xl flex items-center gap-3">
                <Zap className="w-4 h-4 text-blue-500" />
                <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Dk Sind API v4.0</span>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Start Chat Modal */}
      <AnimatePresence>
        {isStartChatModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsStartChatModalOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-lg bg-slate-900 border border-white/10 rounded-[3rem] p-12 shadow-2xl overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2" />
              
              <div className="relative z-10 space-y-8">
                <div className="flex justify-between items-center">
                  <h3 className="text-2xl font-black text-white uppercase tracking-tighter">Nova Conversa</h3>
                  <button onClick={() => setIsStartChatModalOpen(false)} className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl transition-all">
                    <X className="w-5 h-5 text-gray-500" />
                  </button>
                </div>

                <form onSubmit={handleStartChat} className="space-y-6">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Número do WhatsApp (Com DDD)</label>
                    <input 
                      type="text"
                      placeholder="Ex: 5586999999999"
                      value={newChatData.number}
                      onChange={(e) => setNewChatData({ ...newChatData, number: e.target.value.replace(/\D/g, "") })}
                      className="w-full px-8 py-5 bg-black/40 border border-white/10 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500 transition-all text-white font-bold"
                      required
                    />
                  </div>
                  
                  <button 
                    type="submit"
                    className="w-full py-5 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-2xl shadow-xl shadow-emerald-900/20 transition-all uppercase tracking-widest text-[10px]"
                  >
                    Abrir Chat Estratégico
                  </button>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Associate Modal */}
      <AnimatePresence>
        {isAssociateModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAssociateModalOpen(false)}
              className="absolute inset-0 bg-[#020617]/90 backdrop-blur-xl"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-lg bg-slate-900/60 border border-white/10 rounded-[3rem] p-10 shadow-2xl backdrop-blur-3xl overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-blue-600" />
              <button 
                onClick={() => setIsAssociateModalOpen(false)}
                className="absolute top-8 right-8 text-gray-500 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>

              <div className="flex items-center gap-4 mb-10">
                <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-500 border border-blue-500/10">
                  <User className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-white uppercase tracking-tighter">Associar Número</h3>
                  <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">Vincular {selectedConv?.number} a um associado</p>
                </div>
              </div>

              <form onSubmit={handleAssociate} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Matrícula</label>
                  <input 
                    type="text"
                    placeholder="Ex: 6039001"
                    value={associateData.registrationNum}
                    onChange={(e) => setAssociateData({ ...associateData, registrationNum: e.target.value })}
                    className="w-full px-6 py-4 bg-black/40 border border-white/10 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 text-sm font-bold text-white"
                  />
                </div>
                <div className="relative py-4">
                  <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/5"></div></div>
                  <div className="relative flex justify-center"><span className="bg-slate-900 px-4 text-[8px] font-black text-gray-700 uppercase tracking-[0.5em]">OU</span></div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">CPF</label>
                  <input 
                    type="text"
                    placeholder="000.000.000-00"
                    value={associateData.cpf}
                    onChange={(e) => setAssociateData({ ...associateData, cpf: e.target.value })}
                    className="w-full px-6 py-4 bg-black/40 border border-white/10 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 text-sm font-bold text-white"
                  />
                </div>
                <button 
                  type="submit"
                  disabled={associating}
                  className="w-full py-5 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-2xl shadow-xl shadow-blue-900/20 transition-all uppercase tracking-widest text-xs mt-4 flex items-center justify-center gap-3"
                >
                  {associating ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : "Confirmar Vínculo"}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
