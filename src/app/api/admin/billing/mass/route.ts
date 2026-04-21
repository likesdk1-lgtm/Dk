import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendBillingNotification } from "@/lib/automation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { createSecurityEvent, getLocationFromHeaders, getRequestIpFromHeaders } from "@/lib/security";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }
    const admin = session.user.email
      ? await prisma.admin.findUnique({ where: { cpf: session.user.email.replace(/\D/g, "") } })
      : null;

    const { amount, dueDate } = await req.json();
    
    const activeMembers = await prisma.member.findMany({
      where: {
        status: "ACTIVE",
        ...(admin?.tenantId ? { tenantId: admin.tenantId } : {}),
      },
    });

    const billings = await Promise.all(
      activeMembers.map(async (member) => {
        const billing = await prisma.billing.create({
          data: {
            memberId: member.id,
            amount,
            dueDate: new Date(dueDate),
            status: "PENDING",
            tenantId: member.tenantId || admin?.tenantId || null,
          },
        });

        // Enviar notificação individual
        await sendBillingNotification(member.id, "GENERATED");
        
        return billing;
      })
    );

    await createSecurityEvent({
      tenantId: admin?.tenantId || null,
      portal: "ADMIN",
      action: "BILLING_MASS_CREATED",
      ipAddress: getRequestIpFromHeaders(req.headers),
      userAgent: req.headers.get("user-agent"),
      location: getLocationFromHeaders(req.headers),
      actorRole: session.user.role,
      actorId: admin?.id || null,
      details: `count=${billings.length} amount=${amount}`,
    });

    return NextResponse.json({ count: billings.length });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
