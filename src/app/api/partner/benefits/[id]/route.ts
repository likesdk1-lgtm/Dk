import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || (session.user as any).role !== "PARTNER") {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const partnerId = session.user.id;
    const benefitId = params.id;

    // Verificar se o benefício pertence a esta empresa
    const benefit = await prisma.benefit.findUnique({
      where: { id: benefitId },
    });

    if (!benefit || benefit.companyId !== partnerId) {
      return NextResponse.json({ error: "Benefício não encontrado ou não pertence a esta empresa" }, { status: 403 });
    }

    await prisma.benefit.delete({
      where: { id: benefitId },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("[PARTNER BENEFIT DELETE API] ERROR:", error);
    return NextResponse.json({ error: "Erro ao excluir benefício" }, { status: 500 });
  }
}
