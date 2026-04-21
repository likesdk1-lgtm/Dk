import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    console.log("[ADMIN CHECKIN API] Início da requisição POST");
    const session = await getServerSession(authOptions);

    if (!session) {
      console.error("[ADMIN CHECKIN API] ERRO: Sessão não encontrada.");
      return NextResponse.json({ error: "Sessão não encontrada" }, { status: 401 });
    }

    console.log("[ADMIN CHECKIN API] Sessão detectada:", JSON.stringify({
      id: session?.user?.id,
      email: session?.user?.email,
      role: session?.user?.role
    }, null, 2));

    // Permitindo ADMIN, SUPER_ADMIN e APOIO
    const allowedRoles = ["ADMIN", "SUPER_ADMIN", "APOIO"];
    if (!allowedRoles.includes(session.user.role as string)) {
      console.error("[ADMIN CHECKIN API] ERRO: Role não autorizado. Role atual:", session?.user?.role);
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { qrData } = await req.json();

    if (!qrData) {
      return NextResponse.json({ error: "Dados do QR Code não fornecidos" }, { status: 400 });
    }

    let parsedData;
    try {
      parsedData = JSON.parse(qrData);
    } catch (e) {
      // Se não for JSON, tenta tratar como o registrationNum direto (fallback)
      parsedData = { registration: qrData };
    }

    const registration = parsedData.registration;

    if (!registration) {
      return NextResponse.json({ error: "Número de matrícula não encontrado no QR Code" }, { status: 400 });
    }

    const member = await prisma.member.findUnique({
      where: { registrationNum: registration },
      select: {
        id: true,
        name: true,
        cpf: true,
        registrationNum: true,
        status: true,
        photoUrl: true,
      },
    });

    if (!member) {
      return NextResponse.json({ error: "Associado não localizado" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      member,
      isValid: member.status === "ACTIVE",
      timestamp: new Date().toISOString(),
    });

  } catch (error: any) {
    console.error("[ADMIN CHECKIN API] ERRO:", error);
    return NextResponse.json({ 
      error: "Erro interno ao validar check-in",
      details: error.message 
    }, { status: 500 });
  }
}
