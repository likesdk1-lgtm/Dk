import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { startOfMonth, endOfMonth } from "date-fns";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || (session.user as any).role !== "PARTNER") {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const partnerId = session.user.id;
    const now = new Date();
    const monthStart = startOfMonth(now);
    const monthEnd = endOfMonth(now);

    // 1. Dados da Empresa
    const partner = await prisma.partnerCompany.findUnique({
      where: { id: partnerId },
      select: {
        id: true,
        name: true,
        document: true,
        email: true,
        category: true,
        status: true,
        logoUrl: true,
        _count: {
          select: { usages: true, benefits: true }
        }
      }
    });

    if (!partner) {
      return NextResponse.json({ error: "Empresa não encontrada" }, { status: 404 });
    }

    // 2. Benefícios oferecidos por esta empresa
    const benefits = await prisma.benefit.findMany({
      where: { companyId: partnerId },
    });

    // 3. Usos do mês atual
    const monthlyUsages = await prisma.benefitUsage.findMany({
      where: {
        companyId: partnerId,
        usedAt: {
          gte: monthStart,
          lte: monthEnd,
        }
      },
      include: {
        member: {
          select: {
            name: true,
            registrationNum: true,
            photoUrl: true,
          }
        },
        benefit: {
          select: {
            title: true,
          }
        }
      },
      orderBy: { usedAt: "desc" },
    });

    return NextResponse.json({
      partner,
      benefits,
      monthlyUsages,
      stats: {
        totalUsages: partner._count.usages,
        thisMonthUsages: monthlyUsages.length,
        activeBenefits: benefits.length,
      }
    });

  } catch (error: any) {
    console.error("[PARTNER DASHBOARD API] ERROR:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
