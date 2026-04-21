"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useRouter } from "next/navigation";
import { 
  Building2, 
  ArrowLeft, 
  FileText, 
  Users, 
  Calendar,
  ChevronRight,
  Printer,
  ShieldCheck,
  MapPin,
  Phone,
  Mail
} from "lucide-react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function PartnerDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [partner, setPartner] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPartnerDetails();
  }, [id]);

  const fetchPartnerDetails = async () => {
    try {
      const response = await axios.get(`/api/admin/benefits/partners/${id}`);
      setPartner(response.data);
    } catch (err) {
      console.error("Erro ao carregar detalhes do parceiro", err);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!partner) return null;

  return (
    <div className="p-8 space-y-10 bg-[#020617] min-h-screen text-white font-sans">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 print:hidden">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => router.back()}
            className="p-3 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 transition-all text-gray-400 hover:text-white"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-4xl font-black text-white uppercase tracking-tighter">
              Relatório de <span className="text-blue-500">Uso</span>
            </h1>
            <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mt-1">{partner.name} • Sindicato Digital</p>
          </div>
        </div>
        
        <button
          onClick={handlePrint}
          className="px-6 py-4 bg-white/5 hover:bg-white/10 text-white font-black rounded-2xl border border-white/10 transition-all uppercase tracking-widest text-[10px] flex items-center gap-2"
        >
          <Printer className="w-4 h-4 text-blue-500" />
          Imprimir Relatório
        </button>
      </header>

      <div id="printable-report" className="space-y-8">
        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 print:grid-cols-3">
          <div className="bg-white/5 p-8 rounded-[2.5rem] border border-white/10 print:bg-white print:border-gray-200">
            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 print:text-gray-500">Documento</p>
            <h3 className="text-2xl font-black text-white print:text-black">{partner.document}</h3>
          </div>
          <div className="bg-white/5 p-8 rounded-[2.5rem] border border-white/10 print:bg-white print:border-gray-200">
            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 print:text-gray-500">Total de Usos</p>
            <h3 className="text-2xl font-black text-white print:text-black">{partner.usages?.length || 0}</h3>
          </div>
          <div className="bg-white/5 p-8 rounded-[2.5rem] border border-white/10 print:bg-white print:border-gray-200">
            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 print:text-gray-500">Status Parceiro</p>
            <span className={`px-4 py-1.5 text-[10px] font-black rounded-full uppercase tracking-widest border ${
              partner.status === "ACTIVE" ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-red-500/10 text-red-500 border-red-500/20"
            } print:text-black print:border-gray-200`}>
              {partner.status === "ACTIVE" ? "Ativo" : "Inativo"}
            </span>
          </div>
        </div>

        {/* Usage Table */}
        <section className="space-y-6">
          <div className="flex items-center gap-3 print:mb-8">
            <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-500 print:hidden">
              <FileText className="w-5 h-5" />
            </div>
            <h2 className="text-2xl font-black uppercase tracking-tighter print:text-black">Histórico Detalhado</h2>
          </div>

          <div className="bg-white/5 rounded-[2.5rem] border border-white/10 overflow-hidden shadow-2xl print:bg-white print:border-none print:shadow-none">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-white/5 border-b border-white/5 print:bg-gray-50 print:border-gray-200">
                  <th className="px-8 py-6 text-[10px] font-black text-blue-500 uppercase tracking-widest print:text-gray-600">Associado</th>
                  <th className="px-8 py-6 text-[10px] font-black text-blue-500 uppercase tracking-widest print:text-gray-600">Benefício</th>
                  <th className="px-8 py-6 text-[10px] font-black text-blue-500 uppercase tracking-widest print:text-gray-600">Data / Hora</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 print:divide-gray-100">
                {partner.usages?.map((usage: any) => (
                  <tr key={usage.id} className="hover:bg-white/[0.02] transition-colors print:bg-white">
                    <td className="px-8 py-6">
                      <div>
                        <p className="text-sm font-black text-white uppercase tracking-tight print:text-black">{usage.member.name}</p>
                        <p className="text-[8px] font-black text-gray-500 uppercase tracking-widest print:text-gray-400">Matrícula: {usage.member.registrationNum}</p>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className="text-xs font-black text-gray-400 uppercase tracking-widest print:text-gray-600">{usage.benefit.title}</span>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex flex-col items-start gap-1">
                        <span className="text-[10px] font-black text-white uppercase tracking-widest print:text-black">{format(new Date(usage.usedAt), "dd/MM/yyyy")}</span>
                        <span className="text-[8px] font-black text-gray-600 uppercase print:text-gray-400">{format(new Date(usage.usedAt), "HH:mm:ss")}</span>
                      </div>
                    </td>
                  </tr>
                ))}
                {partner.usages?.length === 0 && (
                  <tr>
                    <td colSpan={3} className="px-8 py-20 text-center">
                      <p className="text-[10px] font-black text-gray-600 uppercase tracking-[0.3em]">Nenhum uso registrado para este parceiro</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}
