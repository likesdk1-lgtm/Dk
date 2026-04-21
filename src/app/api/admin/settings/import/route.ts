import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withErrorLogging } from "@/lib/api-handler";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { createSecurityEvent, getLocationFromHeaders, getRequestIpFromHeaders } from "@/lib/security";

export const POST = withErrorLogging(async (req: Request) => {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }
    const admin = session.user.email
      ? await prisma.admin.findUnique({ where: { cpf: session.user.email.replace(/\D/g, "") } })
      : null;
    const tenantId = admin?.tenantId || null;

    const data = await req.json();
    const { members, billings, settings, notifications } = data;

    // Use a transaction to ensure data integrity
    await prisma.$transaction(async (tx) => {
      // Clear existing data (Optional: user might want to merge, but overwrite is safer for backup/restore)
      // Be careful with foreign key constraints in SQLite
      if (!tenantId) {
        await tx.notification.deleteMany();
        await tx.billing.deleteMany();
        await tx.member.deleteMany();
      } else {
        await tx.billing.deleteMany({ where: { tenantId } as any });
        await tx.member.deleteMany({ where: { tenantId } as any });
      }
      
      // Import Members
      if (members && Array.isArray(members)) {
        for (const member of members) {
          const { birthDate, createdAt, updatedAt, ...rest } = member;
          await tx.member.create({
            data: {
              ...rest,
              birthDate: new Date(birthDate),
              createdAt: new Date(createdAt),
              updatedAt: new Date(updatedAt),
              ...(tenantId ? { tenantId } : {}),
            },
          });
        }
      }

      // Import Billings
      if (billings && Array.isArray(billings)) {
        for (const bill of billings) {
          const { dueDate, paymentDate, createdAt, updatedAt, ...rest } = bill;
          await tx.billing.create({
            data: {
              ...rest,
              dueDate: new Date(dueDate),
              paymentDate: paymentDate ? new Date(paymentDate) : null,
              createdAt: new Date(createdAt),
              updatedAt: new Date(updatedAt),
              ...(tenantId ? { tenantId } : {}),
            },
          });
        }
      }

      // Import Settings
      if (settings) {
        const { id, createdAt, updatedAt, ...rest } = settings;
        await tx.settings.upsert({
          where: { id: "global" },
          update: rest,
          create: { ...rest, id: "global" },
        });
      }

      // Import Notifications
      if (notifications && Array.isArray(notifications)) {
        if (tenantId) return;
        for (const notif of notifications) {
          const { sentAt, ...rest } = notif;
          await tx.notification.create({
            data: {
              ...rest,
              sentAt: new Date(sentAt),
            },
          });
        }
      }
    });

    await createSecurityEvent({
      tenantId,
      portal: "ADMIN",
      action: "DATA_IMPORTED",
      ipAddress: getRequestIpFromHeaders(req.headers),
      userAgent: req.headers.get("user-agent"),
      location: getLocationFromHeaders(req.headers),
      actorRole: session.user.role,
      actorId: admin?.id || null,
      details: `members=${Array.isArray(members) ? members.length : 0} billings=${Array.isArray(billings) ? billings.length : 0}`,
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Import Error:", error);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
});
