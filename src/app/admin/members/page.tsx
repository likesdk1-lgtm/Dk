"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { formatCPF } from "@/lib/utils";
import { format } from "date-fns";
import { MembershipCard } from "@/components/MembershipCard";
import { 
  User, 
  Edit, 
  CreditCard, 
  Plus, 
  Search, 
  ChevronRight,
  ShieldCheck,
  X,
  Printer,
  Trash2,
  FileText,
  Eye,
  AlertCircle,
  Receipt
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

interface Document {
  id: string;
  name: string;
  fileUrl: string;
  fileType: string;
}

interface Member {
  id: string;
  name: string;
  cpf: string;
  birthDate: string;
  registrationNum: string;
  photoUrl?: string | null;
  status: string;
  documents?: Document[];
}

export default function MembersListPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [filteredMembers, setFilteredMembers] = useState<Member[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [isCardOpen, setIsCardOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    fetchMembers();
  }, []);

  useEffect(() => {
    const filtered = members.filter(m => 
      m.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      m.cpf.includes(searchTerm.replace(/\D/g, "")) ||
      m.registrationNum.includes(searchTerm)
    );
    setFilteredMembers(filtered);
  }, [searchTerm, members]);

  const fetchMembers = async () => {
    try {
      const response = await axios.get("/api/admin/members");
      setMembers(response.data);
      setFilteredMembers(response.data);
      setLoading(false);
    } catch (err) {
      console.error("Erro ao carregar associados", err);
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`TEM CERTEZA QUE DESEJA EXCLUIR O ASSOCIADO: ${name.toUpperCase()}?\nESTA AÇÃO É IRREVERSÍVEL.`)) return;
    
    setDeleting(id);
    try {
      await axios.delete(`/api/admin/members/${id}`);
      setMembers(members.filter(m => m.id !== id));
    } catch (err) {
      alert("Erro ao excluir associado");
    } finally {
      setDeleting(null);
    }
  };

  const handleShowCard = (member: Member) => {
    setSelectedMember(member);
    setIsCardOpen(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 font-sans">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6">
        <div>
          <h1 className="text-4xl font-black text-white uppercase tracking-tighter">
            Gestão de <span className="text-emerald-500">Associados</span>
          </h1>
          <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.3em] mt-2">
            Base de dados • Dk Sind Elite
          </p>
        </div>
        
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input 
              type="text"
              placeholder="BUSCAR POR NOME, CPF OU MATRÍCULA..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-6 py-4 bg-white/5 border border-white/10 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none text-white font-bold text-[10px] transition-all"
            />
          </div>
          <Link
            href="/admin/members/new"
            className="px-6 py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-2xl shadow-xl shadow-emerald-900/20 transition-all uppercase tracking-widest text-[10px] flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Novo
          </Link>
        </div>
      </div>

      <div className="bg-white/5 backdrop-blur-2xl rounded-[2.5rem] border border-white/10 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5 bg-white/[0.02]">
                <th className="px-8 py-6 text-[10px] font-black text-gray-500 uppercase tracking-widest">Associado</th>
                <th className="px-8 py-6 text-[10px] font-black text-gray-500 uppercase tracking-widest">Matrícula</th>
                <th className="px-8 py-6 text-[10px] font-black text-gray-500 uppercase tracking-widest">Status</th>
                <th className="px-8 py-6 text-[10px] font-black text-gray-500 uppercase tracking-widest text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredMembers.map((member) => (
                <motion.tr 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  key={member.id} 
                  className="group hover:bg-white/[0.02] transition-colors"
                >
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-blue-500/20 overflow-hidden flex items-center justify-center border border-white/10 group-hover:border-emerald-500/30 transition-all">
                        {member.photoUrl ? (
                          <img src={member.photoUrl} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <User className="w-5 h-5 text-emerald-500" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-black text-white uppercase tracking-tight group-hover:text-emerald-400 transition-colors">
                          {member.name}
                        </p>
                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-0.5">
                          CPF: {formatCPF(member.cpf)}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex flex-col">
                      <span className="text-xs font-black text-white tracking-widest uppercase">{member.registrationNum}</span>
                      <span className="text-[8px] font-black text-gray-600 uppercase tracking-widest mt-1">SINDICAL ID</span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span
                      className={`px-3 py-1.5 text-[8px] font-black rounded-lg uppercase tracking-widest inline-flex items-center gap-1.5 ${
                        member.status === "ACTIVE"
                          ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                          : "bg-red-500/10 text-red-500 border border-red-500/20"
                      }`}
                    >
                      <div className={`w-1 h-1 rounded-full ${member.status === "ACTIVE" ? "bg-emerald-500" : "bg-red-500"} animate-pulse`} />
                      {member.status === "ACTIVE" ? "Ativo" : "Inativo"}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/admin/members/${member.id}/edit`}
                        className="p-3 bg-white/5 hover:bg-orange-500 text-gray-400 hover:text-white rounded-xl transition-all border border-white/10"
                        title="Histórico Financeiro"
                      >
                        <Receipt className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => handleShowCard(member)}
                        className="p-3 bg-white/5 hover:bg-emerald-500 text-gray-400 hover:text-white rounded-xl transition-all border border-white/10"
                        title="Ver Carteirinha"
                      >
                        <CreditCard className="w-4 h-4" />
                      </button>
                      <Link
                        href={`/admin/members/${member.id}/edit`}
                        className="p-3 bg-white/5 hover:bg-blue-500 text-gray-400 hover:text-white rounded-xl transition-all border border-white/10"
                        title="Editar Associado"
                      >
                        <Edit className="w-4 h-4" />
                      </Link>
                      <button 
                        onClick={() => handleDelete(member.id, member.name)}
                        disabled={deleting === member.id}
                        className="p-3 bg-white/5 hover:bg-red-600 text-gray-400 hover:text-white rounded-xl transition-all border border-white/10 disabled:opacity-50"
                        title="Excluir Associado"
                      >
                        {deleting === member.id ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Trash2 className="w-4 h-4" />}
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredMembers.length === 0 && (
          <div className="p-20 text-center space-y-4">
            <div className="w-16 h-16 bg-white/5 rounded-3xl flex items-center justify-center mx-auto">
              <Search className="w-8 h-8 text-gray-700" />
            </div>
            <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest">Nenhum associado encontrado</p>
          </div>
        )}
      </div>

      {/* Membership Card Modal */}
      <AnimatePresence>
        {isCardOpen && selectedMember && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCardOpen(false)}
              className="absolute inset-0 bg-[#020617]/95 backdrop-blur-xl"
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white/5 border border-white/10 rounded-[3rem] p-10 shadow-2xl relative z-10 max-w-lg w-full overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-blue-500" />
              
              <button
                onClick={() => setIsCardOpen(false)}
                className="absolute top-6 right-6 text-gray-500 hover:text-white p-2 rounded-xl hover:bg-white/5 transition-all"
              >
                <X className="w-6 h-6" />
              </button>

              <div className="flex flex-col items-center">
                <div className="mb-8 text-center">
                  <h3 className="text-xl font-black text-white uppercase tracking-tighter">
                    Identidade <span className="text-emerald-500">Digital</span>
                  </h3>
                  <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mt-1">Dk Sind • Sindicato Digital</p>
                </div>

                <div className="relative group">
                  <div className="absolute -inset-4 bg-emerald-500/10 rounded-[2rem] blur-2xl group-hover:bg-emerald-500/20 transition-all" />
                  <div id="printable-card">
                    <MembershipCard
                      member={{
                        ...selectedMember,
                        birthDate: new Date(selectedMember.birthDate)
                      }}
                      unionName="Dk Sind"
                      logoUrl={null}
                      statusLabel={selectedMember.status === "ACTIVE" ? "Ativo" : "Inativo"}
                    />
                  </div>
                </div>

                <div className="mt-10 grid grid-cols-2 gap-4 w-full">
                  <button
                    onClick={() => window.print()}
                    className="flex-1 py-5 bg-white/5 hover:bg-white/10 text-white font-black rounded-2xl border border-white/10 transition-all uppercase tracking-widest text-[10px] flex items-center justify-center gap-2"
                  >
                    <Printer className="w-4 h-4 text-emerald-500" /> Imprimir
                  </button>
                  <button
                    onClick={() => setIsCardOpen(false)}
                    className="flex-1 py-5 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-2xl shadow-xl shadow-emerald-900/40 transition-all uppercase tracking-widest text-[10px]"
                  >
                    Concluído
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>


    </div>
  );
}
