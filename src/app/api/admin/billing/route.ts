import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { sendBillingNotification } from "@/lib/automation";
import { withErrorLogging } from "@/lib/api-handler";
import { createSecurityEvent, getLocationFromHeaders, getRequestIpFromHeaders } from "@/lib/security";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }
    const admin = session.user.email
      ? await prisma.admin.findUnique({ where: { cpf: session.user.email.replace(/\D/g, "") } })
      : null;

    const billings = await prisma.billing.findMany({
      where: admin?.tenantId ? { tenantId: admin.tenantId } : undefined,
      include: { member: true },
      orderBy: { dueDate: "desc" },
    });
    return NextResponse.json(billings);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export const POST = withErrorLogging(async (req: Request) => {
  const session = await getServerSession(authOptions);
  if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }
  const admin = session.user.email
    ? await prisma.admin.findUnique({ where: { cpf: session.user.email.replace(/\D/g, "") } })
    : null;

  const { memberId, amount, dueDate } = await req.json();
  
  const member = await prisma.member.findUnique({
    where: { id: memberId },
  });

  if (!member) {
    return NextResponse.json({ error: "Associado não encontrado" }, { status: 404 });
  }
  if (admin?.tenantId && member.tenantId !== admin.tenantId) {
    return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
  }

  const billing = await prisma.billing.create({
    data: {
      memberId,
      amount,
      dueDate: new Date(dueDate),
      status: "PENDING",
      tenantId: member.tenantId || admin?.tenantId || null,
    },
  });

  // Enviar notificação automática via WhatsApp
  await sendBillingNotification(member.id, "GENERATED");

  await createSecurityEvent({
    tenantId: billing.tenantId || null,
    portal: "ADMIN",
    action: "BILLING_CREATED",
    ipAddress: getRequestIpFromHeaders(req.headers),
    userAgent: req.headers.get("user-agent"),
    location: getLocationFromHeaders(req.headers),
    actorRole: session.user.role,
    actorId: admin?.id || null,
    details: `billingId=${billing.id} memberId=${member.id} amount=${billing.amount}`,
  });

  return NextResponse.json(billing);
});

export const DELETE = withErrorLogging(async (req: Request) => {
  const session = await getServerSession(authOptions);
  if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }
  const admin = session.user.email
    ? await prisma.admin.findUnique({ where: { cpf: session.user.email.replace(/\D/g, "") } })
    : null;

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "ID da cobrança não fornecido" }, { status: 400 });
  }

  const billing = await prisma.billing.findUnique({ where: { id } });
  if (!billing) {
    return NextResponse.json({ error: "Cobrança não encontrada" }, { status: 404 });
  }
  if (admin?.tenantId && billing.tenantId !== admin.tenantId) {
    return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
  }
  await prisma.billing.delete({ where: { id } });

  await createSecurityEvent({
    tenantId: billing.tenantId || null,
    portal: "ADMIN",
    action: "BILLING_DELETED",
    ipAddress: getRequestIpFromHeaders(req.headers),
    userAgent: req.headers.get("user-agent"),
    location: getLocationFromHeaders(req.headers),
    actorRole: session.user.role,
    actorId: admin?.id || null,
    details: `billingId=${billing.id}`,
  });

  return NextResponse.json({ success: true });
});
