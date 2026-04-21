"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { Edit2, Trash2, UserPlus, X, Shield, ShieldCheck } from "lucide-react";

// Local interface to avoid Prisma build issues
interface Admin {
  id: string;
  name: string;
  cpf: string;
  role: string;
}

export default function AdministrativeProfilesPage() {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState<Admin | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    cpf: "",
    password: "",
    role: "ADMIN",
  });

  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    try {
      const response = await axios.get("/api/admin/profiles");
      setAdmins(response.data);
    } catch (err) {
      console.error("Erro ao carregar administradores", err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenNew = () => {
    setEditingAdmin(null);
    setFormData({ name: "", cpf: "", password: "", role: "ADMIN" });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (admin: Admin) => {
    setEditingAdmin(admin);
    setFormData({
      name: admin.name,
      cpf: admin.cpf,
      password: "", // Keep password empty when editing
      role: admin.role,
    });
    setIsModalOpen(true);
  };

  const handleSaveAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingAdmin) {
        await axios.patch(`/api/admin/profiles/${editingAdmin.id}`, formData);
      } else {
        await axios.post("/api/admin/profiles", formData);
      }
      setIsModalOpen(false);
      fetchAdmins();
    } catch (err: any) {
      alert(err.response?.data?.error || "Erro ao salvar administrador");
    }
  };

  const handleDeleteAdmin = async (admin: Admin) => {
    if (!confirm(`Tem certeza que deseja excluir ${admin.name}?`)) return;
    
    try {
      await axios.delete(`/api/admin/profiles/${admin.id}`);
      fetchAdmins();
    } catch (err: any) {
      alert(err.response?.data?.error || "Erro ao excluir administrador");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const superAdminsCount = admins.filter(a => a.role === "SUPER_ADMIN").length;

  return (
    <div className="container mx-auto p-6 font-sans text-white">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6">
        <div>
          <h1 className="text-4xl font-black uppercase tracking-tighter">
            Perfis <span className="text-emerald-500">Administrativos</span>
          </h1>
          <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.3em] mt-2">
            Gestão de Acesso • Dk Sind Elite
          </p>
        </div>
        
        <button
          onClick={handleOpenNew}
          className="px-6 py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-2xl shadow-xl shadow-emerald-900/20 transition-all uppercase tracking-widest text-[10px] flex items-center gap-2"
        >
          <UserPlus className="w-4 h-4" /> Novo Admin
        </button>
      </div>

      <div className="bg-white/5 backdrop-blur-3xl rounded-[2.5rem] border border-white/10 overflow-hidden shadow-2xl">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-white/5 border-b border-white/5">
              <th className="px-8 py-6 text-[10px] font-black text-emerald-500 uppercase tracking-[0.3em]">Membro</th>
              <th className="px-8 py-6 text-[10px] font-black text-emerald-500 uppercase tracking-[0.3em]">CPF</th>
              <th className="px-8 py-6 text-[10px] font-black text-emerald-500 uppercase tracking-[0.3em]">Cargo</th>
              <th className="px-8 py-6 text-[10px] font-black text-emerald-500 uppercase tracking-[0.3em] text-right">Gestão</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {admins.map((admin) => (
              <tr key={admin.id} className="hover:bg-white/[0.02] transition-colors group/row">
                <td className="px-8 py-6">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-blue-500 flex items-center justify-center text-white font-black text-xs">
                      {admin.name.substring(0, 1)}
                    </div>
                    <div>
                      <p className="text-sm font-black text-white uppercase tracking-tight group-hover/row:text-emerald-400 transition-colors">
                        {admin.name}
                      </p>
                      <p className="text-[8px] font-black text-gray-500 uppercase tracking-widest">Acesso Ativo</p>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-6">
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">
                    {admin.cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4")}
                  </span>
                </td>
                <td className="px-8 py-6">
                  <span className={`px-4 py-1.5 text-[9px] font-black rounded-full uppercase tracking-widest border shadow-sm flex items-center gap-2 w-fit ${
                    admin.role === "SUPER_ADMIN" 
                      ? "bg-purple-500/10 text-purple-400 border-purple-500/20" 
                      : admin.role === "APOIO"
                      ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                      : "bg-blue-500/10 text-blue-400 border-blue-500/20"
                  }`}>
                    {admin.role === "SUPER_ADMIN" ? <ShieldCheck className="w-3 h-3" /> : <Shield className="w-3 h-3" />}
                    {admin.role === "SUPER_ADMIN" ? "Super Admin" : admin.role === "APOIO" ? "Apoio / Portaria" : "Administrador"}
                  </span>
                </td>
                <td className="px-8 py-6 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button 
                      onClick={() => handleOpenEdit(admin)}
                      className="p-2.5 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white rounded-xl border border-white/5 transition-all"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    {(admin.role !== "SUPER_ADMIN" || superAdminsCount > 1) && (
                      <button 
                        onClick={() => handleDeleteAdmin(admin)}
                        className="p-2.5 bg-red-500/5 hover:bg-red-500/20 text-red-500/50 hover:text-red-500 rounded-xl border border-red-500/10 transition-all"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal Admin */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-[#020617]/95 backdrop-blur-xl z-[100] flex items-center justify-center p-4">
          <div className="bg-white/5 border border-white/10 rounded-[3rem] p-10 shadow-2xl w-full max-w-lg relative">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-blue-500" />
            
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-2xl font-black text-white uppercase tracking-tighter">
                {editingAdmin ? "Editar" : "Novo"} <span className="text-emerald-500">Admin</span>
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/10 text-gray-400 hover:text-white transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAdmin} className="space-y-6">
              <div className="space-y-5">
                <div>
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 block ml-1">Nome Completo</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl outline-none text-white focus:ring-2 focus:ring-emerald-500 transition-all"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 block ml-1">CPF</label>
                  <input
                    type="text"
                    required
                    value={formData.cpf}
                    onChange={(e) => setFormData({ ...formData, cpf: e.target.value.replace(/\D/g, "") })}
                    className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl outline-none text-white focus:ring-2 focus:ring-emerald-500 transition-all"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 block ml-1">
                    {editingAdmin ? "Nova Senha (opcional)" : "Senha Provisória"}
                  </label>
                  <input
                    type="password"
                    required={!editingAdmin}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl outline-none text-white focus:ring-2 focus:ring-emerald-500 transition-all"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 block ml-1">Cargo / Perfil</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl outline-none text-white text-xs font-black uppercase tracking-widest focus:ring-2 focus:ring-emerald-500 transition-all appearance-none cursor-pointer"
                  >
                    <option value="ADMIN" className="bg-[#020617]">Administrador Comum</option>
                    <option value="SUPER_ADMIN" className="bg-[#020617]">Super Administrador</option>
                    <option value="APOIO" className="bg-[#020617]">Apoio / Portaria (Apenas Check-in)</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-4 bg-white/5 hover:bg-white/10 text-gray-400 font-black rounded-2xl border border-white/10 transition-all uppercase tracking-widest text-[10px]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-2xl shadow-xl shadow-emerald-900/40 transition-all uppercase tracking-widest text-[10px]"
                >
                  {editingAdmin ? "Salvar Alterações" : "Criar Acesso"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
