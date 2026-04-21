"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { format } from "date-fns";

// Local interfaces to avoid Prisma build issues
interface Log {
  id: string;
  action: string;
  details: string;
  ipAddress?: string | null;
  createdAt: string;
  type: "ADMIN" | "MEMBER";
  userName: string;
  userPhoto?: string | null;
}

export default function SecurityLogsPage() {
  const [logs, setLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const response = await axios.get("/api/admin/logs");
      setLogs(response.data);
      setLoading(false);
    } catch (err) {
      console.error("Erro ao carregar logs", err);
      setLoading(false);
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
    <div className="container mx-auto p-6 font-sans bg-[#020617] min-h-screen text-white">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-black text-white uppercase tracking-tight">
            Logs de Segurança
          </h1>
          <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mt-1">
            Auditoria completa de todas as ações realizadas no sistema
          </p>
        </div>
      </div>

      <div className="bg-slate-900/40 backdrop-blur-3xl rounded-[2rem] border border-white/10 overflow-hidden shadow-2xl">
        <table className="w-full text-left">
          <thead className="bg-white/5 border-b border-white/5">
            <tr>
              <th className="px-6 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest">
                Data / Hora
              </th>
              <th className="px-6 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest">
                Usuário / Origem
              </th>
              <th className="px-6 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest">
                Ação Realizada
              </th>
              <th className="px-6 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest">
                Detalhes
              </th>
              <th className="px-6 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest text-right">
                IP Address
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {logs.map((log) => (
              <tr key={log.id} className="hover:bg-white/[0.02] transition-colors group">
                <td className="px-6 py-4">
                  <span className="text-xs font-bold text-gray-400">
                    {format(new Date(log.createdAt), "dd/MM/yyyy HH:mm:ss")}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center border overflow-hidden ${
                      log.type === "ADMIN" 
                        ? "bg-blue-500/10 border-blue-500/20 text-blue-400" 
                        : "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                    }`}>
                      {log.userPhoto ? (
                        <img src={log.userPhoto} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-[10px] font-black">
                          {log.userName.substring(0, 1).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div>
                      <p className="text-xs font-black text-white uppercase tracking-tight">
                        {log.userName}
                      </p>
                      <p className={`text-[8px] font-black uppercase tracking-widest ${
                        log.type === "ADMIN" ? "text-blue-500" : "text-emerald-500"
                      }`}>
                        {log.type === "ADMIN" ? "Administrador" : "Associado"}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 text-[8px] font-black rounded uppercase tracking-widest border ${
                    log.action === "LOGIN" 
                      ? "bg-blue-500/10 text-blue-400 border-blue-500/10" 
                      : "bg-orange-500/10 text-orange-400 border-orange-500/10"
                  }`}>
                    {log.action}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <p className="text-xs text-gray-400 font-medium truncate max-w-xs group-hover:text-white transition-colors">
                    {log.details}
                  </p>
                </td>
                <td className="px-6 py-4 text-right">
                  <span className="text-[10px] font-bold text-gray-600 font-mono">
                    {log.ipAddress || "0.0.0.0"}
                  </span>
                </td>
              </tr>
            ))}
            {logs.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-20 text-center text-gray-600 font-black uppercase tracking-[0.3em] text-xs">
                  Nenhum log registrado até o momento
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
