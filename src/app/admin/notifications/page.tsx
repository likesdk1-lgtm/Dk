"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { 
  Bell, 
  Send, 
  Trash2, 
  Search, 
  Plus, 
  Smartphone, 
  MessageSquare,
  Upload,
  User,
  Info
} from "lucide-react";
import { format } from "date-fns";

export default function AdminNotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isNewNotifOpen, setIsNewNotifOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await axios.get("/api/admin/notifications");
      setNotifications(response.data);
      setLoading(false);
    } catch (err) {
      console.error("Erro ao carregar notificações", err);
    }
  };

  const [formData, setFormData] = useState({
    title: "",
    message: "",
    channel: "BOTH", // WHATSAPP, PORTAL, BOTH
    memberId: "", // All if empty
  });
  const [file, setFile] = useState<File | null>(null);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = new FormData();
    data.append("title", formData.title);
    data.append("message", formData.message);
    data.append("channel", formData.channel);
    data.append("memberId", formData.memberId);
    if (file) data.append("file", file);

    try {
      await axios.post("/api/admin/notifications", data);
      setIsNewNotifOpen(false);
      setFormData({ title: "", message: "", channel: "BOTH", memberId: "" });
      setFile(null);
      fetchNotifications();
    } catch (err) {
      console.error("Erro ao enviar notificação", err);
    }
  };

  return (
    <div className="p-8 space-y-10">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black text-blue-950 uppercase tracking-tighter">Notificações</h1>
          <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mt-1">Envio de mensagens personalizadas e comunicados em massa</p>
        </div>
        <button
          onClick={() => setIsNewNotifOpen(true)}
          className="px-8 py-4 bg-blue-700 hover:bg-blue-800 text-white font-black rounded-2xl shadow-xl shadow-blue-200 transition-all uppercase tracking-widest text-[10px] flex items-center gap-2 group"
        >
          <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform duration-300" />
          Nova Notificação
        </button>
      </header>

      {/* Search & Filter */}
      <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-xl shadow-gray-100/50 flex flex-col md:flex-row gap-6">
        <div className="flex-1 relative">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="BUSCAR NOTIFICAÇÃO PELO TÍTULO..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-14 pr-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 transition-all text-[10px] font-black uppercase tracking-widest text-blue-950"
          />
        </div>
      </div>

      {/* Notifications List */}
      <div className="bg-white rounded-[3rem] border border-gray-100 shadow-2xl shadow-gray-100/50 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-50/50 border-b border-gray-100">
            <tr>
              <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Canal</th>
              <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Conteúdo</th>
              <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Destinatário</th>
              <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Data / Hora</th>
              <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {notifications.map((notif) => (
              <tr key={notif.id} className="hover:bg-blue-50/20 transition-colors group">
                <td className="px-8 py-6">
                  <div className="flex items-center gap-2">
                    {notif.channel === "WHATSAPP" || notif.channel === "BOTH" ? (
                      <div className="w-8 h-8 bg-green-50 text-green-600 rounded-xl flex items-center justify-center shadow-sm">
                        <MessageSquare className="w-4 h-4" />
                      </div>
                    ) : null}
                    {notif.channel === "PORTAL" || notif.channel === "BOTH" ? (
                      <div className="w-8 h-8 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center shadow-sm">
                        <Smartphone className="w-4 h-4" />
                      </div>
                    ) : null}
                  </div>
                </td>
                <td className="px-8 py-6">
                  <div className="max-w-xs">
                    <p className="text-[11px] font-black text-blue-950 uppercase tracking-tight truncate">{notif.title}</p>
                    <p className="text-[10px] text-gray-400 font-medium truncate mt-0.5">{notif.message}</p>
                  </div>
                </td>
                <td className="px-8 py-6">
                  <div className="flex items-center gap-2">
                    <User className="w-3 h-3 text-gray-400" />
                    <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
                      {notif.memberId ? "Específico" : "Todos Associados"}
                    </span>
                  </div>
                </td>
                <td className="px-8 py-6">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                    {format(new Date(notif.sentAt), "dd/MM/yyyy HH:mm")}
                  </span>
                </td>
                <td className="px-8 py-6 text-right">
                  <button className="w-10 h-10 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl flex items-center justify-center transition-all opacity-0 group-hover:opacity-100">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* New Notification Modal */}
      {isNewNotifOpen && (
        <div className="fixed inset-0 bg-blue-950/40 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[3rem] p-10 shadow-2xl w-full max-w-2xl relative animate-in fade-in zoom-in duration-300 overflow-y-auto max-h-[90vh]">
            <h3 className="text-3xl font-black text-blue-950 uppercase tracking-tighter mb-8">Nova Notificação</h3>
            <form onSubmit={handleSend} className="space-y-8">
              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Título da Mensagem</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 transition-all text-xs font-bold text-blue-950"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Destinatário (CPF/Matrícula)</label>
                  <input
                    type="text"
                    placeholder="DEIXE VAZIO PARA TODOS..."
                    value={formData.memberId}
                    onChange={(e) => setFormData({ ...formData, memberId: e.target.value })}
                    className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none text-[10px] font-black uppercase tracking-widest text-blue-950"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center mb-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Mensagem</label>
                  <div className="flex gap-2">
                    <span className="px-2 py-0.5 bg-blue-50 text-blue-600 text-[8px] font-black rounded uppercase tracking-widest cursor-help flex items-center gap-1" title="Use {nome} para personalizar">
                      <Info className="w-3 h-3" />
                      Tag: {"{nome}"}
                    </span>
                  </div>
                </div>
                <textarea
                  required
                  rows={5}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Olá {nome}, temos um novo comunicado para você..."
                  className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-[2rem] outline-none focus:ring-2 focus:ring-blue-500 transition-all text-xs font-bold resize-none text-blue-950"
                />
              </div>

              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Canal de Envio</label>
                  <div className="grid grid-cols-3 gap-3">
                    {["WHATSAPP", "PORTAL", "BOTH"].map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setFormData({ ...formData, channel: c })}
                        className={`py-3 rounded-xl text-[8px] font-black uppercase tracking-widest transition-all ${
                          formData.channel === c 
                            ? "bg-blue-700 text-white shadow-lg shadow-blue-200" 
                            : "bg-gray-50 text-gray-400 hover:bg-gray-100"
                        }`}
                      >
                        {c === "BOTH" ? "Ambos" : c}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Anexo (PDF/JPG)</label>
                  <div className="relative h-14 border-2 border-dashed border-gray-100 rounded-xl group hover:border-blue-200 transition-colors">
                    <input
                      type="file"
                      accept=".pdf,image/*"
                      onChange={(e) => setFile(e.target.files?.[0] || null)}
                      className="absolute inset-0 opacity-0 cursor-pointer z-10"
                    />
                    <div className="absolute inset-0 flex items-center justify-center gap-2">
                      <Upload className="w-4 h-4 text-gray-400 group-hover:text-blue-600 transition-colors" />
                      <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest truncate max-w-[150px]">
                        {file ? file.name : "ANEXAR ARQUIVO"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-6 pt-6">
                <button
                  type="button"
                  onClick={() => setIsNewNotifOpen(false)}
                  className="flex-1 py-5 bg-gray-100 hover:bg-gray-200 text-gray-600 font-black rounded-2xl uppercase tracking-widest text-[10px] transition-all"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-5 bg-blue-700 hover:bg-blue-800 text-white font-black rounded-2xl uppercase tracking-widest text-[10px] shadow-2xl shadow-blue-200 transition-all flex items-center justify-center gap-3 group"
                >
                  <Send className="w-4 h-4 group-hover:translate-x-2 group-hover:-translate-y-2 transition-transform" />
                  Disparar Notificação
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
