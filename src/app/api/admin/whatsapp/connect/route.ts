import { NextResponse } from "next/server";
import { getWhatsAppQRCode, disconnectWhatsApp } from "@/lib/whatsapp";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const revalidate = 0;

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

    const qrData = await getWhatsAppQRCode(admin.tenantId);
    
    return new NextResponse(JSON.stringify(qrData), {
      status: 200,
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });
  } catch (error: any) {
    console.error("[API CONNECT] Error:", error.message);
    return NextResponse.json({ 
      error: "Falha ao gerar QR Code", 
      message: error.message 
    }, { status: 500 });
  }
}

export async function DELETE() {
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

    const result = await disconnectWhatsApp(admin.tenantId);
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
