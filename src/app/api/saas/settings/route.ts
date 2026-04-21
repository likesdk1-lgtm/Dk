import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { createSecurityEvent, getRequestIpFromHeaders } from "@/lib/security";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }
  const settings = await prisma.settings.findFirst();
  return NextResponse.json({ settings });
}

export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }
  const data = await req.json();
  const updated = await prisma.settings.upsert({
    where: { id: "global" },
    update: {
      efiClientId: data.efiClientId ?? undefined,
      efiClientSecret: data.efiClientSecret ?? undefined,
      efiPixKey: data.efiPixKey ?? undefined,
      efiCertificate: data.efiCertificate ?? undefined,
      efiSandbox: typeof data.efiSandbox === "boolean" ? data.efiSandbox : undefined,
    },
    create: {
      id: "global",
      unionName: "Dk Sind",
      efiClientId: data.efiClientId ?? null,
      efiClientSecret: data.efiClientSecret ?? null,
      efiPixKey: data.efiPixKey ?? null,
      efiCertificate: data.efiCertificate ?? null,
      efiSandbox: typeof data.efiSandbox === "boolean" ? data.efiSandbox : true,
    },
  });

  const h = headers();
  await createSecurityEvent({
    tenantId: null,
    portal: "SAAS",
    action: "SAAS_GATEWAY_SETTINGS_UPDATED",
    ipAddress: getRequestIpFromHeaders(h),
    userAgent: h.get("user-agent"),
    actorRole: session.user.role,
    actorId: session.user.id,
    details: `gateway=EFI sandbox=${Boolean(updated.efiSandbox)} cert=${updated.efiCertificate ? "YES" : "NO"}`,
  });

  return NextResponse.json({ settings: updated });
}
