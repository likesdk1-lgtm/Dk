import React from "react";
import { QRCodeSVG } from "qrcode.react";
import { formatCPF } from "@/lib/utils";
import { Activity, ShieldCheck } from "lucide-react";

// Local interface to avoid build issues if Prisma Client is not generated
interface Member {
  id: string;
  name: string;
  cpf: string;
  registrationNum: string;
  status: string;
  photoUrl?: string | null;
  institution?: string | null;
  birthDate?: string | Date | null;
}

interface MembershipCardProps {
  member: Member;
  unionName: string;
  initials?: string;
  logoUrl?: string | null;
  statusLabel?: string;
}

export const MembershipCard: React.FC<MembershipCardProps> = ({
  member,
  unionName,
  initials,
  statusLabel,
}) => {
  if (!member) {
    return (
      <div className="w-full max-w-[380px] aspect-[1.58] bg-[#0f172a] rounded-[2rem] shadow-2xl border border-white/10 flex flex-col items-center justify-center p-6 text-white/40">
        <Activity className="w-12 h-12 mb-4 opacity-20 animate-pulse" />
        <p className="text-[10px] font-black uppercase tracking-[0.4em]">Sincronizando Dados...</p>
      </div>
    );
  }

  const qrData = member.registrationNum || "N/A";

  return (
    <div className="w-full max-w-full aspect-[1.58] bg-[#0f172a] rounded-[1.5rem] sm:rounded-[2rem] shadow-2xl border border-white/10 overflow-hidden flex flex-col p-[5%] relative font-sans text-white group">
      {/* Futuristic Background Elements */}
      <div className="absolute top-0 right-0 w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[30px] sm:blur-[40px] -translate-y-1/2 translate-x-1/2 group-hover:bg-blue-600/20 transition-all duration-700" />
      <div className="absolute bottom-0 left-0 w-[30%] h-[30%] bg-indigo-600/10 rounded-full blur-[20px] sm:blur-[30px] translate-y-1/2 -translate-x-1/2" />
      
      {/* Header */}
      <div className="flex justify-between items-start mb-[3%] relative z-10">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-600 to-blue-400 rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:rotate-12 transition-all duration-500">
            <Activity className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
          </div>
          <div className="flex flex-col">
            <h1 className="text-[10px] sm:text-[12px] font-black uppercase tracking-tighter leading-none mb-0.5 sm:mb-1">
              {initials || unionName}
            </h1>
            <p className="text-[6px] sm:text-[7px] text-blue-400 font-black uppercase tracking-[0.2em] sm:tracking-[0.3em]">
              EMISSÃO DIGITAL
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-0.5 sm:py-1 bg-white/5 border border-white/10 rounded-full">
          <div className={`w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full ${member.status === "ACTIVE" ? "bg-emerald-500 animate-pulse" : "bg-rose-500"}`} />
          <span className="text-[5px] sm:text-[6px] font-black uppercase tracking-widest text-white/60">
            {statusLabel || (member.status === "ACTIVE" ? "CONECTADO" : "OFFLINE")}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="flex gap-[4%] sm:gap-[6%] relative z-10 flex-1 overflow-hidden">
        {/* Photo */}
        <div className="flex flex-col items-center gap-2 w-[28%]">
          <div className="w-full aspect-[0.85] bg-white/5 border border-white/10 rounded-lg sm:rounded-xl overflow-hidden shadow-2xl group-hover:border-blue-500/30 transition-all duration-500">
            {member.photoUrl ? (
              <img
                src={member.photoUrl}
                alt={member.name}
                crossOrigin="anonymous"
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center bg-blue-600/10 text-blue-400">
                <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6 opacity-20" />
              </div>
            )}
          </div>
        </div>

        {/* Info */}
        <div className="flex-1 flex flex-col justify-start py-0.5 sm:py-1 min-w-0">
          <div className="space-y-[3%]">
            <div className="min-w-0">
              <p className="text-[5px] sm:text-[6px] text-blue-400/40 uppercase font-black tracking-[0.2em] sm:tracking-[0.3em] mb-0.5 sm:mb-1">Associado</p>
              <p className="text-[9px] sm:text-[11px] font-black text-white uppercase tracking-tight truncate leading-none">
                {member.name}
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              <div className="min-w-0">
                <p className="text-[5px] sm:text-[6px] text-blue-400/40 uppercase font-black tracking-[0.2em] sm:tracking-[0.3em] mb-0.5 sm:mb-1">CPF</p>
                <p className="text-[8px] sm:text-[10px] font-black text-white leading-none tabular-nums truncate">{formatCPF(member.cpf)}</p>
              </div>
              <div className="min-w-0">
                <p className="text-[5px] sm:text-[6px] text-blue-400/40 uppercase font-black tracking-[0.2em] sm:tracking-[0.3em] mb-0.5 sm:mb-1">Nascimento</p>
                <p className="text-[8px] sm:text-[10px] font-black text-white leading-none tabular-nums truncate">
                  {member.birthDate ? new Date(member.birthDate).toLocaleDateString("pt-BR") : "N/A"}
                </p>
              </div>
            </div>

            <div className="min-w-0">
              <p className="text-[5px] sm:text-[6px] text-blue-400/40 uppercase font-black tracking-[0.2em] sm:tracking-[0.3em] mb-0.5 sm:mb-1">Instituição</p>
              <p className="text-[8px] sm:text-[10px] font-black text-white/70 uppercase tracking-tight truncate leading-none">
                {member.institution || "NÃO INFORMADO"}
              </p>
            </div>
            
            <div className="min-w-0">
              <p className="text-[5px] sm:text-[6px] text-blue-400/40 uppercase font-black tracking-[0.2em] sm:tracking-[0.3em] mb-0.5 sm:mb-1">Matrícula</p>
              <p className="text-[8px] sm:text-[10px] font-black text-white tracking-widest leading-none truncate">{member.registrationNum}</p>
            </div>
          </div>
        </div>
      </div>

      {/* QR Code - Absolute Positioned to prevent cutting */}
      <div className="absolute bottom-[15%] right-[8%] z-20">
        <div className="p-1.5 bg-white rounded-lg sm:rounded-xl shadow-xl group-hover:scale-105 transition-transform duration-500 border border-white/10">
          <QRCodeSVG 
            value={qrData} 
            size={80} 
            className="w-14 h-14 sm:w-18 sm:h-18"
            level="M"
            includeMargin={false}
          />
        </div>
      </div>
    </div>
  );
};
