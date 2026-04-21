import {
  BadgeCheck,
  BarChart3,
  Blocks,
  Bot,
  CreditCard,
  MessagesSquare,
  Shield,
  Sparkles,
} from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#020617] text-white">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(16,185,129,0.18),transparent_40%),radial-gradient(circle_at_80%_20%,rgba(59,130,246,0.18),transparent_45%),radial-gradient(circle_at_50%_80%,rgba(168,85,247,0.14),transparent_55%)]" />
        <div className="absolute inset-0 opacity-[0.06] [background-image:linear-gradient(to_right,rgba(255,255,255,0.6)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.6)_1px,transparent_1px)] [background-size:56px_56px]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.08),transparent_55%)]" />
      </div>

      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#020617]/70 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <a href="/" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-emerald-500 to-blue-600 shadow-xl shadow-emerald-500/10" />
            <div className="leading-tight">
              <div className="font-black tracking-tight">Dk Sind</div>
              <div className="text-[10px] font-bold tracking-[0.22em] text-white/50 uppercase">SaaS Sindical</div>
            </div>
          </a>

          <nav className="hidden md:flex items-center gap-6 text-sm">
            <a href="#recursos" className="text-white/70 hover:text-white transition-colors">Recursos</a>
            <a href="#integracoes" className="text-white/70 hover:text-white transition-colors">Integrações</a>
            <a href="#planos" className="text-white/70 hover:text-white transition-colors">Planos</a>
            <a href="/access" className="text-white/70 hover:text-white transition-colors">Portais</a>
          </nav>

          <div className="flex items-center gap-3">
            <a
              href="/signup"
              className="px-4 py-2 rounded-2xl bg-white text-[#020617] font-black text-xs uppercase tracking-widest shadow-xl shadow-white/10 hover:shadow-white/20 transition-shadow"
            >
              Experimentar grátis
            </a>
          </div>
        </div>
      </header>

      <section className="relative">
        <div className="max-w-6xl mx-auto px-4 pt-16 pb-10 md:pt-24 md:pb-16 grid lg:grid-cols-2 gap-10 items-center relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/5 text-[10px] font-black uppercase tracking-widest text-white/70">
              <Sparkles className="w-3 h-3 text-emerald-400" />
              Modelo SaaS com subdomínio
            </div>
            <h1 className="mt-5 text-4xl md:text-6xl font-black tracking-tight leading-[1.02]">
              Gestão sindical <span className="text-emerald-400">premium</span> com automação e cobrança
            </h1>
            <p className="mt-5 text-white/70 text-base md:text-lg leading-relaxed">
              Um sistema moderno para administrar associados, cobranças e comunicação — com portal do associado,
              CRM WhatsApp e integração PIX via Efí para monetizar seu SaaS.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <a
                href="/signup"
                className="px-6 py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black uppercase tracking-widest text-xs shadow-xl shadow-emerald-900/40"
              >
                Criar teste gratuito
              </a>
              <a
                href="/login"
                className="px-6 py-4 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 text-white font-black uppercase tracking-widest text-xs"
              >
                Acessar portal
              </a>
            </div>
            <div className="mt-6 grid sm:grid-cols-3 gap-4 text-xs text-white/60">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-white/50" />
                Auth + permissões
              </div>
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-white/50" />
                Cobrança PIX Efí
              </div>
              <div className="flex items-center gap-2">
                <Blocks className="w-4 h-4 text-white/50" />
                Multi-tenant por subdomínio
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-6 bg-gradient-to-br from-emerald-500/20 via-blue-500/10 to-purple-500/20 blur-2xl rounded-[3rem]" />
            <div className="relative bg-white/5 border border-white/10 rounded-[2.5rem] p-6 backdrop-blur-2xl shadow-2xl">
              <div className="flex items-center justify-between">
                <div className="text-[10px] font-black uppercase tracking-widest text-white/60">Visão do painel</div>
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-emerald-400">
                  <BadgeCheck className="w-3 h-3" />
                  Online
                </div>
              </div>

              <div className="mt-6 grid grid-cols-3 gap-3">
                <div className="rounded-2xl bg-white/5 border border-white/10 p-4">
                  <div className="text-[10px] font-black uppercase tracking-widest text-white/50">Associados</div>
                  <div className="mt-2 text-2xl font-black">1.284</div>
                  <div className="mt-1 text-[10px] text-emerald-400 font-bold uppercase tracking-widest">+12%</div>
                </div>
                <div className="rounded-2xl bg-white/5 border border-white/10 p-4">
                  <div className="text-[10px] font-black uppercase tracking-widest text-white/50">Receita</div>
                  <div className="mt-2 text-2xl font-black">R$ 39k</div>
                  <div className="mt-1 text-[10px] text-blue-400 font-bold uppercase tracking-widest">Mensal</div>
                </div>
                <div className="rounded-2xl bg-white/5 border border-white/10 p-4">
                  <div className="text-[10px] font-black uppercase tracking-widest text-white/50">Alertas</div>
                  <div className="mt-2 text-2xl font-black">18</div>
                  <div className="mt-1 text-[10px] text-purple-400 font-bold uppercase tracking-widest">Ações</div>
                </div>
              </div>

              <div className="mt-6 rounded-2xl bg-white/5 border border-white/10 p-4">
                <div className="flex items-center justify-between">
                  <div className="text-[10px] font-black uppercase tracking-widest text-white/50">Atividade</div>
                  <BarChart3 className="w-4 h-4 text-white/40" />
                </div>
                <div className="mt-3 h-24 rounded-xl bg-gradient-to-r from-emerald-500/15 via-blue-500/10 to-purple-500/15 border border-white/10" />
              </div>

              <div className="mt-6 grid grid-cols-2 gap-3">
                <div className="rounded-2xl bg-white/5 border border-white/10 p-4">
                  <div className="flex items-center gap-2">
                    <MessagesSquare className="w-4 h-4 text-emerald-400" />
                    <div className="text-[10px] font-black uppercase tracking-widest text-white/60">WhatsApp</div>
                  </div>
                  <div className="mt-2 text-xs text-white/60 leading-relaxed">
                    CRM integrado + auto-reconexão e notificações.
                  </div>
                </div>
                <div className="rounded-2xl bg-white/5 border border-white/10 p-4">
                  <div className="flex items-center gap-2">
                    <Bot className="w-4 h-4 text-blue-400" />
                    <div className="text-[10px] font-black uppercase tracking-widest text-white/60">Automação</div>
                  </div>
                  <div className="mt-2 text-xs text-white/60 leading-relaxed">
                    Lembretes e mensagens inteligentes para cobrança.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="recursos" className="relative z-10">
        <div className="max-w-6xl mx-auto px-4 py-16">
          <div className="max-w-2xl">
            <h2 className="text-3xl md:text-4xl font-black tracking-tight">Recursos que vendem</h2>
            <p className="mt-3 text-white/70">
              Um conjunto completo para operação interna e experiência do associado — pronto para SaaS.
            </p>
          </div>

          <div className="mt-10 grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6 backdrop-blur-2xl">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-emerald-400" />
              </div>
              <h3 className="mt-4 font-black tracking-tight">Dashboard Administrativo</h3>
              <p className="mt-2 text-sm text-white/70">
                Indicadores, metas, alertas, receitas e visão operacional com ações rápidas.
              </p>
            </div>
            <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6 backdrop-blur-2xl">
              <div className="w-10 h-10 rounded-2xl bg-blue-500/20 flex items-center justify-center">
                <MessagesSquare className="w-5 h-5 text-blue-400" />
              </div>
              <h3 className="mt-4 font-black tracking-tight">CRM WhatsApp</h3>
              <p className="mt-2 text-sm text-white/70">
                Conversas, anexos, vínculo ao cadastro e saúde da conexão com auto-reconexão.
              </p>
            </div>
            <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6 backdrop-blur-2xl">
              <div className="w-10 h-10 rounded-2xl bg-purple-500/20 flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-purple-400" />
              </div>
              <h3 className="mt-4 font-black tracking-tight">Cobrança + PIX</h3>
              <p className="mt-2 text-sm text-white/70">
                Geração de cobranças e PIX via Efí, com webhook para confirmação automática.
              </p>
            </div>
            <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6 backdrop-blur-2xl">
              <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center">
                <Shield className="w-5 h-5 text-white/70" />
              </div>
              <h3 className="mt-4 font-black tracking-tight">Segurança</h3>
              <p className="mt-2 text-sm text-white/70">
                Autenticação e perfis de acesso (associado, parceiro, admin e super admin).
              </p>
            </div>
            <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6 backdrop-blur-2xl">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 flex items-center justify-center">
                <Blocks className="w-5 h-5 text-emerald-300" />
              </div>
              <h3 className="mt-4 font-black tracking-tight">SaaS e Subdomínio</h3>
              <p className="mt-2 text-sm text-white/70">
                Cadastro de teste com CNPJ e subdomínio, pronto para provisionamento de cliente.
              </p>
            </div>
            <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6 backdrop-blur-2xl">
              <div className="w-10 h-10 rounded-2xl bg-blue-500/15 flex items-center justify-center">
                <Bot className="w-5 h-5 text-blue-300" />
              </div>
              <h3 className="mt-4 font-black tracking-tight">Automação</h3>
              <p className="mt-2 text-sm text-white/70">
                Mensagens automáticas para cobrança, lembretes e campanhas com templates.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="integracoes" className="relative z-10">
        <div className="max-w-6xl mx-auto px-4 pb-16">
          <div className="rounded-[2.5rem] border border-white/10 bg-white/5 p-8 md:p-10 backdrop-blur-2xl">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div>
                <div className="text-[10px] font-black uppercase tracking-widest text-white/60">Integrações</div>
                <h2 className="mt-2 text-2xl md:text-3xl font-black tracking-tight">Efí (Gerencianet), WhatsApp e mais</h2>
                <p className="mt-2 text-white/70">
                  Conecte cobrança, atendimento e telemetria para vender e operar em alto nível.
                </p>
              </div>
              <a
                href="/signup"
                className="px-6 py-4 rounded-2xl bg-white text-[#020617] font-black uppercase tracking-widest text-xs shadow-xl shadow-white/10"
              >
                Começar agora
              </a>
            </div>

            <div className="mt-8 grid md:grid-cols-3 gap-4">
              <div className="rounded-2xl border border-white/10 bg-[#020617]/40 p-5">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-emerald-400" />
                  <div className="text-xs font-black uppercase tracking-widest text-white/70">PIX Efí</div>
                </div>
                <div className="mt-2 text-sm text-white/60">Cobrança, QR Code e confirmação por webhook.</div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-[#020617]/40 p-5">
                <div className="flex items-center gap-2">
                  <MessagesSquare className="w-4 h-4 text-blue-400" />
                  <div className="text-xs font-black uppercase tracking-widest text-white/70">WhatsApp</div>
                </div>
                <div className="mt-2 text-sm text-white/60">CRM integrado, anexos, saúde e automações.</div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-[#020617]/40 p-5">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-purple-400" />
                  <div className="text-xs font-black uppercase tracking-widest text-white/70">Autenticação</div>
                </div>
                <div className="mt-2 text-sm text-white/60">Sessões, perfis e trilha para operação segura.</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="planos" className="relative z-10">
        <div className="max-w-6xl mx-auto px-4 pb-20">
          <div className="max-w-2xl">
            <h2 className="text-3xl md:text-4xl font-black tracking-tight">Planos para vender</h2>
            <p className="mt-3 text-white/70">
              Teste grátis para entrar rápido e cobrança PIX para converter.
            </p>
          </div>

          <div className="mt-10 grid md:grid-cols-3 gap-6">
            <div className="rounded-[2.25rem] border border-white/10 bg-white/5 p-7 backdrop-blur-2xl">
              <div className="text-xs font-black uppercase tracking-widest text-white/60">Teste</div>
              <div className="mt-3 text-4xl font-black tracking-tight">R$ 0</div>
              <div className="mt-1 text-sm text-white/60">Comece com subdomínio e painel.</div>
              <a
                href="/signup"
                className="mt-6 block text-center px-5 py-4 rounded-2xl bg-white text-[#020617] font-black uppercase tracking-widest text-xs"
              >
                Experimentar
              </a>
              <ul className="mt-6 space-y-3 text-sm text-white/70">
                <li className="flex items-center gap-2"><BadgeCheck className="w-4 h-4 text-emerald-400" /> Cadastro de teste</li>
                <li className="flex items-center gap-2"><BadgeCheck className="w-4 h-4 text-emerald-400" /> Painel admin</li>
                <li className="flex items-center gap-2"><BadgeCheck className="w-4 h-4 text-emerald-400" /> Portal do associado</li>
              </ul>
            </div>

            <div className="rounded-[2.25rem] border border-emerald-500/30 bg-emerald-500/10 p-7 backdrop-blur-2xl shadow-2xl shadow-emerald-900/20">
              <div className="flex items-center justify-between">
                <div className="text-xs font-black uppercase tracking-widest text-emerald-200/90">Profissional</div>
                <div className="text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-200">
                  Mais vendido
                </div>
              </div>
              <div className="mt-3 text-4xl font-black tracking-tight">R$ 199</div>
              <div className="mt-1 text-sm text-emerald-100/80">Cobrança PIX + WhatsApp + automações.</div>
              <a
                href="/signup"
                className="mt-6 block text-center px-5 py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black uppercase tracking-widest text-xs"
              >
                Começar e pagar via PIX
              </a>
              <ul className="mt-6 space-y-3 text-sm text-emerald-100/80">
                <li className="flex items-center gap-2"><BadgeCheck className="w-4 h-4 text-emerald-300" /> CRM WhatsApp</li>
                <li className="flex items-center gap-2"><BadgeCheck className="w-4 h-4 text-emerald-300" /> Integração Efí</li>
                <li className="flex items-center gap-2"><BadgeCheck className="w-4 h-4 text-emerald-300" /> Templates e automações</li>
              </ul>
            </div>

            <div className="rounded-[2.25rem] border border-white/10 bg-white/5 p-7 backdrop-blur-2xl">
              <div className="text-xs font-black uppercase tracking-widest text-white/60">Enterprise</div>
              <div className="mt-3 text-4xl font-black tracking-tight">Custom</div>
              <div className="mt-1 text-sm text-white/60">Multi-unidades, customizações e SLA.</div>
              <a
                href="/signup"
                className="mt-6 block text-center px-5 py-4 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 text-white font-black uppercase tracking-widest text-xs"
              >
                Falar com vendas
              </a>
              <ul className="mt-6 space-y-3 text-sm text-white/70">
                <li className="flex items-center gap-2"><BadgeCheck className="w-4 h-4 text-emerald-400" /> Customizações</li>
                <li className="flex items-center gap-2"><BadgeCheck className="w-4 h-4 text-emerald-400" /> Migração assistida</li>
                <li className="flex items-center gap-2"><BadgeCheck className="w-4 h-4 text-emerald-400" /> SLA e suporte</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <footer className="relative z-10 border-t border-white/10 bg-[#020617]/60 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-4 py-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <div className="font-black tracking-tight">Dk Sind</div>
            <div className="mt-1 text-sm text-white/60">Sistema SaaS de Gestão Sindical</div>
          </div>
          <div className="flex items-center gap-6 text-sm">
            <a href="/login" className="text-white/70 hover:text-white transition-colors">Entrar</a>
            <a href="/signup" className="text-white/70 hover:text-white transition-colors">Experimentar</a>
            <a href="/saas/dashboard" className="text-white/70 hover:text-white transition-colors">Portal SaaS</a>
          </div>
        </div>
      </footer>
    </main>
  );
}
