import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { createSecurityEvent, getRequestIpFromHeaders } from "@/lib/security";
import { z } from "zod";

const schema = z.object({
  provider: z.string().min(2).max(40),
  efiClientId: z.string().optional().nullable(),
  efiClientSecret: z.string().optional().nullable(),
  efiPixKey: z.string().optional().nullable(),
  efiSandbox: z.boolean().optional(),
  efiCertificate: z.string().optional().nullable(),
  mpAccessToken: z.string().optional().nullable(),
  bbClientId: z.string().optional().nullable(),
  bbClientSecret: z.string().optional().nullable(),
  bbDeveloperKey: z.string().optional().nullable(),
  sicoobClientId: z.string().optional().nullable(),
  sicoobCertificate: z.string().optional().nullable(),
  itauClientId: z.string().optional().nullable(),
  itauClientSecret: z.string().optional().nullable(),
  itauCertificate: z.string().optional().nullable(),
});

export async function GET() {
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
    return NextResponse.json({ error: "Tenant não localizado" }, { status: 404 });
  }

  const gateway = await prisma.tenantPaymentGateway.findUnique({
    where: { tenantId: admin.tenantId },
  });

  return NextResponse.json({ gateway });
}

export async function PATCH(req: Request) {
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
    return NextResponse.json({ error: "Tenant não localizado" }, { status: 404 });
  }

  const data = await req.json();
  const parsed = schema.safeParse(data);
  if (!parsed.success) {
    return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
  }

  const provider = parsed.data.provider.toUpperCase();
  const updated = await prisma.tenantPaymentGateway.upsert({
    where: { tenantId: admin.tenantId },
    update: {
      provider,
      efiClientId: parsed.data.efiClientId ?? undefined,
      efiClientSecret: parsed.data.efiClientSecret ?? undefined,
      efiPixKey: parsed.data.efiPixKey ?? undefined,
      efiSandbox: typeof parsed.data.efiSandbox === "boolean" ? parsed.data.efiSandbox : undefined,
      efiCertificate: parsed.data.efiCertificate ?? undefined,
      mpAccessToken: parsed.data.mpAccessToken ?? undefined,
      bbClientId: parsed.data.bbClientId ?? undefined,
      bbClientSecret: parsed.data.bbClientSecret ?? undefined,
      bbDeveloperKey: parsed.data.bbDeveloperKey ?? undefined,
      sicoobClientId: parsed.data.sicoobClientId ?? undefined,
      sicoobCertificate: parsed.data.sicoobCertificate ?? undefined,
      itauClientId: parsed.data.itauClientId ?? undefined,
      itauClientSecret: parsed.data.itauClientSecret ?? undefined,
      itauCertificate: parsed.data.itauCertificate ?? undefined,
    },
    create: {
      tenantId: admin.tenantId,
      provider,
      efiClientId: parsed.data.efiClientId ?? null,
      efiClientSecret: parsed.data.efiClientSecret ?? null,
      efiPixKey: parsed.data.efiPixKey ?? null,
      efiSandbox: typeof parsed.data.efiSandbox === "boolean" ? parsed.data.efiSandbox : true,
      efiCertificate: parsed.data.efiCertificate ?? null,
      mpAccessToken: parsed.data.mpAccessToken ?? null,
      bbClientId: parsed.data.bbClientId ?? null,
      bbClientSecret: parsed.data.bbClientSecret ?? null,
      bbDeveloperKey: parsed.data.bbDeveloperKey ?? null,
      sicoobClientId: parsed.data.sicoobClientId ?? null,
      sicoobCertificate: parsed.data.sicoobCertificate ?? null,
      itauClientId: parsed.data.itauClientId ?? null,
      itauClientSecret: parsed.data.itauClientSecret ?? null,
      itauCertificate: parsed.data.itauCertificate ?? null,
    },
  });

  const h = headers();
  await createSecurityEvent({
    tenantId: admin.tenantId,
    portal: "ADMIN",
    action: "PAYMENT_GATEWAY_UPDATED",
    ipAddress: getRequestIpFromHeaders(h),
    userAgent: h.get("user-agent"),
    actorRole: session.user.role,
    actorId: admin.id,
    details: `provider=${provider}`,
  });

  return NextResponse.json({ gateway: updated });
}

