import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { createSecurityEvent, getLocationFromHeaders, getRequestIpFromHeaders } from "@/lib/security";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const admin = session.user.email
      ? await prisma.admin.findUnique({ where: { cpf: session.user.email.replace(/\D/g, "") } })
      : null;

    const tenantId = admin?.tenantId;

    let settings: any = null;
    
    if (tenantId) {
      settings = await prisma.settings.findUnique({
        where: { tenantId }
      });
    } else {
      // Fallback para global se for super admin sem tenant
      settings = await prisma.settings.findFirst({
        where: { tenantId: null }
      });
    }
    
    if (settings) {
      if (settings.homePageContent && typeof settings.homePageContent === "string") {
        try { settings.homePageContent = JSON.parse(settings.homePageContent); } catch (e) {}
      }
      if (settings.cardDesign && typeof settings.cardDesign === "string") {
        try { settings.cardDesign = JSON.parse(settings.cardDesign); } catch (e) {}
      }
      if (settings.footerContent && typeof settings.footerContent === "string") {
        try { settings.footerContent = JSON.parse(settings.footerContent); } catch (e) {}
      }
      settings.efiSandbox = settings.efiSandbox === 1 || settings.efiSandbox === true;
    }

    return new NextResponse(JSON.stringify(settings || { unionName: "SINTASB-PI" }), {
      status: 200,
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });
  } catch (error) {
    return NextResponse.json({ unionName: "SINTASB-PI" });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }
    const admin = session.user.email
      ? await prisma.admin.findUnique({ where: { cpf: session.user.email.replace(/\D/g, "") } })
      : null;

    const tenantId = admin?.tenantId;
    const data = await req.json();
    console.log("[SETTINGS] Saving settings for tenant:", tenantId);

    // 1. MAPEAMENTO E SANITIZAÇÃO
    const updateData: any = {
      unionName: String(data.unionName || "SINTASB-PI"),
      initials: data.initials || null,
      logoUrl: data.logoUrl || null,
      googleAnalyticsId: data.googleAnalyticsId || null,
      whatsAppToken: data.whatsAppToken || null,
      whatsAppNumber: data.whatsAppNumber || null,
      whatsAppInstance: data.whatsAppInstance || null,
      whatsAppApiKey: data.whatsAppApiKey || null,
      supportLink: data.supportLink || null,
      efiClientId: data.efiClientId || null,
      efiClientSecret: data.efiClientSecret || null,
      efiPixKey: data.efiPixKey || null,
      efiSandbox: data.efiSandbox === true,
      efiCertificate: data.efiCertificate || null,
      instagramAccount: data.instagramAccount || null,
      youtubeAccount: data.youtubeAccount || null,
      facebookAccount: data.facebookAccount || null,
      billingGeneratedMessage: data.billingGeneratedMessage || null,
      billingReminder3DaysMessage: data.billingReminder3DaysMessage || null,
      billingReminder15DaysMessage: data.billingReminder15DaysMessage || null,
      automationEnabled: data.automationEnabled === true,
      monthlyGoal: parseFloat(String(data.monthlyGoal || 0).replace(",", ".")) || 0,
      cardDesign: data.cardDesign ? JSON.stringify(data.cardDesign) : null,
      homePageContent: data.homePageContent ? JSON.stringify(data.homePageContent) : null,
      footerContent: data.footerContent ? JSON.stringify(data.footerContent) : null,
    };

    let result;
    if (tenantId) {
      result = await prisma.settings.upsert({
        where: { tenantId },
        update: updateData,
        create: { ...updateData, tenantId },
      });
      
      // Também atualiza a sigla no model Tenant para facilitar consultas
      if (data.initials) {
        await prisma.tenant.update({
          where: { id: tenantId },
          data: { initials: data.initials }
        });
      }
    } else {
      // Se não tiver tenantId (super admin global)
      result = await prisma.settings.upsert({
        where: { id: "global" }, // Mantendo compatibilidade com o ID antigo se necessário, mas agora id é CUID
        update: updateData,
        create: { ...updateData, id: "global" },
      });
    }

    if (result) {
      if (result.homePageContent) result.homePageContent = JSON.parse(result.homePageContent);
      if (result.cardDesign) result.cardDesign = JSON.parse(result.cardDesign);
      if (result.footerContent) result.footerContent = JSON.parse(result.footerContent);
    }

    await createSecurityEvent({
      tenantId: admin?.tenantId || null,
      portal: "ADMIN",
      action: "SETTINGS_UPDATED",
      ipAddress: getRequestIpFromHeaders(req.headers),
      userAgent: req.headers.get("user-agent"),
      location: getLocationFromHeaders(req.headers),
      actorRole: session.user.role,
      actorId: admin?.id || null,
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("[SETTINGS] ERROR:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
