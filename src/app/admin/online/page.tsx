"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { 
  Users, 
  Activity, 
  Clock, 
  Search,
  Zap,
  ShieldCheck,
  User,
  MessageSquare,
  RefreshCw,
  Globe
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import Link from "next/link";

interface OnlineMember {
  id: string;
  name: string;
  registrationNum: string;
  photoUrl: string | null;
  whatsapp: string | null;
  status: string;
  lastActivity: string;
  lastAction: string;
  ipAddress: string | null;
}

export default function OnlineMembersPage() {
  const [onlineMembers, setOnlineMembers] = useState<OnlineMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  const fetchOnlineMembers = async () => {
    setRefreshing(true);
    try {
      const response = await axios.get("/api/admin/online");
      setOnlineMembers(response.data);
    } catch (err) {
      console.error("Erro ao buscar associados online:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchOnlineMembers();
    const interval = setInterval(fetchOnlineMembers, 30000); // Atualiza a cada 30 segundos
    return () => clearInterval(interval);
  }, []);

  const filteredMembers = onlineMembers.filter(m => 
    m.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    m.registrationNum.includes(searchTerm)
  );

  if (loading) {
    return (
      <div className="min-h-[600px] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 bg-emerald-500/10 rounded-lg flex items-center justify-center text-emerald-500 border border-emerald-500/20">
              <Activity className="w-5 h-5" />
            </div>
            <h1 className="text-4xl font-black text-white uppercase tracking-tighter">Associados Online</h1>
          </div>
          <p className="text-gray-500 text-xs font-bold uppercase tracking-widest ml-11">Monitoramento de atividade em tempo real</p>
        </div>

        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input 
              type="text"
              placeholder="BUSCAR ONLINE..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-6 py-4 bg-slate-900/40 border border-white/10 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500 transition-all text-[10px] font-black uppercase tracking-widest text-white backdrop-blur-xl"
            />
          </div>
          <button 
            onClick={fetchOnlineMembers}
            disabled={refreshing}
            className={`p-4 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded-2xl hover:bg-emerald-500/20 transition-all ${refreshing ? 'animate-spin' : ''}`}
          >
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-8 bg-slate-900/40 backdrop-blur-3xl rounded-[2.5rem] border border-white/10 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-[40px] translate-x-1/2 -translate-y-1/2" />
          <div className="relative z-10 flex items-center gap-6">
            <div className="w-16 h-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-500 border border-emerald-500/20">
              <Zap className="w-8 h-8" />
            </div>
            <div>
              <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em]">Total Conectados</p>
              <h3 className="text-4xl font-black text-white tracking-tighter">{onlineMembers.length}</h3>
            </div>
          </div>
        </div>
        
        <div className="p-8 bg-slate-900/40 backdrop-blur-3xl rounded-[2.5rem] border border-white/10 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-[40px] translate-x-1/2 -translate-y-1/2" />
          <div className="relative z-10 flex items-center gap-6">
            <div className="w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-500 border border-blue-500/20">
              <Users className="w-8 h-8" />
            </div>
            <div>
              <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em]">Tipo de Acesso</p>
              <h3 className="text-4xl font-black text-white tracking-tighter">Portal</h3>
            </div>
          </div>
        </div>

        <div className="p-8 bg-slate-900/40 backdrop-blur-3xl rounded-[2.5rem] border border-white/10 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/5 rounded-full blur-[40px] translate-x-1/2 -translate-y-1/2" />
          <div className="relative z-10 flex items-center gap-6">
            <div className="w-16 h-16 bg-rose-500/10 rounded-2xl flex items-center justify-center text-rose-500 border border-rose-500/20">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <div>
              <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em]">Segurança</p>
              <h3 className="text-4xl font-black text-white tracking-tighter">Ativa</h3>
            </div>
          </div>
        </div>
      </div>

      {/* Online Members Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence mode="popLayout">
          {filteredMembers.map((member) => (
            <motion.div
              layout
              key={member.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="p-6 bg-slate-900/40 backdrop-blur-3xl rounded-[2.5rem] border border-white/10 hover:border-emerald-500/30 transition-all group"
            >
              <div className="flex items-center gap-5 mb-6">
                <div className="relative">
                  <div className="w-16 h-16 rounded-2xl border-2 border-white/10 overflow-hidden bg-black/40">
                    {member.photoUrl ? (
                      <img src={member.photoUrl} className="w-full h-full object-cover" alt={member.name} />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <User className="w-8 h-8 opacity-20 text-white" />
                      </div>
                    )}
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full border-4 border-[#020617] animate-pulse" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-black text-white uppercase tracking-tight truncate group-hover:text-emerald-400 transition-colors">
                    {member.name}
                  </h4>
                  <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest mt-0.5">
                    Matrícula: {member.registrationNum}
                  </p>
                </div>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/5">
                  <Clock className="w-3.5 h-3.5 text-emerald-500" />
                  <div>
                    <p className="text-[8px] font-black text-gray-600 uppercase tracking-widest leading-none">Última Atividade</p>
                    <p className="text-[10px] font-bold text-white uppercase mt-1">
                      {formatDistanceToNow(new Date(member.lastActivity), { addSuffix: true, locale: ptBR })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/5">
                  <Zap className="w-3.5 h-3.5 text-blue-500" />
                  <div>
                    <p className="text-[8px] font-black text-gray-600 uppercase tracking-widest leading-none">Ação Realizada</p>
                    <p className="text-[10px] font-bold text-white uppercase mt-1 truncate">
                      {member.lastAction}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/5">
                  <Globe className="w-3.5 h-3.5 text-amber-500" />
                  <div>
                    <p className="text-[8px] font-black text-gray-600 uppercase tracking-widest leading-none">Endereço IP</p>
                    <p className="text-[10px] font-bold text-white uppercase mt-1">
                      {member.ipAddress || "Não identificado"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <Link 
                  href={`/admin/whatsapp?number=${member.whatsapp}`}
                  className="flex-1 py-3 bg-emerald-600/10 hover:bg-emerald-600 text-emerald-500 hover:text-white border border-emerald-500/20 rounded-xl transition-all flex items-center justify-center gap-2 group/btn"
                >
                  <MessageSquare className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
                  <span className="text-[9px] font-black uppercase tracking-widest">Enviar Mensagem</span>
                </Link>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {filteredMembers.length === 0 && (
          <div className="col-span-full flex flex-col items-center justify-center p-20 text-center space-y-6">
            <div className="w-24 h-24 bg-white/5 rounded-[2rem] border border-white/10 flex items-center justify-center">
              <Users className="w-10 h-10 text-gray-700" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-black text-white uppercase tracking-tighter">Nenhum Associado Online</h3>
              <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest max-w-xs leading-relaxed">
                Não há associados ativos na plataforma nos últimos 15 minutos.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
