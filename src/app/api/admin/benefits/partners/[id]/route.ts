import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const partner = await prisma.partnerCompany.findUnique({
      where: { id: params.id },
      include: {
        usages: {
          include: {
            member: {
              select: { name: true, registrationNum: true }
            },
            benefit: {
              select: { title: true }
            }
          },
          orderBy: { usedAt: "desc" }
        }
      }
    });

    return NextResponse.json(partner);
  } catch (error: any) {
    console.error("[ADMIN PARTNER DETAIL API] ERROR:", error);
    return NextResponse.json({ error: "Erro ao buscar detalhes do parceiro" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    await prisma.partnerCompany.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("[ADMIN PARTNER DELETE API] ERROR:", error);
    return NextResponse.json({ error: "Erro ao excluir parceiro" }, { status: 500 });
  }
}
