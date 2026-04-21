"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { formatCurrency } from "@/lib/utils";
import { format } from "date-fns";
import { Transaction, TransactionCategory } from "@prisma/client";

export default function FinancePage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<TransactionCategory[]>([]);
  const [isNewTransactionOpen, setIsNewTransactionOpen] = useState(false);
  const [isManageCategoriesOpen, setIsManageCategoriesOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // New Transaction Form
  const [formData, setFormData] = useState({
    description: "",
    amount: "",
    type: "INCOME",
    category: "",
    date: new Date().toISOString().split("T")[0],
  });
  const [receipt, setReceipt] = useState<File | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [transRes, catRes] = await Promise.all([
        axios.get("/api/admin/finance/transactions"),
        axios.get("/api/admin/finance/categories"),
      ]);
      setTransactions(transRes.data);
      setCategories(catRes.data);
      setLoading(false);
    } catch (err) {
      console.error("Erro ao carregar dados financeiros", err);
    }
  };

  const handleSaveTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = new FormData();
    Object.entries(formData).forEach(([key, value]) => data.append(key, value));
    if (receipt) data.append("receipt", receipt);

    try {
      await axios.post("/api/admin/finance/transactions", data);
      setIsNewTransactionOpen(false);
      fetchData();
    } catch (err) {
      console.error("Erro ao salvar transação", err);
    }
  };

  return (
    <div className="container mx-auto p-6 font-sans bg-[#020617] min-h-screen text-white">
      <div className="flex justify-between items-end mb-12">
        <div>
          <h1 className="text-4xl font-black text-white uppercase tracking-tighter">Financeiro</h1>
          <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mt-1">Gestão de receitas e despesas do sindicato</p>
        </div>
        <div className="flex gap-4">
          <button
            onClick={() => setIsManageCategoriesOpen(true)}
            className="px-6 py-4 bg-white/5 border border-white/10 text-gray-400 font-black rounded-2xl hover:bg-white/10 transition-all uppercase tracking-widest text-[10px]"
          >
            Categorias
          </button>
          <button
            onClick={() => setIsNewTransactionOpen(true)}
            className="px-8 py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-2xl shadow-xl shadow-emerald-900/20 transition-all uppercase tracking-widest text-[10px]"
          >
            Nova Transação
          </button>
        </div>
      </div>

      <div className="bg-white/5 backdrop-blur-2xl rounded-[2.5rem] border border-white/10 overflow-hidden shadow-2xl">
        <table className="w-full text-left">
          <thead className="bg-white/[0.02] border-b border-white/5">
            <tr>
              <th className="px-8 py-6 text-[10px] font-black text-gray-500 uppercase tracking-widest">Data</th>
              <th className="px-8 py-6 text-[10px] font-black text-gray-500 uppercase tracking-widest">Descrição</th>
              <th className="px-8 py-6 text-[10px] font-black text-gray-500 uppercase tracking-widest">Categoria</th>
              <th className="px-8 py-6 text-[10px] font-black text-gray-500 uppercase tracking-widest">Valor</th>
              <th className="px-8 py-6 text-[10px] font-black text-gray-500 uppercase tracking-widest text-right">Comprovante</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {transactions.map((trans) => (
              <tr key={trans.id} className="hover:bg-white/[0.02] transition-colors group">
                <td className="px-8 py-6">
                  <span className="text-xs font-bold text-gray-400">{format(new Date(trans.date), "dd/MM/yyyy")}</span>
                </td>
                <td className="px-8 py-6">
                  <span className="text-xs font-black text-white uppercase tracking-tight group-hover:text-emerald-400 transition-colors">{trans.description}</span>
                </td>
                <td className="px-8 py-6">
                  <span className="px-3 py-1 bg-white/5 text-gray-400 text-[8px] font-black rounded-full uppercase tracking-widest border border-white/10">
                    {trans.category}
                  </span>
                </td>
                <td className="px-8 py-6">
                  <span className={`text-xs font-black tabular-nums ${trans.type === "INCOME" ? "text-emerald-500" : "text-rose-500"}`}>
                    {trans.type === "INCOME" ? "+" : "-"} {formatCurrency(Number(trans.amount))}
                  </span>
                </td>
                <td className="px-8 py-6 text-right">
                  {trans.receiptUrl && (
                    <button className="text-emerald-500 hover:text-white text-[10px] font-black uppercase tracking-widest transition-colors">Ver Anexo</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* New Transaction Modal */}
      {isNewTransactionOpen && (
        <div className="fixed inset-0 bg-[#020617]/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900/90 border border-white/10 rounded-[3rem] p-10 shadow-2xl w-full max-w-lg relative animate-in fade-in zoom-in duration-300 backdrop-blur-2xl">
            <h3 className="text-2xl font-black text-white uppercase tracking-tight mb-8">Nova Transação</h3>
            <form onSubmit={handleSaveTransaction} className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="col-span-2 space-y-1">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Descrição</label>
                  <input
                    type="text"
                    required
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl outline-none text-white font-bold focus:ring-2 focus:ring-emerald-500 transition-all"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Valor</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl outline-none text-white font-bold focus:ring-2 focus:ring-emerald-500 transition-all"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Tipo</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full px-6 py-4 bg-black/40 border border-white/10 rounded-2xl outline-none text-xs font-bold text-white [color-scheme:dark]"
                  >
                    <option value="INCOME">Receita (+)</option>
                    <option value="EXPENSE">Despesa (-)</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Comprovante (PDF/JPG)</label>
                  <input
                    type="file"
                    required
                    accept=".pdf,image/*"
                    onChange={(e) => setReceipt(e.target.files?.[0] || null)}
                    className="w-full px-6 py-3 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-bold text-gray-400"
                  />
                </div>
              </div>
              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setIsNewTransactionOpen(false)}
                  className="flex-1 py-5 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white font-black rounded-2xl uppercase tracking-widest text-[10px] transition-all border border-white/10"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-5 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-2xl uppercase tracking-widest text-[10px] shadow-2xl shadow-emerald-900/20 transition-all"
                >
                  Salvar Transação
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
