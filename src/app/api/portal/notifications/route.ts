import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "MEMBER") {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const notifications = await prisma.notification.findMany({
    where: { memberId: session.user.id },
    orderBy: { sentAt: "desc" },
  });

  return NextResponse.json(notifications);
}
