"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { 
  Calendar, 
  MapPin, 
  Plus, 
  Trash2, 
  Check, 
  X, 
  Users, 
  Clock,
  Search,
  ChevronRight,
  ShieldCheck,
  LayoutDashboard,
  FileText,
  UserCheck,
  UserX,
  FileDown,
  Printer
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Event {
  id: string;
  title: string;
  description?: string;
  date: string;
  location?: string;
  status: string;
  _count?: {
    checkins: number;
  };
}

export default function AdminEventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAttendanceModalOpen, setIsAttendanceModalOpen] = useState(false);
  const [selectedEventForReport, setSelectedEventForReport] = useState<Event | null>(null);
  const [attendanceReport, setAttendanceReport] = useState<any[]>([]);
  const [loadingReport, setLoadingReport] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: "",
    description: "",
    date: "",
    location: "",
    status: "ACTIVE"
  });

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await axios.get("/api/admin/events");
      setEvents(response.data);
    } catch (err) {
      console.error("Erro ao carregar eventos", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAttendanceReport = async (eventId: string) => {
    setLoadingReport(true);
    try {
      const response = await axios.get(`/api/admin/events/${eventId}/attendance`);
      setAttendanceReport(response.data);
    } catch (err) {
      console.error("Erro ao carregar relatório de presença", err);
      alert("Erro ao carregar relatório");
    } finally {
      setLoadingReport(false);
    }
  };

  const handleOpenReport = (event: Event) => {
    setSelectedEventForReport(event);
    setIsAttendanceModalOpen(true);
    fetchAttendanceReport(event.id);
  };

  const handlePrintReport = () => {
    window.print();
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post("/api/admin/events", newEvent);
      setIsModalOpen(false);
      setNewEvent({ title: "", description: "", date: "", location: "", status: "ACTIVE" });
      fetchEvents();
    } catch (err) {
      alert("Erro ao criar evento");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Excluir este evento?")) return;
    try {
      await axios.delete(`/api/admin/events/${id}`);
      fetchEvents();
    } catch (err) {
      alert("Erro ao excluir");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 font-sans text-white">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6">
        <div>
          <h1 className="text-4xl font-black uppercase tracking-tighter">
            Gestão de <span className="text-emerald-500">Eventos</span>
          </h1>
          <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.3em] mt-2">
            Calendário & Presença • Dk Sind Elite
          </p>
        </div>
        
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-6 py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-2xl shadow-xl shadow-emerald-900/20 transition-all uppercase tracking-widest text-[10px] flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Novo Evento
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.map((event) => (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            key={event.id}
            className="bg-white/5 backdrop-blur-2xl rounded-[2.5rem] border border-white/10 p-8 shadow-2xl group hover:border-emerald-500/30 transition-all"
          >
            <div className="flex justify-between items-start mb-6">
              <div className={`px-4 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest border ${
                event.status === "ACTIVE" 
                  ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" 
                  : "bg-gray-500/10 text-gray-500 border-gray-500/20"
              }`}>
                {event.status === "ACTIVE" ? "Ativo" : "Finalizado"}
              </div>
              <button 
                onClick={() => handleDelete(event.id)}
                className="p-2 bg-white/5 hover:bg-red-500/20 text-gray-500 hover:text-red-500 rounded-lg transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            <h3 className="text-xl font-black uppercase tracking-tight mb-4 group-hover:text-emerald-400 transition-colors">
              {event.title}
            </h3>

            {event.description && (
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-6 line-clamp-2 italic">
                {event.description}
              </p>
            )}

            <div className="space-y-3 mb-8">
              <div className="flex items-center gap-3 text-gray-400">
                <Calendar className="w-4 h-4 text-emerald-500" />
                <span className="text-xs font-bold uppercase tracking-widest">
                  {format(new Date(event.date), "dd 'de' MMMM, yyyy", { locale: ptBR })}
                </span>
              </div>
              <div className="flex items-center gap-3 text-gray-400">
                <Clock className="w-4 h-4 text-emerald-500" />
                <span className="text-xs font-bold uppercase tracking-widest">
                  {format(new Date(event.date), "HH:mm", { locale: ptBR })}
                </span>
              </div>
              <div className="flex items-center gap-3 text-gray-400">
                <MapPin className="w-4 h-4 text-emerald-500" />
                <span className="text-xs font-bold uppercase tracking-widest truncate">
                  {event.location || "Local não informado"}
                </span>
              </div>
            </div>

            <div className="pt-6 border-t border-white/5 flex items-center justify-between gap-4">
              <button
                onClick={() => handleOpenReport(event)}
                className="text-[9px] font-black uppercase tracking-widest text-blue-500 hover:text-blue-400 transition-colors flex items-center gap-1.5"
              >
                <FileText className="w-3.5 h-3.5" /> Relatório
              </button>
              
              <button
                onClick={() => window.location.href = `/admin/checkin?eventId=${event.id}`}
                className="text-[9px] font-black uppercase tracking-widest text-emerald-500 hover:text-emerald-400 transition-colors flex items-center gap-1.5"
              >
                Validar <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Modal Novo Evento */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-[#020617]/95 backdrop-blur-xl"
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white/5 border border-white/10 rounded-[3rem] p-10 shadow-2xl relative z-10 max-w-lg w-full"
            >
              <h2 className="text-2xl font-black uppercase tracking-tighter mb-8">Novo <span className="text-emerald-500">Evento</span></h2>
              
              <form onSubmit={handleCreate} className="space-y-6">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2 block">Título</label>
                  <input
                    type="text"
                    required
                    value={newEvent.title}
                    onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2 block">Descrição</label>
                  <textarea
                    value={newEvent.description}
                    onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                    rows={3}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all resize-none"
                    placeholder="Descreva o evento..."
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2 block">Data e Hora</label>
                  <input
                    type="datetime-local"
                    required
                    value={newEvent.date}
                    onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2 block">Local</label>
                  <input
                    type="text"
                    value={newEvent.location}
                    onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                  />
                </div>
                
                <div className="pt-4 flex gap-4">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 py-4 bg-white/5 hover:bg-white/10 text-white font-black rounded-2xl border border-white/10 transition-all uppercase tracking-widest text-[10px]"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-2xl shadow-xl shadow-emerald-900/40 transition-all uppercase tracking-widest text-[10px]"
                  >
                    Criar Evento
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal Relatório de Presença */}
      <AnimatePresence>
        {isAttendanceModalOpen && selectedEventForReport && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAttendanceModalOpen(false)}
              className="absolute inset-0 bg-[#020617]/95 backdrop-blur-xl"
            />
            
              <div 
                id="printable-report"
                className="bg-white/5 border border-white/10 rounded-[3rem] p-8 md:p-10 shadow-2xl relative z-10 max-w-4xl w-full max-h-[90vh] flex flex-col"
              >
                <div className="flex justify-between items-start mb-8 print:mb-12">
                  <div>
                    <h2 className="text-2xl font-black uppercase tracking-tighter print:text-black">
                      Relatório de <span className="text-blue-500">Presença</span>
                    </h2>
                    <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest mt-1 print:text-gray-600">
                      {selectedEventForReport.title} • {format(new Date(selectedEventForReport.date), "dd/MM/yyyy")}
                    </p>
                  </div>
                  <div className="flex gap-2 print:hidden">
                    <button
                      onClick={handlePrintReport}
                      className="p-3 bg-emerald-600/10 hover:bg-emerald-600/20 rounded-2xl border border-emerald-500/20 text-emerald-500 transition-all flex items-center gap-2"
                    >
                      <Printer className="w-5 h-5" />
                      <span className="text-[10px] font-black uppercase tracking-widest">Imprimir</span>
                    </button>
                    <button
                      onClick={() => setIsAttendanceModalOpen(false)}
                      className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/10 text-gray-400 hover:text-white transition-all"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Stats Summary */}
                <div className="grid grid-cols-3 gap-4 mb-8 print:gap-8">
                  <div className="bg-white/5 p-4 rounded-2xl border border-white/5 print:bg-white print:border-gray-200">
                    <p className="text-[8px] font-black text-gray-500 uppercase tracking-widest mb-1 print:text-gray-500">Total Associados</p>
                    <p className="text-xl font-black text-white print:text-black">{attendanceReport.length}</p>
                  </div>
                  <div className="bg-emerald-500/5 p-4 rounded-2xl border border-emerald-500/10 print:bg-white print:border-gray-200">
                    <p className="text-[8px] font-black text-emerald-500/50 uppercase tracking-widest mb-1 print:text-emerald-500">Presentes</p>
                    <p className="text-xl font-black text-emerald-500">
                      {attendanceReport.filter(r => r.present).length}
                    </p>
                  </div>
                  <div className="bg-red-500/5 p-4 rounded-2xl border border-red-500/10 print:bg-white print:border-gray-200">
                    <p className="text-[8px] font-black text-red-500/50 uppercase tracking-widest mb-1 print:text-red-500">Ausentes</p>
                    <p className="text-xl font-black text-red-500">
                      {attendanceReport.filter(r => !r.present).length}
                    </p>
                  </div>
                </div>

                {/* Attendance List */}
                <div className="flex-1 overflow-y-auto pr-2 space-y-2 custom-scrollbar print:overflow-visible">
                  {loadingReport ? (
                    <div className="py-20 flex flex-col items-center justify-center space-y-4">
                      <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                      <p className="text-[10px] font-black uppercase tracking-widest text-blue-500">Gerando Relatório...</p>
                    </div>
                  ) : (
                    attendanceReport.map((record) => (
                      <div 
                        key={record.id}
                        className="bg-white/5 p-4 rounded-2xl border border-white/5 flex items-center justify-between group hover:bg-white/10 transition-all print:bg-white print:border-b print:border-gray-100 print:rounded-none print:px-0"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/10 overflow-hidden print:hidden">
                            {record.photoUrl ? (
                              <img src={record.photoUrl} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <Users className="w-5 h-5 text-gray-700" />
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-black text-white uppercase tracking-tight print:text-black">{record.name}</p>
                            <p className="text-[8px] font-black text-gray-500 uppercase tracking-widest print:text-gray-400">Matrícula: {record.registrationNum}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-6">
                          {record.present ? (
                            <div className="text-right">
                              <div className="flex items-center gap-2 text-emerald-500 mb-0.5">
                                <UserCheck className="w-4 h-4" />
                                <span className="text-[9px] font-black uppercase tracking-widest">Presente</span>
                              </div>
                              <p className="text-[8px] font-black text-gray-500 uppercase print:text-gray-400">
                                {format(new Date(record.checkedAt), "HH:mm:ss")}
                              </p>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 text-red-500/50 print:text-red-500">
                              <UserX className="w-4 h-4" />
                              <span className="text-[9px] font-black uppercase tracking-widest">Ausente</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <div className="mt-8 pt-8 border-t border-white/5 print:hidden">
                  <button
                    onClick={() => setIsAttendanceModalOpen(false)}
                    className="w-full py-5 bg-white/5 hover:bg-white/10 text-white font-black rounded-2xl border border-white/10 transition-all uppercase tracking-widest text-[10px]"
                  >
                    Fechar Relatório
                  </button>
                </div>
              </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
