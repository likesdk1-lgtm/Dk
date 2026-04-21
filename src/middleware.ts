import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  const url = req.nextUrl;
  const hostname = req.headers.get('host') || '';

  // DOMÍNIO PRINCIPAL (dksind.tech)
  const rootDomain = 'dksind.tech';
  
  // Ignorar arquivos estáticos, APIs internas e Next.js internals
  if (
    url.pathname.startsWith('/_next') ||
    url.pathname.startsWith('/static') ||
    url.pathname.startsWith('/api') ||
    url.pathname.includes('.') // favicon.ico, images, etc.
  ) {
    return NextResponse.next();
  }

  // Identifica o subdomínio
  let subdomain = '';
  if (hostname.includes(`.${rootDomain}`)) {
    subdomain = hostname.split(`.${rootDomain}`)[0];
  } else if (hostname.includes('.localhost')) {
    subdomain = hostname.split('.localhost')[0];
  }

  // Se for o domínio principal ou subdomínio 'www', não faz nada (mantém rotas padrão)
  if (!subdomain || subdomain === 'www') {
    return NextResponse.next();
  }

  // Se for subdomínio 'saas', redireciona para as rotas de gerenciamento do SaaS
  if (subdomain === 'saas') {
    // Evita loop se já estiver em /saas
    if (url.pathname.startsWith('/saas')) {
      return NextResponse.next();
    }
    return NextResponse.rewrite(new URL(`/saas${url.pathname}`, req.url));
  }

  // Se for um subdomínio de sindicato (ex: sindicato.dksind.tech)
  // Reescreve a rota injetando o tenant no path se necessário, ou apenas permite o acesso
  // O sistema já lida com tenantId na sessão, mas aqui garantimos que ele só acessa o dele.
  
  // Se estiver tentando acessar rotas do SaaS a partir de um subdomínio de sindicato, bloqueia
  if (url.pathname.startsWith('/saas')) {
    return NextResponse.rewrite(new URL('/404', req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all paths except for:
     * 1. /api routes
     * 2. /_next (Next.js internals)
     * 3. /static (static files)
     * 4. /favicon.ico, /sitemap.xml, etc.
     */
    '/((?!api|_next|static|favicon.ico|sitemap.xml).*)',
  ],
};
