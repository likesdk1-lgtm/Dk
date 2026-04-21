import React from "react";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Blocks, CreditCard, LayoutDashboard, LifeBuoy, Package, Settings, TrendingUp, BarChart3, Shield } from "lucide-react";

export default async function SaasLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "SUPER_ADMIN") {
    redirect("/admin/login");
  }

  return (
    <div className="min-h-screen bg-[#020617] text-white font-sans">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(59,130,246,0.16),transparent_40%),radial-gradient(circle_at_80%_20%,rgba(16,185,129,0.14),transparent_45%),radial-gradient(circle_at_50%_80%,rgba(168,85,247,0.12),transparent_55%)]" />
        <div className="absolute inset-0 opacity-[0.06] [background-image:linear-gradient(to_right,rgba(255,255,255,0.6)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.6)_1px,transparent_1px)] [background-size:64px_64px]" />
      </div>

      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#020617]/70 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <a href="/saas/dashboard" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-blue-500 to-emerald-500 shadow-xl shadow-blue-500/10" />
            <div className="leading-tight">
              <div className="font-black tracking-tight">Portal SaaS</div>
              <div className="text-[10px] font-bold tracking-[0.22em] text-white/50 uppercase">Super Admin</div>
            </div>
          </a>

          <nav className="hidden md:flex items-center gap-6 text-sm text-white/70">
            <a className="hover:text-white transition-colors flex items-center gap-2" href="/saas/dashboard">
              <LayoutDashboard className="w-4 h-4" />
              Dashboard
            </a>
            <a className="hover:text-white transition-colors flex items-center gap-2" href="/saas/tenants">
              <Blocks className="w-4 h-4" />
              Clientes
            </a>
            <a className="hover:text-white transition-colors flex items-center gap-2" href="/saas/plans">
              <Package className="w-4 h-4" />
              Planos
            </a>
            <a className="hover:text-white transition-colors flex items-center gap-2" href="/saas/payments">
              <CreditCard className="w-4 h-4" />
              Pagamentos
            </a>
            <a className="hover:text-white transition-colors flex items-center gap-2" href="/saas/reports">
              <BarChart3 className="w-4 h-4" />
              Relatórios
            </a>
            <a className="hover:text-white transition-colors flex items-center gap-2" href="/saas/growth">
              <TrendingUp className="w-4 h-4" />
              Evolução
            </a>
            <a className="hover:text-white transition-colors flex items-center gap-2" href="/saas/support">
              <LifeBuoy className="w-4 h-4" />
              Suporte
            </a>
            <a className="hover:text-white transition-colors flex items-center gap-2" href="/saas/security">
              <Shield className="w-4 h-4" />
              Logs
            </a>
            <a className="hover:text-white transition-colors flex items-center gap-2" href="/saas/settings">
              <Settings className="w-4 h-4" />
              PIX (Efí)
            </a>
          </nav>

          <a
            href="/admin/dashboard"
            className="px-4 py-2 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 text-white font-black uppercase tracking-widest text-xs"
          >
            Voltar ao Admin
          </a>
        </div>
      </header>

      <main className="relative z-10">
        <div className="max-w-6xl mx-auto px-4 py-10">{children}</div>
      </main>
    </div>
  );
}
