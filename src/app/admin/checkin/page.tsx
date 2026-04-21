"use client";

import React, { Suspense, useState, useEffect } from "react";
import axios from "axios";
import { Scanner } from "@yudiel/react-qr-scanner";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { 
  ShieldCheck, 
  User, 
  CheckCircle2, 
  XCircle, 
  RefreshCw, 
  ArrowLeft,
  Camera,
  Activity,
  AlertCircle,
  Calendar
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

interface ValidationResult {
  success: boolean;
  member: {
    id: string;
    name: string;
    cpf: string;
    registrationNum: string;
    status: string;
    photoUrl?: string | null;
  };
  isValid: boolean;
  timestamp: string;
}

function CheckinValidatorInner() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const eventId = searchParams.get("eventId");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ValidationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(true);
  const [eventName, setEventName] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);

  useEffect(() => {
    if (eventId) {
      fetchEventInfo();
    }

    // Verificar se o contexto é seguro (HTTPS ou localhost)
    if (typeof window !== "undefined" && !window.isSecureContext && window.location.hostname !== "localhost") {
      setCameraError("O acesso à câmera requer uma conexão segura (HTTPS).");
      setIsScanning(false);
    }
  }, [eventId]);

  const fetchEventInfo = async () => {
    try {
      const response = await axios.get("/api/admin/events");
      const event = response.data.find((e: any) => e.id === eventId);
      if (event) setEventName(event.title);
    } catch (err) {
      console.error("Erro ao buscar info do evento");
    }
  };

  const handleCameraError = (err: any) => {
    console.error("Erro na câmera:", err);
    if (err?.name === "NotAllowedError" || err?.name === "PermissionDeniedError") {
      setCameraError("Permissão de câmera negada. Por favor, habilite o acesso nas configurações do seu navegador.");
    } else if (err?.name === "NotFoundError" || err?.name === "DevicesNotFoundError") {
      setCameraError("Nenhuma câmera detectada neste dispositivo.");
    } else {
      setCameraError("Ocorreu um erro ao tentar acessar a câmera.");
    }
    setIsScanning(false);
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (status === "unauthenticated") {
    router.push("/login");
    return null;
  }

  // Se desejar restringir apenas para ADMINS, adicione este bloco:
  /*
  if (session?.user?.role !== "ADMIN" && session?.user?.role !== "SUPER_ADMIN") {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center p-6 text-center">
        <div className="max-w-md space-y-6">
          <div className="w-20 h-20 bg-red-500/10 rounded-3xl flex items-center justify-center text-red-500 mx-auto border border-red-500/20">
            <XCircle className="w-12 h-12" />
          </div>
          <h1 className="text-3xl font-black text-white uppercase tracking-tighter">Acesso Restrito</h1>
          <p className="text-gray-500 text-sm font-bold uppercase tracking-widest leading-relaxed">
            Apenas administradores podem utilizar este validador de check-in.
          </p>
          <button 
            onClick={() => router.push("/portal/dashboard")}
            className="px-8 py-4 bg-white/5 hover:bg-white/10 text-white font-black rounded-2xl border border-white/10 transition-all uppercase tracking-widest text-[10px]"
          >
            Voltar ao Dashboard
          </button>
        </div>
      </div>
    );
  }
  */

  const handleScan = async (detectedCodes: any[]) => {
    if (detectedCodes.length === 0 || !isScanning || loading) return;

    const qrData = detectedCodes[0].rawValue;
    setLoading(true);
    setIsScanning(false);
    setError(null);

    try {
      const apiUrl = eventId ? "/api/admin/events/checkin" : "/api/admin/checkin";
      const response = await axios.post(apiUrl, { qrData, eventId });
      setResult(response.data);
    } catch (err: any) {
      console.error("Erro ao validar check-in:", err);
      setError(err.response?.data?.error || "Falha ao validar o QR Code. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const resetScanner = () => {
    setResult(null);
    setError(null);
    setCameraError(null);
    setIsScanning(true);
  };

  return (
    <div className="min-h-screen bg-[#020617] text-white p-6 font-sans">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-12">
          <div className="flex items-center gap-4">
            <Link 
              href="/admin/dashboard"
              className="p-3 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 transition-all text-gray-400 hover:text-white"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-3xl font-black uppercase tracking-tighter">
                Validador de <span className="text-emerald-500">Check-in</span>
              </h1>
              {eventName ? (
                <div className="flex items-center gap-2 mt-1">
                  <Calendar className="w-3 h-3 text-emerald-500" />
                  <p className="text-emerald-500 text-[10px] font-black uppercase tracking-[0.3em]">{eventName}</p>
                </div>
              ) : (
                <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.3em] mt-1">Controle de Acesso • Elite</p>
              )}
            </div>
          </div>
          <div className={`w-3 h-3 rounded-full ${isScanning ? "bg-emerald-500 animate-pulse" : "bg-red-500"} shadow-[0_0_15px_rgba(16,185,129,0.3)]`} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          {/* Scanner Section */}
          <div className="space-y-6">
            <div className="relative aspect-square bg-black/40 rounded-[2.5rem] border border-white/10 overflow-hidden shadow-2xl group">
              {isScanning ? (
                <div className="absolute inset-0 z-10">
                  <Scanner
                    onScan={handleScan}
                    onError={handleCameraError}
                    constraints={{
                      facingMode: "environment"
                    }}
                    styles={{
                      container: { width: "100%", height: "100%" }
                    }}
                  />
                  {/* Scanner Overlay */}
                  <div className="absolute inset-0 pointer-events-none border-[40px] border-black/60">
                    <div className="w-full h-full border-2 border-emerald-500/50 rounded-2xl relative">
                      <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-emerald-500 rounded-tl-lg" />
                      <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-emerald-500 rounded-tr-lg" />
                      <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-emerald-500 rounded-bl-lg" />
                      <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-emerald-500 rounded-br-lg" />
                      
                      {/* Scanning Line Animation */}
                      <motion.div 
                        animate={{ top: ["0%", "100%", "0%"] }}
                        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                        className="absolute left-0 right-0 h-0.5 bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.8)] z-20"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm space-y-4 p-8 text-center">
                  {cameraError ? (
                    <>
                      <div className="w-20 h-20 bg-red-500/10 rounded-3xl flex items-center justify-center border border-red-500/20 text-red-500 mb-2">
                        <AlertCircle className="w-10 h-10" />
                      </div>
                      <h3 className="text-sm font-black uppercase text-red-500">Erro de Câmera</h3>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-relaxed">
                        {cameraError}
                      </p>
                      <button 
                        onClick={resetScanner}
                        className="mt-4 px-6 py-3 bg-white/5 hover:bg-white/10 text-white text-[9px] font-black rounded-xl border border-white/10 transition-all uppercase tracking-widest"
                      >
                        Tentar Novamente
                      </button>
                    </>
                  ) : (
                    <>
                      <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center border border-white/10">
                        <Camera className="w-10 h-10 text-gray-600" />
                      </div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">Scanner em pausa</p>
                      <button 
                        onClick={resetScanner}
                        className="mt-4 px-8 py-4 bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-black rounded-2xl shadow-xl shadow-emerald-900/20 transition-all uppercase tracking-widest flex items-center gap-2"
                      >
                        <Camera className="w-4 h-4" /> Ativar Câmera
                      </button>
                    </>
                  )}
                </div>
              )}
              
              {loading && (
                <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-[#020617]/80 backdrop-blur-md">
                  <div className="w-16 h-16 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
                  <p className="mt-4 text-[10px] font-black uppercase tracking-[0.3em] text-emerald-500">Validando...</p>
                </div>
              )}
            </div>

            <button 
              onClick={resetScanner}
              disabled={isScanning && !result && !error}
              className="w-full py-5 bg-white/5 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed text-white font-black rounded-2xl border border-white/10 transition-all uppercase tracking-widest text-[10px] flex items-center justify-center gap-3"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} /> Reiniciar Scanner
            </button>
          </div>

          {/* Results Section */}
          <div className="space-y-6">
            <AnimatePresence mode="wait">
              {result ? (
                <motion.div
                  key="result"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className={`p-8 rounded-[2.5rem] border ${result.isValid ? "bg-emerald-500/5 border-emerald-500/20" : "bg-red-500/5 border-red-500/20"} shadow-2xl relative overflow-hidden`}
                >
                  {/* Status Indicator */}
                  <div className={`absolute top-0 right-0 px-6 py-2 rounded-bl-2xl text-[10px] font-black uppercase tracking-widest ${result.isValid ? "bg-emerald-500 text-white" : "bg-red-500 text-white"}`}>
                    {result.isValid ? "Acesso Liberado" : "Acesso Negado"}
                  </div>

                  <div className="flex flex-col items-center text-center space-y-6">
                    <div className="relative">
                      <div className={`w-32 h-32 rounded-[2rem] overflow-hidden border-4 ${result.isValid ? "border-emerald-500/50" : "border-red-500/50"} shadow-2xl`}>
                        {result.member.photoUrl ? (
                          <img src={result.member.photoUrl} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full bg-white/5 flex items-center justify-center">
                            <User className="w-12 h-12 text-gray-700" />
                          </div>
                        )}
                      </div>
                      <div className={`absolute -bottom-2 -right-2 w-10 h-10 rounded-xl flex items-center justify-center shadow-lg ${result.isValid ? "bg-emerald-500" : "bg-red-500"}`}>
                        {result.isValid ? <CheckCircle2 className="w-6 h-6 text-white" /> : <XCircle className="w-6 h-6 text-white" />}
                      </div>
                    </div>

                    <div>
                      <h2 className="text-2xl font-black uppercase tracking-tighter mb-1">{result.member.name}</h2>
                      <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Matrícula: {result.member.registrationNum}</p>
                    </div>

                    <div className="w-full grid grid-cols-2 gap-4">
                      <div className="bg-white/5 p-4 rounded-2xl border border-white/5 text-left">
                        <p className="text-[8px] font-black text-gray-500 uppercase tracking-widest mb-1">Status</p>
                        <p className={`text-xs font-black uppercase ${result.isValid ? "text-emerald-500" : "text-red-500"}`}>
                          {result.member.status === "ACTIVE" ? "Ativo" : "Inativo"}
                        </p>
                      </div>
                      <div className="bg-white/5 p-4 rounded-2xl border border-white/5 text-left">
                        <p className="text-[8px] font-black text-gray-500 uppercase tracking-widest mb-1">Horário</p>
                        <p className="text-xs font-black text-white uppercase">
                          {new Date(result.timestamp).toLocaleTimeString("pt-BR")}
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ) : error ? (
                <motion.div
                  key="error"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-8 rounded-[2.5rem] bg-red-500/5 border border-red-500/20 shadow-2xl flex flex-col items-center text-center space-y-4"
                >
                  <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center text-red-500">
                    <XCircle className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-black uppercase tracking-tighter text-red-500">Erro de Validação</h3>
                  <p className="text-xs text-gray-400 font-bold uppercase tracking-wide leading-relaxed">{error}</p>
                </motion.div>
              ) : (
                <motion.div
                  key="idle"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="p-12 rounded-[2.5rem] bg-white/5 border border-white/10 border-dashed flex flex-col items-center text-center space-y-6 opacity-40"
                >
                  <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center">
                    <Activity className="w-10 h-10 text-gray-600 animate-pulse" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-lg font-black uppercase tracking-widest">Aguardando Leitura</h3>
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em]">Posicione o QR Code em frente à câmera</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Stats/Info Widget */}
            <div className="p-6 bg-gradient-to-br from-blue-600/10 to-emerald-600/10 rounded-[2rem] border border-white/10">
              <div className="flex items-center gap-3 mb-4">
                <ShieldCheck className="w-5 h-5 text-blue-500" />
                <h4 className="text-xs font-black uppercase tracking-widest">Segurança Ativa</h4>
              </div>
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider leading-relaxed">
                Este terminal está validando dados em tempo real com a base do sindicato. Acessos inativos serão bloqueados automaticamente.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CheckinValidatorPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#020617] flex items-center justify-center text-white">Carregando...</div>}>
      <CheckinValidatorInner />
    </Suspense>
  );
}
