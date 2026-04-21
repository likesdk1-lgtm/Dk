import React from "react";

interface FooterProps {
  unionName: string;
  footerContent?: {
    address?: string;
    email?: string;
    phone?: string;
    copyright?: string;
  };
}

const Footer: React.FC<FooterProps> = ({ unionName, footerContent }) => {
  const year = new Date().getFullYear();

  return (
    <footer className="w-full py-20 bg-[#020617] border-t border-white/5 relative z-10 overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-blue-600/5 rounded-full blur-[100px] -z-10" />
      
      <div className="container mx-auto px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-16 mb-16">
          <div className="space-y-6">
            <div className="flex flex-col">
              <span className="text-3xl font-black text-white uppercase tracking-tighter leading-none">
                {unionName}
              </span>
              <span className="text-[9px] font-black text-blue-400 uppercase tracking-[0.3em] mt-2">Sindicato dos Técnicos e Auxiliares em Saúde Bucal do Piauí</span>
            </div>
            <p className="text-blue-200/40 text-sm font-medium leading-relaxed max-w-xs">
              Liderando a transformação digital na gestão sindical para profissionais de saúde.
            </p>
          </div>

          <div className="space-y-6">
            <h4 className="text-[10px] font-black text-white uppercase tracking-[0.3em]">Contato & Localização</h4>
            <div className="space-y-4 text-sm font-medium text-blue-200/40">
              <p>{footerContent?.address || "Endereço não configurado"}</p>
              <p>{footerContent?.email || "email@exemplo.com"}</p>
              <p>{footerContent?.phone || "(00) 0000-0000"}</p>
            </div>
          </div>

          <div className="space-y-6">
            <h4 className="text-[10px] font-black text-white uppercase tracking-[0.3em]">Links Rápidos</h4>
            <div className="flex flex-wrap gap-x-8 gap-y-4">
              {['Início', 'Sobre', 'Notícias', 'Contato', 'Privacidade'].map((item) => (
                <a key={item} href="#" className="text-xs font-bold text-blue-200/40 hover:text-blue-400 transition-colors uppercase tracking-widest">{item}</a>
              ))}
            </div>
          </div>
        </div>

        <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="text-blue-200/20 text-[10px] font-black uppercase tracking-[0.2em]">
            {footerContent?.copyright || `© ${year} ${unionName}. Todos os direitos reservados.`}
          </div>
          <div className="text-blue-300/10 text-[9px] font-black uppercase tracking-[0.4em] flex items-center gap-4">
            Desenvolvido por <span className="text-blue-500/30">DK CODE</span>
            <div className="w-1.5 h-1.5 bg-blue-500/20 rounded-full animate-pulse" />
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
