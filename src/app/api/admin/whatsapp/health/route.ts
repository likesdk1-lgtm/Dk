import { NextResponse } from "next/server";
import { checkWhatsAppStatus, getWhatsAppQRCode } from "@/lib/whatsapp";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const admin = await prisma.admin.findUnique({
      where: { cpf: session.user.email?.replace(/\D/g, "") }
    });

    if (!admin?.tenantId) {
      return NextResponse.json({ error: "Sindicato não localizado" }, { status: 404 });
    }

    const status = await checkWhatsAppStatus(admin.tenantId);

    if (status.connected) {
      return NextResponse.json({ 
        success: true, 
        state: status.state, 
        number: status.number,
        profilePic: status.profilePic,
        message: "A conexão com o WhatsApp está ativa." 
      });
    }

    // Se não estiver conectado, tenta gerar um novo QR Code para forçar a reconexão
    console.log(`[HEALTH CHECK] Conexão inativa para tenant ${admin.tenantId}. Tentando forçar reconexão...`);
    await getWhatsAppQRCode(admin.tenantId); 

    const newStatus = await checkWhatsAppStatus(admin.tenantId);

    return NextResponse.json({
      success: newStatus.connected,
      state: newStatus.state,
      number: newStatus.number,
      profilePic: newStatus.profilePic,
      message: newStatus.connected ? "Reconexão bem-sucedida!" : "Falha ao reconectar. Verifique o painel."
    }, { status: newStatus.connected ? 200 : 500 });

  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
