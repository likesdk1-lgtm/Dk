import React, { useState } from "react";
import {
  LayoutDashboard,
  Users,
  Wallet,
  Receipt,
  Settings,
  ShieldCheck,
  LogOut,
  Newspaper,
  HeartHandshake,
  Briefcase as Tooth,
  Menu,
  X,
  ChevronRight,
  MessageSquare,
  Activity,
  Calendar,
  Package,
  LifeBuoy
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";

const menuItems = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/admin/dashboard" },
  { label: "Associados", icon: Users, href: "/admin/members" },
  { label: "Check-in", icon: Activity, href: "/admin/checkin" },
  { label: "Eventos", icon: Calendar, href: "/admin/events" },
  { label: "Financeiro", icon: Wallet, href: "/admin/finance" },
  { label: "Cobranças", icon: Receipt, href: "/admin/billing" },
  { label: "WhatsApp", icon: MessageSquare, href: "/admin/whatsapp" },
  { label: "Benefícios", icon: HeartHandshake, href: "/admin/benefits" },
  { label: "Plano", icon: Package, href: "/admin/plan" },
  { label: "Configurações", icon: Settings, href: "/admin/settings" },
  { label: "Suporte", icon: LifeBuoy, href: "/admin/support" },
];

export const AdminSidebar = () => {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);

  const filteredMenuItems = menuItems.filter(item => {
    const userRole = (session?.user as any)?.role?.toUpperCase();
    
    // Se for Apoio, só vê Check-in
    if (userRole === "APOIO") {
      return item.label === "Check-in";
    }
    
    // Administradores e Super Admins veem tudo
    if (userRole === "ADMIN" || userRole === "SUPER_ADMIN") {
      return true;
    }

    // Por segurança, se não for um dos cargos acima (ou se for MEMBER/PARTNER), não mostra nada
    return false;
  });

  return (
    <>
      {/* Mobile Toggle Button */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-20 bg-[#020617]/80 backdrop-blur-xl border-b border-white/5 z-[80] px-6 flex items-center justify-between shadow-2xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-emerald-600 to-blue-600 rounded-xl flex items-center justify-center text-white">
            <Tooth className="w-6 h-6" />
          </div>
          <span className="font-black text-white uppercase tracking-tighter">
            {(session?.user as any)?.tenantInitials || "Dk Sind"}
          </span>
        </div>
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="p-3 bg-white/5 text-emerald-500 rounded-xl hover:bg-white/10 transition-all border border-white/10"
        >
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="md:hidden fixed inset-0 bg-black/80 backdrop-blur-md z-[60]"
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>

      <div className={`w-72 h-screen bg-[#020617] text-white flex flex-col fixed left-0 top-0 z-[70] border-r border-white/5 backdrop-blur-3xl transition-all duration-500 ease-in-out md:translate-x-0 print:hidden ${isOpen ? "translate-x-0 shadow-2xl shadow-emerald-500/10" : "-translate-x-full"}`}>
        <div className="p-10 hidden md:flex items-center gap-5 border-b border-white/5">
          <motion.div 
            whileHover={{ rotate: 12, scale: 1.1 }}
            className="w-14 h-14 bg-gradient-to-br from-emerald-600 to-blue-600 rounded-2xl flex items-center justify-center shadow-xl shadow-emerald-500/10 border border-white/10 overflow-hidden"
          >
            {(session?.user as any)?.photoUrl ? (
              <img src={(session?.user as any).photoUrl} className="w-full h-full object-cover" />
            ) : (
              <Tooth className="w-8 h-8 text-white" />
            )}
          </motion.div>
          <div className="flex flex-col">
            <span className="text-2xl font-black uppercase tracking-tighter leading-none">
              {(session?.user as any)?.tenantInitials || "Dk Sind"}
            </span>
            <span className="text-[9px] font-black text-emerald-400 uppercase tracking-[0.3em] mt-1">
              {(session?.user as any)?.tenantName || "Dk Sind Elite"}
            </span>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto py-10 px-6 space-y-2 scrollbar-hide">
          {filteredMenuItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={`flex items-center justify-between px-5 py-4 rounded-2xl transition-all duration-300 group relative overflow-hidden ${
                  isActive 
                    ? "bg-emerald-600 text-white shadow-xl shadow-emerald-600/20" 
                    : "text-gray-500 hover:bg-white/5 hover:text-white"
                }`}
              >
                <div className="flex items-center gap-4 relative z-10">
                  <item.icon className={`w-5 h-5 transition-transform duration-300 group-hover:scale-110 ${isActive ? "text-white" : "group-hover:text-emerald-400"}`} />
                  <span className="text-[10px] font-black uppercase tracking-[0.2em]">{item.label}</span>
                </div>
                {isActive && (
                  <motion.div 
                    layoutId="active-pill"
                    className="relative z-10"
                  >
                    <ChevronRight className="w-4 h-4 text-white/50" />
                  </motion.div>
                )}
                {!isActive && (
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/0 via-emerald-500/5 to-emerald-500/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="p-8 border-t border-white/5 space-y-4">
          {session?.user && (session.user as any).role !== "MEMBER" && (
            <div className="px-5 py-3 bg-white/5 rounded-2xl border border-white/5 flex items-center gap-4 group">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500 border border-emerald-500/20 group-hover:scale-110 transition-transform">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-[10px] font-black text-white uppercase tracking-widest truncate">
                  {session.user.name || "Administrador"}
                </span>
                <span className="text-[8px] font-bold text-emerald-500/60 uppercase tracking-[0.2em]">
                  Painel de Controle
                </span>
              </div>
            </div>
          )}
          
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="w-full flex items-center justify-between px-5 py-4 text-red-400/60 hover:text-red-500 bg-white/5 hover:bg-red-500/10 rounded-2xl transition-all group"
          >
            <div className="flex items-center gap-4">
              <LogOut className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em]">Encerrar Sessão</span>
            </div>
            <X className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>
          <div className="mt-8 text-center">
            <p className="text-[8px] font-black text-gray-700 uppercase tracking-[0.5em]">Desenvolvido por Dk Code</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminSidebar;
