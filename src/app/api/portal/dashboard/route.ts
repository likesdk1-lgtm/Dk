import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    console.log("[DASHBOARD API] Início da requisição GET");
    
    if (!session) {
      console.error("[DASHBOARD API] ERRO: Sessão nula ou indefinida.");
      return NextResponse.json({ error: "Sessão não encontrada" }, { status: 401 });
    }

    if (!session.user) {
      console.error("[DASHBOARD API] ERRO: Usuário ausente na sessão.");
      return NextResponse.json({ error: "Usuário não identificado" }, { status: 401 });
    }

    // Tenta buscar pelo ID primeiro
    let member = null;
    const userId = session.user.id;
    const userCpf = session.user.email;

    if (userId) {
      console.log(`[DASHBOARD API] Buscando por ID: ${userId}`);
      member = await prisma.member.findUnique({
        where: { id: userId },
      });
    }

    if (!member && userCpf) {
      const cleanCpf = userCpf.replace(/\D/g, "");
      console.log(`[DASHBOARD API] ID falhou ou ausente. Buscando por CPF: ${cleanCpf}`);
      member = await prisma.member.findUnique({
        where: { cpf: cleanCpf },
      });
    }

    if (!member) {
      console.error(`[DASHBOARD API] ERRO: Nenhum associado localizado para ID=${userId} ou CPF=${userCpf}`);
      return NextResponse.json({ 
        error: "Associado não localizado no banco de dados. Verifique se seu cadastro está ativo.",
        debug: { userId, userCpf }
      }, { status: 404 });
    }

    console.log(`[DASHBOARD API] SUCESSO: Associado ${member.name} localizado.`);
    
    // Fetch details with try-catch per table to be robust
    let billings: any[] = [];
    try {
      billings = await prisma.billing.findMany({
        where: { memberId: member.id },
        orderBy: { dueDate: "desc" },
      });
    } catch (e) {
      console.error("[DASHBOARD API] Erro ao buscar cobranças (tabela pode não existir):", e);
    }

    let settings: any = null;
    try {
      settings = await prisma.settings.findFirst();
      if (settings) {
        if (settings.homePageContent) try { settings.homePageContent = JSON.parse(settings.homePageContent as string); } catch(e) {}
        if (settings.cardDesign) try { settings.cardDesign = JSON.parse(settings.cardDesign as string); } catch(e) {}
        if (settings.footerContent) try { settings.footerContent = JSON.parse(settings.footerContent as string); } catch(e) {}
      }
    } catch (e) {
      console.error("[DASHBOARD API] Erro ao buscar configurações:", e);
    }

    let events: any[] = [];
    try {
      events = await prisma.eventCheckin.findMany({
        where: { memberId: member.id },
        include: { event: true },
        orderBy: { checkedAt: "desc" },
      });
    } catch (e) {
      console.error("[DASHBOARD API] Erro ao buscar checkins de eventos:", e);
    }

    let benefits: any[] = [];
    try {
      benefits = await prisma.benefit.findMany({
        include: {
          company: {
            select: { name: true }
          }
        },
        orderBy: { createdAt: "desc" },
      });
    } catch (e) {
      console.error("[DASHBOARD API] Erro ao buscar benefícios:", e);
    }

    let redeemedBenefits: any[] = [];
    try {
      redeemedBenefits = await prisma.benefitUsage.findMany({
        where: { memberId: member.id },
        include: {
          benefit: {
            select: { title: true }
          },
          company: {
            select: { name: true }
          }
        },
        orderBy: { usedAt: "desc" },
      });
    } catch (e) {
      console.error("[DASHBOARD API] Erro ao buscar benefícios resgatados:", e);
    }

    return NextResponse.json({
      member,
      billings,
      notifications: [], // Removido conforme solicitação
      settings,
      events,
      benefits,
      redeemedBenefits,
    });

  } catch (error: any) {
    console.error("[DASHBOARD API] ERRO CRÍTICO 500:", error);
    return NextResponse.json({ 
      error: "Erro interno no servidor ao processar dashboard",
      details: error.message 
    }, { status: 500 });
  }
}

// Removendo fetchMemberDetails antigo pois incorporamos no GET principal com try-catches
