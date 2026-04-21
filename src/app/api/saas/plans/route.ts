import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { z } from "zod";
import { headers } from "next/headers";
import { createSecurityEvent, getRequestIpFromHeaders } from "@/lib/security";

const createSchema = z.object({
  code: z.string().min(2).max(32),
  name: z.string().min(2).max(80),
  price: z.number().nonnegative(),
  currency: z.string().min(3).max(3).optional(),
  interval: z.string().min(3).max(20).optional(),
  status: z.string().min(3).max(20).optional(),
});

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const plans = await prisma.saasPlan.findMany({
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ plans });
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const data = await req.json();
  const parsed = createSchema.safeParse(data);
  if (!parsed.success) {
    return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
  }

  const plan = await prisma.saasPlan.create({
    data: {
      code: parsed.data.code.toUpperCase(),
      name: parsed.data.name,
      price: parsed.data.price,
      currency: (parsed.data.currency || "BRL").toUpperCase(),
      interval: (parsed.data.interval || "MONTHLY").toUpperCase(),
      status: (parsed.data.status || "ACTIVE").toUpperCase(),
    },
  });

  const h = headers();
  await createSecurityEvent({
    tenantId: null,
    portal: "SAAS",
    action: "SAAS_PLAN_CREATED",
    ipAddress: getRequestIpFromHeaders(h),
    userAgent: h.get("user-agent"),
    actorRole: session.user.role,
    actorId: session.user.id,
    details: `plan=${plan.code}`,
  });

  return NextResponse.json({ plan });
}
