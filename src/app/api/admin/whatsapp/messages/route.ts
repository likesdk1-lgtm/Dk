import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withErrorLogging } from "@/lib/api-handler";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export const dynamic = "force-dynamic";

export const GET = withErrorLogging(async (req: Request) => {
  const session = await getServerSession(authOptions);
  if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }
  if (!session.user.email) {
    return NextResponse.json({ error: "Sessão inválida" }, { status: 401 });
  }

  const admin = await prisma.admin.findUnique({
    where: { cpf: session.user.email.replace(/\D/g, "") },
  });
  if (!admin?.tenantId) {
    return NextResponse.json({ error: "Sindicato não localizado" }, { status: 404 });
  }

  const { searchParams } = new URL(req.url);
  const number = String(searchParams.get("number") || "").replace(/\D/g, "");

  if (!number) {
    return NextResponse.json({ error: "Número não fornecido" }, { status: 400 });
  }

  const messages = await prisma.chatMessage.findMany({
    where: { whatsappNumber: number, tenantId: admin.tenantId },
    include: {
      admin: {
        select: { name: true }
      }
    },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json(messages);
});
