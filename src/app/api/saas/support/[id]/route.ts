import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { createSecurityEvent, getLocationFromHeaders, getRequestIpFromHeaders } from "@/lib/security";

const schema = z.object({
  status: z.string().min(3).max(20).optional(),
  responseMessage: z.string().max(5000).optional(),
});

export async function PATCH(req: Request, ctx: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const data = await req.json();
  const parsed = schema.safeParse(data);
  if (!parsed.success) {
    return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
  }

  const status = parsed.data.status ? parsed.data.status.toUpperCase() : undefined;
  const responseMessage = typeof parsed.data.responseMessage === "string" ? parsed.data.responseMessage : undefined;

  const updated = await prisma.supportTicket.update({
    where: { id: ctx.params.id },
    data: {
      ...(status ? { status } : {}),
      ...(responseMessage !== undefined ? { responseMessage } : {}),
      ...(responseMessage ? { respondedAt: new Date() } : {}),
    },
  });

  await createSecurityEvent({
    tenantId: updated.tenantId || null,
    portal: "SAAS",
    action: "SAAS_SUPPORT_TICKET_UPDATED",
    ipAddress: getRequestIpFromHeaders(req.headers),
    userAgent: req.headers.get("user-agent"),
    location: getLocationFromHeaders(req.headers),
    actorRole: session.user.role,
    actorId: session.user.id,
    details: `ticketId=${updated.id} status=${updated.status}`,
  });

  return NextResponse.json({ ticket: updated });
}
