export default function Page() {
  return (
    <main className="min-h-screen bg-[#020617] text-white">
      <div className="max-w-5xl mx-auto px-4 py-16">
        <div className="space-y-2">
          <div className="text-[10px] font-black uppercase tracking-widest text-white/60">Selecione um portal</div>
          <h1 className="text-3xl md:text-4xl font-black tracking-tight">Acesso</h1>
        </div>

        <div className="mt-8 grid md:grid-cols-2 gap-6">
          <a
            href="/saas/login"
            className="rounded-[2rem] border border-white/10 bg-white/5 backdrop-blur-2xl p-6 block hover:bg-white/10 transition-colors"
          >
            <div className="text-xs font-black uppercase tracking-widest text-white/70">Portal SaaS</div>
            <div className="mt-2 text-sm text-white/80">Administração dos sindicatos clientes (Super Admin)</div>
          </a>
          <a
            href="/admin/login"
            className="rounded-[2rem] border border-white/10 bg-white/5 backdrop-blur-2xl p-6 block hover:bg-white/10 transition-colors"
          >
            <div className="text-xs font-black uppercase tracking-widest text-white/70">Portal Administrativo</div>
            <div className="mt-2 text-sm text-white/80">Gestão do sindicato (admins locais)</div>
          </a>
          <a
            href="/login"
            className="rounded-[2rem] border border-white/10 bg-white/5 backdrop-blur-2xl p-6 block hover:bg-white/10 transition-colors"
          >
            <div className="text-xs font-black uppercase tracking-widest text-white/70">Portal do Associado</div>
            <div className="mt-2 text-sm text-white/80">Carteirinha, pagamentos e notificações</div>
          </a>
          <a
            href="/partner/login"
            className="rounded-[2rem] border border-white/10 bg-white/5 backdrop-blur-2xl p-6 block hover:bg-white/10 transition-colors"
          >
            <div className="text-xs font-black uppercase tracking-widest text-white/70">Portal do Parceiro</div>
            <div className="mt-2 text-sm text-white/80">Benefícios e relacionamento</div>
          </a>
        </div>
      </div>
    </main>
  );
}
