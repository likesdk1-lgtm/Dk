import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || (session.user as any).role !== "PARTNER") {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { qrData, benefitId } = await req.json();

    if (!qrData || !benefitId) {
      return NextResponse.json({ error: "Dados incompletos" }, { status: 400 });
    }

    const partnerId = session.user.id;

    // 1. Decodificar QR Data
    let parsedData;
    try {
      parsedData = JSON.parse(qrData);
    } catch (e) {
      parsedData = { registration: qrData };
    }

    const registration = parsedData.registration;

    // 2. Buscar Associado
    const member = await prisma.member.findUnique({
      where: { registrationNum: registration },
    });

    if (!member) {
      return NextResponse.json({ error: "Associado não localizado" }, { status: 404 });
    }

    if (member.status !== "ACTIVE") {
      return NextResponse.json({ error: "Associado INATIVO. Benefício não pode ser liberado.", member }, { status: 403 });
    }

    // 2.5 Verificar Limite Mensal e Propriedade do Benefício
    const benefit = await prisma.benefit.findUnique({
      where: { id: benefitId },
    });

    if (!benefit) {
      return NextResponse.json({ error: "Benefício não encontrado" }, { status: 404 });
    }

    // Verificar se o benefício pertence a esta empresa OU se é um benefício global (sem companyId)
    if (benefit.companyId && benefit.companyId !== partnerId) {
      return NextResponse.json({ error: "Este benefício não pertence à sua empresa." }, { status: 403 });
    }

    if (benefit.monthlyLimit > 0) {
      const now = new Date();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

      const usageCount = await prisma.benefitUsage.count({
        where: {
          memberId: member.id,
          benefitId: benefitId,
          usedAt: {
            gte: monthStart,
            lte: monthEnd,
          }
        }
      });

      if (usageCount >= benefit.monthlyLimit) {
        return NextResponse.json({ 
          error: `Limite mensal atingido. Este associado já usou este benefício ${usageCount} vezes este mês (Limite: ${benefit.monthlyLimit}).`,
          member 
        }, { status: 403 });
      }
    }

    // 3. Registrar Uso do Benefício
    const usage = await prisma.benefitUsage.create({
      data: {
        memberId: member.id,
        benefitId: benefitId,
        companyId: partnerId,
      }
    });

    return NextResponse.json({
      success: true,
      member,
      usage,
      timestamp: new Date().toISOString(),
    });

  } catch (error: any) {
    console.error("[PARTNER VALIDATE API] ERROR:", error);
    return NextResponse.json({ error: "Erro ao validar benefício" }, { status: 500 });
  }
}
