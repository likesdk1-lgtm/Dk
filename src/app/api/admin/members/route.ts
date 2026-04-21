import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateMatricula } from "@/lib/utils";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { createSecurityEvent, getLocationFromHeaders, getRequestIpFromHeaders } from "@/lib/security";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }
    const admin = session.user.email
      ? await prisma.admin.findUnique({ where: { cpf: session.user.email.replace(/\D/g, "") } })
      : null;

    const members = await prisma.member.findMany({
      where: admin?.tenantId ? { tenantId: admin.tenantId } : undefined,
      include: {
        modality: true,
      },
      orderBy: { name: "asc" },
    });
    return NextResponse.json(members);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
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

    console.log("INICIANDO CADASTRO DE MEMBRO...");
    const formData = await req.formData();
    const name = formData.get("name") as string;
    const cpf = (formData.get("cpf") as string).replace(/\D/g, "");
    const birthDateStr = formData.get("birthDate") as string;
    
    console.log(`DADOS RECEBIDOS: Nome=${name}, CPF=${cpf}, Data=${birthDateStr}`);

    const birthDate = new Date(birthDateStr);
    if (isNaN(birthDate.getTime())) {
      console.error("ERRO: Data de nascimento inválida", birthDateStr);
      throw new Error("Data de nascimento inválida.");
    }

    const institution = formData.get("institution") as string;
    const modalityId = formData.get("modalityId") as string;
    const whatsapp = (formData.get("whatsapp") as string || "").replace(/\D/g, "");
    const registrationMode = (formData.get("registrationMode") as string) || "AUTO";
    let registrationNum = formData.get("registrationNum") as string;
    
    // Handle Photo
    const photo = formData.get("photo") as File | null;
    let photoUrl = null;
    if (photo && photo.size > 0) {
      console.log(`PROCESSANDO FOTO: ${photo.name}, tamanho=${photo.size}`);
      const bytes = await photo.arrayBuffer();
      const buffer = Buffer.from(bytes);
      photoUrl = `data:${photo.type};base64,${buffer.toString("base64")}`;
    }

    // Geração de Matrícula
    if (registrationMode === "AUTO") {
      console.log("GERANDO MATRÍCULA AUTOMÁTICA...");
      const lastMember = await prisma.member.findFirst({
        where: {
          registrationNum: { startsWith: "6039" },
          ...(admin?.tenantId ? { tenantId: admin.tenantId } : {}),
        },
        orderBy: { registrationNum: "desc" },
      });
      
      let nextId = 1;
      if (lastMember) {
        const lastNum = parseInt(lastMember.registrationNum.replace("6039", ""));
        if (!isNaN(lastNum)) nextId = lastNum + 1;
      }
      registrationNum = generateMatricula(nextId);
      console.log(`MATRÍCULA GERADA: ${registrationNum}`);
    } else {
      console.log(`USANDO MATRÍCULA MANUAL: ${registrationNum}`);
      if (!registrationNum) {
        throw new Error("Matrícula manual é obrigatória quando o modo manual é selecionado.");
      }
    }

    console.log("SALVANDO NO BANCO DE DADOS...");
    const member = await (prisma as any).member.create({
      data: {
        id: `member_${Math.random().toString(36).substr(2, 9)}`, // ID manual para evitar erros de CUID
        name,
        cpf,
        birthDate,
        institution,
        registrationNum,
        registrationMode,
        photoUrl,
        whatsapp: whatsapp || null,
        modalityId: modalityId || null,
        status: "ACTIVE",
        tenantId: admin?.tenantId || null,
      },
    });
    console.log("MEMBRO SALVO COM SUCESSO!", member.id);

    await createSecurityEvent({
      tenantId: admin?.tenantId || null,
      portal: "ADMIN",
      action: "MEMBER_CREATED",
      ipAddress: getRequestIpFromHeaders(req.headers),
      userAgent: req.headers.get("user-agent"),
      location: getLocationFromHeaders(req.headers),
      actorRole: session.user.role,
      actorId: admin?.id || null,
      details: `memberId=${member.id}`,
    });

    return NextResponse.json(member);
  } catch (error: any) {
    console.error("FALHA CRÍTICA NO CADASTRO:", error);
    return NextResponse.json({ 
      error: `FALHA NO BANCO: ${error.message}`,
      details: error.code || "Sem código de erro"
    }, { status: 500 });
  }
}
