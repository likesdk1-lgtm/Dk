import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const [adminLogs, memberLogs] = await Promise.all([
      prisma.log.findMany({
        orderBy: { createdAt: "desc" },
        include: { admin: { select: { name: true } } },
      }),
      prisma.memberLog.findMany({
        orderBy: { createdAt: "desc" },
        include: { member: { select: { name: true, photoUrl: true } } },
      }),
    ]);

    // Transform and combine logs
    const combinedLogs = [
      ...adminLogs.map(log => ({
        ...log,
        type: "ADMIN",
        userName: log.admin.name,
        userPhoto: null, // Admins don't have photos in current schema
      })),
      ...memberLogs.map(log => ({
        ...log,
        type: "MEMBER",
        userName: log.member.name,
        userPhoto: log.member.photoUrl,
      })),
    ].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    return NextResponse.json(combinedLogs);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
