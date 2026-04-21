import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }
  const admin = session.user.email
    ? await prisma.admin.findUnique({ where: { cpf: session.user.email.replace(/\D/g, "") } })
    : null;

  const latestPayments = await prisma.billing.findMany({
    where: { status: "PAID", ...(admin?.tenantId ? { tenantId: admin.tenantId } : {}) },
    orderBy: { paymentDate: "desc" },
    take: 10,
    include: {
      member: {
        select: {
          name: true,
          photoUrl: true,
          registrationNum: true,
        },
      },
    },
  });

  return NextResponse.json(latestPayments);
}
