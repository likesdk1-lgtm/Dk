"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { 
  FileText, 
  Upload, 
  Trash2, 
  Eye, 
  Search, 
  Filter,
  Activity,
  Clock,
  ChevronRight,
  Plus
} from "lucide-react";
import { format } from "date-fns";

export default function AdminDocumentsPage() {
  const [documents, setDocuments] = useState<any[]>([]);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      const response = await axios.get("/api/admin/documents");
      setDocuments(response.data);
      setLoading(false);
    } catch (err) {
      console.error("Erro ao carregar documentos", err);
    }
  };

  const [formData, setFormData] = useState({
    title: "",
    isAdminOnly: false,
    memberId: "",
  });
  const [file, setFile] = useState<File | null>(null);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    const data = new FormData();
    data.append("file", file);
    data.append("title", formData.title);
    data.append("isAdminOnly", String(formData.isAdminOnly));
    data.append("memberId", formData.memberId);

    try {
      await axios.post("/api/admin/documents", data);
      setIsUploadOpen(false);
      setFormData({ title: "", isAdminOnly: false, memberId: "" });
      setFile(null);
      fetchDocuments();
    } catch (err) {
      console.error("Erro ao fazer upload", err);
    }
  };

  return (
    <div className="p-8 space-y-10">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black text-blue-950 uppercase tracking-tighter">Documentos</h1>
          <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mt-1">Gestão de arquivos e documentos do sindicato</p>
        </div>
        <button
          onClick={() => setIsUploadOpen(true)}
          className="px-8 py-4 bg-blue-700 hover:bg-blue-800 text-white font-black rounded-2xl shadow-xl shadow-blue-200 transition-all uppercase tracking-widest text-[10px] flex items-center gap-2 group"
        >
          <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform duration-300" />
          Novo Documento
        </button>
      </header>

      {/* Search & Filter */}
      <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-xl shadow-gray-100/50 flex flex-col md:flex-row gap-6">
        <div className="flex-1 relative">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="BUSCAR DOCUMENTO PELO TÍTULO..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-14 pr-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 transition-all text-[10px] font-black uppercase tracking-widest text-blue-950"
          />
        </div>
        <div className="flex gap-4">
          <button className="px-6 py-4 bg-white border border-gray-100 rounded-2xl text-[10px] font-black uppercase tracking-widest text-gray-400 flex items-center gap-2 hover:bg-gray-50 transition-all">
            <Filter className="w-4 h-4" />
            Filtrar
          </button>
        </div>
      </div>

      {/* Documents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {documents.filter(doc => doc.title.toLowerCase().includes(search.toLowerCase())).map((doc) => (
          <div key={doc.id} className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-xl shadow-gray-100/50 hover:shadow-blue-100 transition-all group relative overflow-hidden">
            {/* Background Icon */}
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-blue-50/30 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <Activity className="w-12 h-12 text-blue-100" />
            </div>

            <div className="relative z-10">
              <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 mb-6 group-hover:scale-110 transition-transform">
                <FileText className="w-8 h-8" />
              </div>
              <h3 className="text-sm font-black text-blue-950 uppercase tracking-tight mb-2 truncate group-hover:text-blue-700 transition-colors">
                {doc.title}
              </h3>
              <div className="flex items-center gap-4 mb-6">
                <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {format(new Date(doc.createdAt), "dd/MM/yyyy")}
                </span>
                <span className={`px-2 py-0.5 rounded-full text-[7px] font-black uppercase tracking-[0.2em] ${
                  doc.isAdminOnly ? "bg-red-50 text-red-600" : "bg-green-50 text-green-600"
                }`}>
                  {doc.isAdminOnly ? "Restrito" : "Público"}
                </span>
              </div>
              
              <div className="flex gap-3">
                <a
                  href={doc.fileUrl}
                  target="_blank"
                  className="flex-1 py-3 bg-blue-50 hover:bg-blue-100 text-blue-700 font-black rounded-xl transition-all text-[9px] uppercase tracking-widest text-center"
                >
                  Visualizar
                </a>
                <button className="w-10 h-10 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl flex items-center justify-center transition-all group-hover:rotate-12">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Upload Modal */}
      {isUploadOpen && (
        <div className="fixed inset-0 bg-blue-950/40 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[3rem] p-10 shadow-2xl w-full max-w-xl relative animate-in fade-in zoom-in duration-300">
            <h3 className="text-3xl font-black text-blue-950 uppercase tracking-tighter mb-8">Novo Documento</h3>
            <form onSubmit={handleUpload} className="space-y-8">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Título do Documento</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 transition-all text-xs font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Visibilidade</label>
                  <select
                    value={String(formData.isAdminOnly)}
                    onChange={(e) => setFormData({ ...formData, isAdminOnly: e.target.value === "true" })}
                    className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none text-[10px] font-black uppercase tracking-widest"
                  >
                    <option value="false">Público (Portal Associado)</option>
                    <option value="true">Restrito (Administradores)</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Associar a Membro (Opcional)</label>
                  <input
                    type="text"
                    placeholder="CPF OU MATRÍCULA..."
                    value={formData.memberId}
                    onChange={(e) => setFormData({ ...formData, memberId: e.target.value })}
                    className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none text-[10px] font-black uppercase tracking-widest"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Arquivo (PDF/JPG)</label>
                <div className="relative h-40 border-4 border-dashed border-gray-100 rounded-[2rem] group hover:border-blue-200 transition-colors">
                  <input
                    type="file"
                    required
                    accept=".pdf,image/*"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                    className="absolute inset-0 opacity-0 cursor-pointer z-10"
                  />
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                    <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
                      <Upload className="w-6 h-6" />
                    </div>
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest group-hover:text-blue-600 transition-colors">
                      {file ? file.name : "CLIQUE OU ARRASTE PARA FAZER UPLOAD"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex gap-6 pt-6">
                <button
                  type="button"
                  onClick={() => setIsUploadOpen(false)}
                  className="flex-1 py-5 bg-gray-100 hover:bg-gray-200 text-gray-600 font-black rounded-2xl uppercase tracking-widest text-[10px] transition-all"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-5 bg-blue-700 hover:bg-blue-800 text-white font-black rounded-2xl uppercase tracking-widest text-[10px] shadow-2xl shadow-blue-200 transition-all"
                >
                  Confirmar Upload
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
