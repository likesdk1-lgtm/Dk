import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { z } from "zod";
import { headers } from "next/headers";
import { createSecurityEvent, getRequestIpFromHeaders } from "@/lib/security";

const updateSchema = z.object({
  name: z.string().min(2).max(80).optional(),
  price: z.number().nonnegative().optional(),
  status: z.string().min(3).max(20).optional(),
});

export async function PATCH(req: Request, ctx: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const data = await req.json();
  const parsed = updateSchema.safeParse(data);
  if (!parsed.success) {
    return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
  }

  const updated = await prisma.saasPlan.update({
    where: { id: ctx.params.id },
    data: {
      ...(parsed.data.name ? { name: parsed.data.name } : {}),
      ...(typeof parsed.data.price === "number" ? { price: parsed.data.price } : {}),
      ...(parsed.data.status ? { status: parsed.data.status.toUpperCase() } : {}),
    },
  });

  const h = headers();
  await createSecurityEvent({
    tenantId: null,
    portal: "SAAS",
    action: "SAAS_PLAN_UPDATED",
    ipAddress: getRequestIpFromHeaders(h),
    userAgent: h.get("user-agent"),
    actorRole: session.user.role,
    actorId: session.user.id,
    details: `planId=${updated.id}`,
  });

  return NextResponse.json({ plan: updated });
}

export async function DELETE(_req: Request, ctx: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const deleted = await prisma.saasPlan.delete({ where: { id: ctx.params.id } });
  const h = headers();
  await createSecurityEvent({
    tenantId: null,
    portal: "SAAS",
    action: "SAAS_PLAN_DELETED",
    ipAddress: getRequestIpFromHeaders(h),
    userAgent: h.get("user-agent"),
    actorRole: session.user.role,
    actorId: session.user.id,
    details: `plan=${deleted.code}`,
  });
  return NextResponse.json({ ok: true });
}
