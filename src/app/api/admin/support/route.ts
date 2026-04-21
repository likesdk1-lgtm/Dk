import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createSecurityEvent, getLocationFromHeaders, getRequestIpFromHeaders } from "@/lib/security";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }
  if (!session.user.email) {
    return NextResponse.json({ error: "Sessão inválida" }, { status: 401 });
  }
  const admin = await prisma.admin.findUnique({ where: { cpf: session.user.email.replace(/\D/g, "") } });
  const tickets = await prisma.supportTicket.findMany({
    where: { tenantId: admin?.tenantId || undefined },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ tickets });
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }
  if (!session.user.email) {
    return NextResponse.json({ error: "Sessão inválida" }, { status: 401 });
  }
  const admin = await prisma.admin.findUnique({ where: { cpf: session.user.email.replace(/\D/g, "") } });
  const data = await req.json();
  const t = await prisma.supportTicket.create({
    data: {
      tenantId: admin?.tenantId || null,
      adminId: admin?.id || null,
      subject: data.subject || "Suporte",
      message: data.message || "",
    },
  });

  await createSecurityEvent({
    tenantId: admin?.tenantId || null,
    portal: "ADMIN",
    action: "SUPPORT_TICKET_CREATED",
    ipAddress: getRequestIpFromHeaders(req.headers),
    userAgent: req.headers.get("user-agent"),
    location: getLocationFromHeaders(req.headers),
    actorRole: session.user.role,
    actorId: admin?.id || null,
    details: `ticketId=${t.id}`,
  });

  return NextResponse.json({ ticket: t });
}
