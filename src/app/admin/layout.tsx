"use client";

import React from "react";
import { AdminSidebar } from "@/components/AdminSidebar";
import { motion, AnimatePresence } from "framer-motion";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#020617] font-sans overflow-x-hidden text-slate-200">
      {/* Dynamic Background */}
      <div className="fixed inset-0 pointer-events-none z-0 print:hidden">
        <div className="absolute top-0 left-64 right-0 bottom-0 bg-[radial-gradient(circle_at_50%_0%,rgba(59,130,246,0.05),transparent_50%)]" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 mix-blend-overlay" />
      </div>

      <AdminSidebar />
      
      <main className="md:pl-72 min-h-screen relative z-10 pt-20 md:pt-0 print:pl-0">
        <div 
          className="container mx-auto max-w-[1600px] p-4 md:p-8 print:p-0"
        >
          {children}
        </div>
      </main>

      {/* Futuristic Scanline Effect */}
      <div className="fixed inset-0 pointer-events-none z-50 opacity-[0.03] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%] print:hidden" />
    </div>
  );
}
