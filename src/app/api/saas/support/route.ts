import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createSecurityEvent, getLocationFromHeaders, getRequestIpFromHeaders } from "@/lib/security";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }
  const tickets = await prisma.supportTicket.findMany({
    orderBy: { createdAt: "desc" },
  });
  const tenantIds = Array.from(
    new Set(tickets.map((t: any) => t.tenantId).filter((id: any) => typeof id === "string" && id.length > 0))
  ) as string[];

  const tenants = tenantIds.length
    ? await prisma.tenant.findMany({
        where: { id: { in: tenantIds } },
        select: { id: true, name: true, subdomain: true },
      })
    : [];

  const tenantById = new Map(tenants.map((t) => [t.id, t]));

  const enrichedTickets = tickets.map((t: any) => ({
    ...t,
    tenant: t.tenantId ? tenantById.get(t.tenantId) || null : null,
  }));

  return NextResponse.json({ tickets: enrichedTickets });
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }
  const data = await req.json();
  const t = await prisma.supportTicket.create({
    data: {
      tenantId: data.tenantId || null,
      adminId: data.adminId || null,
      subject: data.subject || "Sem assunto",
      message: data.message || "",
    },
  });

  await createSecurityEvent({
    tenantId: t.tenantId || null,
    portal: "SAAS",
    action: "SAAS_SUPPORT_TICKET_CREATED",
    ipAddress: getRequestIpFromHeaders(req.headers),
    userAgent: req.headers.get("user-agent"),
    location: getLocationFromHeaders(req.headers),
    actorRole: session.user.role,
    actorId: session.user.id,
    details: `ticketId=${t.id}`,
  });

  return NextResponse.json({ ticket: t });
}
