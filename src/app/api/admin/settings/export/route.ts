import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withErrorLogging } from "@/lib/api-handler";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export const dynamic = "force-dynamic";

export const GET = withErrorLogging(async (req: Request) => {
  try {
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
    const tenantWhere = admin?.tenantId ? { tenantId: admin.tenantId } : {};

    // Fetch each model individually to isolate errors
    const members = await prisma.member.findMany({ where: tenantWhere as any }).catch(() => {
      return [];
    });

    const billings = await prisma.billing.findMany({ where: tenantWhere as any }).catch(e => {
      return [];
    });

    const settings = admin?.tenantId
      ? await prisma.settings.findUnique({ where: { tenantId: admin.tenantId } }).catch(() => null)
      : await prisma.settings.findFirst({ where: { tenantId: null } }).catch(() => null);

    const notifications = await prisma.notification.findMany({ where: tenantWhere as any }).catch(() => {
      return [];
    });

    const backup = {
      members,
      billings,
      settings,
      notifications,
      exportedAt: new Date().toISOString(),
      version: "1.0",
    };

    return NextResponse.json(backup);
  } catch (error: any) {
    return NextResponse.json({ 
      error: "Critical Export Error", 
      message: error.message 
    }, { status: 500 });
  }
});
