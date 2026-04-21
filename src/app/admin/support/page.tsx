"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { 
  MessageSquare, 
  Send, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw,
  Search,
  Plus
} from "lucide-react";

type Ticket = {
  id: string;
  subject: string;
  message: string;
  status: string;
  responseMessage?: string | null;
  createdAt: string;
};

export default function Page() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ subject: "", message: "" });

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get("/api/admin/support");
      setTickets(res.data.tickets || []);
    } catch (err: any) {
      setError("Erro ao carregar tickets");
    } finally {
      setLoading(false);
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await axios.post("/api/admin/support", formData);
      setFormData({ subject: "", message: "" });
      setShowForm(false);
      await load();
      alert("Ticket enviado com sucesso! Nossa equipe analisará seu pedido.");
    } catch (err: any) {
      setError("Erro ao enviar ticket. Tente novamente.");
    } finally {
      setSaving(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  return (
    <div className="space-y-8 md:space-y-12 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-500">
              <MessageSquare className="w-6 h-6" />
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-white uppercase tracking-tighter">Central de Ajuda</h1>
          </div>
          <p className="text-[10px] md:text-xs font-bold text-gray-500 uppercase tracking-widest ml-13">Suporte direto com a equipe do SaaS</p>
        </div>
        
        <div className="flex gap-3 w-full md:w-auto">
          <button
            onClick={() => load()}
            disabled={loading}
            className="p-4 bg-white/5 text-gray-400 hover:text-white rounded-2xl border border-white/10 transition-all hover:bg-white/10"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? "animate-spin" : ""}`} />
          </button>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex-1 md:flex-none px-8 py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-2xl shadow-xl shadow-emerald-900/20 transition-all uppercase tracking-widest text-[10px] flex items-center justify-center gap-3"
          >
            <Plus className="w-4 h-4" /> Novo Ticket
          </button>
        </div>
      </div>

      {showForm && (
        <form onSubmit={onSubmit} className="bg-white/5 backdrop-blur-3xl rounded-[2.5rem] border border-white/10 p-8 md:p-10 space-y-6 shadow-2xl animate-in slide-in-from-top-4 duration-500">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Assunto do Chamado</label>
              <input 
                required
                placeholder="Ex: Dúvida sobre cobrança PIX"
                value={formData.subject}
                onChange={e => setFormData({ ...formData, subject: e.target.value })}
                className="w-full px-6 py-4 bg-black/20 border border-white/10 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all text-white font-bold" 
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Descrição Detalhada</label>
            <textarea 
              required
              rows={4} 
              placeholder="Descreva o que está acontecendo..."
              value={formData.message}
              onChange={e => setFormData({ ...formData, message: e.target.value })}
              className="w-full px-6 py-4 bg-black/20 border border-white/10 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all text-white font-bold resize-none" 
            />
          </div>
          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-8 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest hover:text-white transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-10 py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-2xl shadow-xl shadow-emerald-900/20 transition-all uppercase tracking-widest text-[10px] flex items-center gap-3"
            >
              {saving ? "Enviando..." : "Enviar Chamado"} <Send className="w-4 h-4" />
            </button>
          </div>
        </form>
      )}

      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-center gap-3 text-rose-500">
          <AlertCircle className="w-5 h-5" />
          <p className="text-xs font-black uppercase tracking-widest">{error}</p>
        </div>
      )}

      <div className="rounded-[3rem] border border-white/10 bg-white/5 backdrop-blur-3xl overflow-hidden shadow-2xl">
        <div className="px-8 py-6 bg-white/5 border-b border-white/5 flex items-center justify-between">
          <h2 className="text-xs font-black text-white uppercase tracking-widest">Seus Tickets Enviados</h2>
          <div className="flex items-center gap-2 text-[10px] font-bold text-gray-500 uppercase tracking-widest">
            <Search className="w-3 h-3" /> Buscar
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/[0.02]">
                <th className="px-8 py-6 text-[10px] font-black text-emerald-500 uppercase tracking-[0.3em]">Chamado / Data</th>
                <th className="px-8 py-6 text-[10px] font-black text-emerald-500 uppercase tracking-[0.3em]">Descrição</th>
                <th className="px-8 py-6 text-[10px] font-black text-emerald-500 uppercase tracking-[0.3em]">Status</th>
                <th className="px-8 py-6 text-[10px] font-black text-emerald-500 uppercase tracking-[0.3em]">Resposta SaaS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {tickets.map((t: Ticket) => (
                <tr key={t.id} className="hover:bg-white/[0.02] transition-colors group/row">
                  <td className="px-8 py-6">
                    <div className="font-black text-white uppercase tracking-tighter group-hover/row:text-emerald-400 transition-colors">{t.subject}</div>
                    <div className="flex items-center gap-2 mt-1">
                      <Clock className="w-3 h-3 text-gray-600" />
                      <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">
                        {format(new Date(t.createdAt), "dd MMM yyyy 'às' HH:mm", { locale: ptBR })}
                      </span>
                    </div>
                  </td>
                  <td className="px-8 py-6 max-w-xs">
                    <p className="text-xs font-medium text-gray-400 line-clamp-2">{t.message}</p>
                  </td>
                  <td className="px-8 py-6">
                    <span className={`px-4 py-1.5 text-[9px] font-black rounded-full uppercase tracking-widest border shadow-sm ${
                      t.status === "RESOLVED" 
                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" 
                        : t.status === "IN_PROGRESS"
                        ? "bg-blue-500/10 text-blue-400 border-blue-500/20"
                        : "bg-amber-500/10 text-amber-400 border-amber-500/20 animate-pulse"
                    }`}>
                      {t.status === "RESOLVED" ? "Resolvido" : t.status === "IN_PROGRESS" ? "Em Análise" : "Aguardando"}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    {t.responseMessage ? (
                      <div className="flex items-start gap-3 p-4 bg-emerald-500/5 rounded-2xl border border-emerald-500/10">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5" />
                        <p className="text-xs font-bold text-emerald-500/80 leading-relaxed italic">&ldquo;{t.responseMessage}&rdquo;</p>
                      </div>
                    ) : (
                      <span className="text-[9px] font-black text-gray-700 uppercase tracking-widest italic">Aguardando resposta da equipe...</span>
                    )}
                  </td>
                </tr>
              ))}
              {!loading && tickets.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-20 text-center">
                    <div className="flex flex-col items-center gap-4 opacity-30">
                      <MessageSquare className="w-12 h-12" />
                      <p className="text-xs font-black uppercase tracking-widest">Nenhum ticket encontrado</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
