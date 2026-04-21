import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const cpf = searchParams.get("cpf");

  console.log("BUSCANDO FOTO PARA CPF:", cpf);

  if (!cpf) {
    return NextResponse.json({ error: "CPF não fornecido" }, { status: 400 });
  }

  const cleanCpf = cpf.replace(/\D/g, "");
  console.log("CPF LIMPO:", cleanCpf);

  try {
    const member = await prisma.member.findFirst({
      where: { cpf: cleanCpf },
      select: { photoUrl: true, name: true }
    });

    if (member) {
      console.log("ASSOCIADO ENCONTRADO:", member.name, "TEM FOTO:", !!member.photoUrl);
      if (member.photoUrl) {
        return NextResponse.json({ 
          photoUrl: member.photoUrl,
          name: member.name 
        });
      }
      return NextResponse.json({ error: "Associado não possui foto", name: member.name }, { status: 404 });
    }

    console.log("ASSOCIADO NÃO ENCONTRADO NO BANCO");
    return NextResponse.json({ error: "Associado não encontrado" }, { status: 404 });
  } catch (error: any) {
    console.error("ERRO AO BUSCAR FOTO:", error.message);
    return NextResponse.json({ error: "Erro no servidor" }, { status: 500 });
  }
}
