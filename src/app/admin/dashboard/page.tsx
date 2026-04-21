"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { 
  Users, 
  Wallet, 
  ShieldCheck, 
  TrendingUp, 
  Clock, 
  ArrowUpRight,
  Milk as Tooth,
  Zap,
  Star,
  Target,
  Sparkles,
  ChevronRight,
  Bell,
  Search
} from "lucide-react";
import AdminSidebar from "@/components/AdminSidebar";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState<any>(null);
  const [recentBillings, setRecentBillings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated") {
      fetchStats();
    }
  }, [status]);

  const fetchStats = async () => {
    try {
      const [statsRes, billingsRes] = await Promise.all([
        axios.get("/api/admin/dashboard/stats"),
        axios.get("/api/admin/billing"),
      ]);
      setStats(statsRes.data);
      setRecentBillings(billingsRes.data.slice(0, 5));
      setLoading(false);
    } catch (err) {
      console.error("Erro ao carregar dashboard", err);
      setLoading(false);
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
    <div className="min-h-screen bg-[#020617] flex text-white font-sans selection:bg-emerald-500/30">
      <AdminSidebar />
      
      <main className="flex-1 p-8 lg:p-12 overflow-y-auto relative">
        {/* Dynamic Background */}
        <div className="fixed inset-0 z-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-600/5 rounded-full blur-[120px]" />
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-600/5 rounded-full blur-[120px]" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto space-y-12">
          {/* Header */}
          <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <span className="px-4 py-1.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[9px] font-black uppercase tracking-[0.4em] rounded-full shadow-lg">
                  Terminal Elite
                </span>
                <span className="text-gray-600 font-black">/</span>
                <span className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">Dashboard de Comando</span>
              </div>
              <h1 className="text-5xl font-black text-white uppercase tracking-tighter">Visão <span className="text-gray-600">Sistêmica</span></h1>
            </div>

            <div className="flex items-center gap-6">
              <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-emerald-400 transition-colors" />
                <input 
                  type="text" 
                  placeholder="Buscar associado ou protocolo..."
                  className="pl-12 pr-6 py-4 bg-white/5 border border-white/10 rounded-2xl w-80 text-sm font-medium focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                />
              </div>
              <button className="relative p-4 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all group">
                <Bell className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" />
                <span className="absolute top-4 right-4 w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              </button>
            </div>
          </header>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { label: "Associados", value: stats?.totalMembers || 0, icon: Users, color: "emerald", trend: "+12.5%", suffix: "Rede Dk Sind Elite" },
              { label: "Receita Fluxo", value: formatCurrency(stats?.monthlyRevenue || 0), icon: Zap, color: "blue", trend: "+8.2%", suffix: "Ciclo Mensal" },
              { label: "Taxa Saúde", value: stats?.activeMembers || 0, icon: Tooth, color: "emerald", trend: "98.2%", suffix: "Status Ativo" },
              { label: "Alertas", value: stats?.overdueMembers || 0, icon: ShieldCheck, color: "rose", trend: "-2.1%", suffix: "Pendências" },
            ].map((stat, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="p-8 bg-white/5 backdrop-blur-3xl rounded-[2.5rem] border border-white/10 hover:border-emerald-500/30 transition-all group relative overflow-hidden"
              >
                <div className={`absolute top-0 right-0 w-32 h-32 bg-${stat.color}-500/5 rounded-full blur-[40px] translate-x-1/2 -translate-y-1/2`} />
                <div className="flex justify-between items-start mb-8 relative z-10">
                  <div className={`w-14 h-14 bg-${stat.color}-500/10 rounded-2xl flex items-center justify-center text-${stat.color}-500 border border-${stat.color}-500/20 group-hover:scale-110 transition-transform`}>
                    <stat.icon className="w-7 h-7" />
                  </div>
                  <span className={`text-[10px] font-black text-${stat.color}-400 bg-${stat.color}-500/10 px-3 py-1 rounded-full border border-${stat.color}-500/20`}>
                    {stat.trend}
                  </span>
                </div>
                <div className="space-y-1 relative z-10">
                  <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em]">{stat.label}</p>
                  <h3 className="text-3xl font-black text-white tracking-tighter">{stat.value}</h3>
                  <p className="text-[9px] font-bold text-gray-600 uppercase tracking-widest pt-2">{stat.suffix}</p>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Recent Activity Table */}
            <div className="lg:col-span-2 space-y-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-500 border border-blue-500/20">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                  <h2 className="text-2xl font-black text-white uppercase tracking-tighter">Movimentação Recente</h2>
                </div>
                <button className="text-[10px] font-black text-emerald-500 uppercase tracking-widest hover:text-white transition-colors">
                  Ver Todo Histórico
                </button>
              </div>

              <div className="bg-white/5 backdrop-blur-3xl rounded-[3rem] border border-white/10 overflow-hidden shadow-2xl">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-white/5 border-b border-white/5">
                      <th className="px-8 py-6 text-[10px] font-black text-gray-500 uppercase tracking-[0.3em]">Associado</th>
                      <th className="px-8 py-6 text-[10px] font-black text-gray-500 uppercase tracking-[0.3em]">Data</th>
                      <th className="px-8 py-6 text-[10px] font-black text-gray-500 uppercase tracking-[0.3em]">Valor</th>
                      <th className="px-8 py-6 text-[10px] font-black text-gray-500 uppercase tracking-[0.3em]">Status</th>
                      <th className="px-8 py-6 text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] text-right">Ação</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {recentBillings.map((bill) => (
                      <tr key={bill.id} className="hover:bg-white/[0.02] transition-colors group/row">
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-4">
                            {bill.member.photoUrl ? (
                              <img 
                                src={bill.member.photoUrl} 
                                alt={bill.member.name} 
                                className="w-10 h-10 rounded-xl object-cover border border-white/10"
                              />
                            ) : (
                              <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-500 font-black text-xs">
                                {bill.member.name.charAt(0)}
                              </div>
                            )}
                            <div>
                              <p className="text-sm font-black text-white uppercase tracking-tight group-hover/row:text-emerald-400 transition-colors">{bill.member.name}</p>
                              <p className="text-[9px] font-bold text-gray-600 uppercase tracking-widest">Mat: {bill.member.registrationNum}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-2">
                            <Clock className="w-3.5 h-3.5 text-gray-700" />
                            <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">
                              {format(new Date(bill.createdAt), "dd MMM, yy", { locale: ptBR })}
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
                              : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                          }`}>
                            {bill.status === "PAID" ? "Liquidado" : "Pendente"}
                          </span>
                        </td>
                        <td className="px-8 py-6 text-right">
                          <button className="p-3 bg-white/5 hover:bg-white/10 rounded-xl border border-white/5 transition-all">
                            <ArrowUpRight className="w-4 h-4 text-gray-500" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Sidebar Column */}
            <div className="space-y-12">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-500 border border-emerald-500/20">
                  <Target className="w-5 h-5" />
                </div>
                <h2 className="text-2xl font-black text-white uppercase tracking-tighter">Metas do Ciclo</h2>
              </div>

                <div className="p-8 bg-white/5 rounded-[2.5rem] border border-white/10 space-y-6 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-[30px] -translate-y-1/2 translate-x-1/2" />
                  <div className="flex justify-between items-end relative z-10">
                    <div>
                      <p className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.4em]">Arrecadação Mensal</p>
                      <p className="text-[8px] font-bold text-gray-500 uppercase tracking-widest mt-1">Meta: {formatCurrency(stats?.monthlyGoal || 0)}</p>
                    </div>
                    <p className="text-xl font-black text-white">
                      {stats?.monthlyGoal > 0 
                        ? `${Math.min(Math.round((stats?.monthlyRevenue / stats?.monthlyGoal) * 100), 100)}%`
                        : "0%"}
                    </p>
                  </div>
                  <div className="w-full h-3 bg-black/40 rounded-full overflow-hidden p-0.5 border border-white/5 relative z-10">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min((stats?.monthlyRevenue / stats?.monthlyGoal) * 100 || 0, 100)}%` }}
                      transition={{ duration: 1.5, ease: "easeOut" }}
                      className="h-full bg-gradient-to-r from-emerald-600 to-blue-500 rounded-full shadow-[0_0_15px_rgba(16,185,129,0.4)]"
                    />
                  </div>
                  <div className="flex justify-between items-center relative z-10">
                    <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest">
                      Faltam {formatCurrency(Math.max((stats?.monthlyGoal || 0) - (stats?.monthlyRevenue || 0), 0))}
                    </p>
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-[9px] font-black text-emerald-500 uppercase">Em Tempo Real</span>
                    </div>
                  </div>
                </div>

              <div className="p-10 bg-white/5 backdrop-blur-3xl rounded-[3rem] border border-white/10 space-y-8">
                <h3 className="text-xl font-black text-white uppercase tracking-tighter">Ações Rápidas</h3>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: "Novo Associado", icon: Users, color: "emerald" },
                    { label: "Lançar Cobrança", icon: Zap, color: "blue" },
                    { label: "Configurações", icon: Sparkles, color: "indigo" },
                    { label: "Segurança", icon: ShieldCheck, color: "rose" },
                  ].map((action, idx) => (
                    <button key={idx} className="p-6 bg-white/5 hover:bg-white/10 rounded-3xl border border-white/10 transition-all flex flex-col items-center gap-4 group">
                      <div className={`w-10 h-10 bg-${action.color}-500/10 rounded-xl flex items-center justify-center text-${action.color}-500 group-hover:scale-110 transition-transform`}>
                        <action.icon className="w-5 h-5" />
                      </div>
                      <span className="text-[9px] font-black text-white uppercase tracking-widest text-center">{action.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
