import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const tenantId = searchParams.get("tenantId");
  const portal = searchParams.get("portal");
  const action = searchParams.get("action");
  const limit = Math.min(Number(searchParams.get("limit") || 200), 500);

  const where: any = {};
  if (tenantId) where.tenantId = tenantId;
  if (portal) where.portal = portal;
  if (action) where.action = action;

  const events = await prisma.securityEvent.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: limit,
  });

  return NextResponse.json({ events });
}

