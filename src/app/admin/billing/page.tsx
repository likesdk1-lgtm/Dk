"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { formatCurrency } from "@/lib/utils";
import { format } from "date-fns";
import { 
  Receipt, 
  Users, 
  Plus, 
  Search, 
  Calendar,
  AlertCircle,
  CheckCircle2,
  Clock,
  Filter,
  ArrowRight,
  Zap,
  ShieldCheck,
  ChevronRight,
  X,
  Trash2,
  User
} from "lucide-react";

export default function AdminBillingPage() {
  const [members, setMembers] = useState<any[]>([]);
  const [billings, setBillings] = useState<any[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [massModalOpen, setMassModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedMember, setSelectedMember] = useState("");
  const [amount, setAmount] = useState("");
  const [dueDate, setDueDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [search, setSearch] = useState("");
  const [massAmount, setMassAmount] = useState("");
  const [massDueDate, setMassDueDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [membersRes, billingsRes] = await Promise.all([
        axios.get("/api/admin/members"),
        axios.get("/api/admin/billing")
      ]);
      setMembers(membersRes.data);
      setBillings(billingsRes.data);
      setLoading(false);
    } catch (err) {
      console.error("Erro ao carregar dados", err);
    }
  };

  const handleCreateBilling = async (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true);
    try {
      await axios.post("/api/admin/billing", {
        memberId: selectedMember,
        amount: parseFloat(amount),
        dueDate: new Date(dueDate)
      });
      setModalOpen(false);
      fetchData();
    } catch (err) {
      alert("Erro ao criar cobrança");
    } finally {
      setProcessing(false);
    }
  };

  const handleMassBilling = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!confirm(`Deseja gerar cobrança de R$ ${massAmount} para TODOS os associados ativos?`)) return;
    setProcessing(true);
    try {
      await axios.post("/api/admin/billing/mass", {
        amount: parseFloat(massAmount),
        dueDate: new Date(massDueDate)
      });
      setMassModalOpen(false);
      fetchData();
      alert("Cobrança em massa gerada com sucesso!");
    } catch (err) {
      alert("Erro ao gerar cobrança em massa");
    } finally {
      setProcessing(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Deseja realmente excluir esta cobrança?")) return;
    try {
      await axios.delete(`/api/admin/billing?id=${id}`);
      fetchData();
    } catch (err) {
      alert("Erro ao excluir cobrança");
    }
  };

  const filteredBillings = billings.filter(b => 
    b.member && (
      b.member.name.toLowerCase().includes(search.toLowerCase()) ||
      b.member.registrationNum.includes(search)
    )
  );

  if (loading) return (
    <div className="p-8 flex items-center justify-center min-h-[400px] bg-[#020617]">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-white/10 border-t-blue-600 rounded-full animate-spin" />
        <p className="text-white font-black uppercase tracking-widest text-[10px]">Sincronizando Financeiro...</p>
      </div>
    </div>
  );

  return (
    <div className="p-8 space-y-10 bg-[#020617] min-h-screen text-white">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h1 className="text-4xl font-black text-white uppercase tracking-tighter">Gestão de Cobranças</h1>
          <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mt-1">Controle de mensalidades e emissão de boletos PIX</p>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={() => setMassModalOpen(true)}
            className="px-6 py-4 bg-orange-600 hover:bg-orange-700 text-white font-black rounded-2xl shadow-xl shadow-orange-900/20 transition-all uppercase tracking-widest text-[10px] flex items-center gap-3"
          >
            <Users className="w-4 h-4" /> Cobrança em Massa
          </button>
          <button 
            onClick={() => setModalOpen(true)}
            className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-2xl shadow-xl shadow-blue-900/20 transition-all uppercase tracking-widest text-[10px] flex items-center gap-3"
          >
            <Plus className="w-5 h-5" /> Nova Cobrança
          </button>
        </div>
      </header>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: "Total Emitido", value: formatCurrency(billings.reduce((acc, b) => acc + b.amount, 0)), icon: Receipt, color: "blue" },
          { label: "Recebido", value: formatCurrency(billings.filter(b => b.status === "PAID").reduce((acc, b) => acc + b.amount, 0)), icon: CheckCircle2, color: "emerald" },
          { label: "Pendente", value: formatCurrency(billings.filter(b => b.status === "PENDING").reduce((acc, b) => acc + b.amount, 0)), icon: Clock, color: "orange" },
          { label: "Atrasado", value: formatCurrency(billings.filter(b => b.status === "OVERDUE").reduce((acc, b) => acc + b.amount, 0)), icon: AlertCircle, color: "rose" },
        ].map((stat, i) => (
          <div key={i} className="bg-slate-900/40 p-8 rounded-[2.5rem] border border-white/5 shadow-2xl group hover:border-blue-500/30 transition-all backdrop-blur-xl">
            <div className={`w-12 h-12 bg-${stat.color}-500/10 rounded-2xl flex items-center justify-center text-${stat.color}-500 mb-6 group-hover:scale-110 transition-transform border border-${stat.color}-500/10`}>
              <stat.icon className="w-6 h-6" />
            </div>
            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">{stat.label}</p>
            <p className="text-2xl font-black text-white tracking-tighter">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Table Section */}
      <div className="bg-slate-900/40 rounded-[3rem] border border-white/5 shadow-2xl overflow-hidden backdrop-blur-xl">
        <div className="p-8 border-b border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input 
              type="text"
              placeholder="Buscar por nome ou matrícula..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-14 pr-6 py-4 bg-white/5 border border-white/10 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 transition-all text-xs font-bold text-white"
            />
          </div>
          <div className="flex gap-4">
             <button className="p-4 bg-white/5 text-gray-500 rounded-xl hover:bg-white/10 transition-colors border border-white/10">
               <Filter className="w-5 h-5" />
             </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-black/20">
                <th className="px-8 py-6 text-[10px] font-black text-gray-500 uppercase tracking-widest">Associado</th>
                <th className="px-8 py-6 text-[10px] font-black text-gray-500 uppercase tracking-widest">Matrícula</th>
                <th className="px-8 py-6 text-[10px] font-black text-gray-500 uppercase tracking-widest">Vencimento</th>
                <th className="px-8 py-6 text-[10px] font-black text-gray-500 uppercase tracking-widest">Valor</th>
                <th className="px-8 py-6 text-[10px] font-black text-gray-500 uppercase tracking-widest">Status</th>
                <th className="px-8 py-6 text-[10px] font-black text-gray-500 uppercase tracking-widest text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredBillings.map((bill) => (
                <tr key={bill.id} className="hover:bg-white/[0.02] transition-colors group">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-400 font-black text-xs border border-blue-500/10 overflow-hidden">
                        {bill.member.photoUrl ? (
                          <img src={bill.member.photoUrl} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <User className="w-5 h-5 text-blue-400" />
                        )}
                      </div>
                      <span className="text-sm font-black text-white uppercase tracking-tight">{bill.member.name}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className="text-xs font-black text-blue-400 tracking-widest">{bill.member.registrationNum}</span>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-gray-600" />
                      <span className="text-xs font-bold text-gray-400 uppercase">{format(new Date(bill.dueDate), "dd/MM/yyyy")}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className="text-sm font-black text-white tabular-nums">{formatCurrency(bill.amount)}</span>
                  </td>
                  <td className="px-8 py-6">
                    <span className={`px-4 py-1.5 text-[8px] font-black rounded-full uppercase tracking-widest border ${
                      bill.status === "PAID" 
                        ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/10" 
                        : bill.status === "OVERDUE"
                        ? "bg-rose-500/10 text-rose-500 border-rose-500/10"
                        : "bg-orange-500/10 text-orange-500 border-orange-500/10"
                    }`}>
                      {bill.status === "PAID" ? "Liquidado" : bill.status === "OVERDUE" ? "Atrasado" : "Pendente"}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => handleDelete(bill.id)}
                        className="p-3 bg-white/5 hover:bg-red-600 text-gray-600 hover:text-white rounded-xl transition-all border border-white/10"
                        title="Excluir Cobrança"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <button className="p-3 bg-white/5 text-gray-600 hover:text-white transition-colors border border-white/10 rounded-xl">
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Individual Billing Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <div onClick={() => setModalOpen(false)} className="absolute inset-0 bg-[#020617]/90 backdrop-blur-xl" />
          <div className="relative w-full max-w-lg bg-slate-900/60 border border-white/10 rounded-[3rem] p-10 shadow-2xl animate-in zoom-in duration-300 backdrop-blur-3xl overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-blue-600" />
            <button 
              onClick={() => setModalOpen(false)}
              className="absolute top-8 right-8 text-gray-500 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="flex items-center gap-4 mb-10">
              <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-500 border border-blue-500/10">
                <Receipt className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-2xl font-black text-white uppercase tracking-tighter">Nova Cobrança</h3>
                <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">Emissão individual de mensalidade</p>
              </div>
            </div>

            <form onSubmit={handleCreateBilling} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Selecionar Associado</label>
                <select 
                  required
                  value={selectedMember}
                  onChange={(e) => setSelectedMember(e.target.value)}
                  className="w-full px-6 py-4 bg-black/40 border border-white/10 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 text-sm font-bold text-white appearance-none"
                >
                  <option value="" className="bg-[#020617]">Selecione...</option>
                  {members.map(m => (
                    <option key={m.id} value={m.id} className="bg-[#020617]">{m.name} ({m.registrationNum})</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Valor (R$)</label>
                  <input 
                    type="number" 
                    step="0.01"
                    required
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full px-6 py-4 bg-black/40 border border-white/10 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 text-sm font-bold text-white"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Vencimento</label>
                  <input 
                    type="date"
                    required
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full px-6 py-4 bg-black/40 border border-white/10 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 text-sm font-bold text-white"
                  />
                </div>
              </div>
              <button 
                type="submit"
                disabled={processing}
                className="w-full py-5 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-2xl shadow-xl shadow-blue-900/20 transition-all uppercase tracking-widest text-xs mt-4 flex items-center justify-center gap-3"
              >
                {processing ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Plus className="w-5 h-5" />}
                Emitir Cobrança
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Mass Billing Modal */}
      {massModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <div onClick={() => setMassModalOpen(false)} className="absolute inset-0 bg-[#020617]/90 backdrop-blur-xl" />
          <div className="relative w-full max-w-lg bg-slate-900/60 border border-white/10 rounded-[3rem] p-10 shadow-2xl animate-in zoom-in duration-300 backdrop-blur-3xl overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-orange-600" />
            <button 
              onClick={() => setMassModalOpen(false)}
              className="absolute top-8 right-8 text-gray-500 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="flex items-center gap-4 mb-10">
              <div className="w-12 h-12 bg-orange-500/10 rounded-2xl flex items-center justify-center text-orange-500 border border-orange-500/10">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-2xl font-black text-white uppercase tracking-tighter">Cobrança em Massa</h3>
                <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">Gerar para todos os associados ativos</p>
              </div>
            </div>

            <form onSubmit={handleMassBilling} className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Valor Padrão (R$)</label>
                  <input 
                    type="number" 
                    step="0.01"
                    required
                    value={massAmount}
                    onChange={(e) => setMassAmount(e.target.value)}
                    className="w-full px-6 py-4 bg-black/40 border border-white/10 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 text-sm font-bold text-white"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Vencimento Geral</label>
                  <input 
                    type="date"
                    required
                    value={massDueDate}
                    onChange={(e) => setMassDueDate(e.target.value)}
                    className="w-full px-6 py-4 bg-black/40 border border-white/10 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 text-sm font-bold text-white"
                  />
                </div>
              </div>
              <div className="p-6 bg-blue-500/5 rounded-2xl border border-blue-500/10 flex gap-4">
                <ShieldCheck className="w-6 h-6 text-blue-500 shrink-0" />
                <p className="text-[11px] font-bold text-blue-400 leading-relaxed uppercase">
                  Esta ação irá gerar cobranças pendentes para todos os associados com status <span className="text-white">ATIVO</span> no sistema.
                </p>
              </div>
              <button 
                type="submit"
                disabled={processing}
                className="w-full py-5 bg-orange-600 hover:bg-orange-700 text-white font-black rounded-2xl shadow-xl shadow-orange-900/20 transition-all uppercase tracking-widest text-xs mt-4 flex items-center justify-center gap-3"
              >
                {processing ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Zap className="w-5 h-5" />}
                Gerar Cobranças em Lote
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
