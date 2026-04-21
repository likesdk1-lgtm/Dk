import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const cpf = searchParams.get("cpf")?.replace(/\D/g, "");

  if (!cpf) return NextResponse.json({ error: "CPF não fornecido" }, { status: 400 });

  const member = await prisma.member.findUnique({
    where: { cpf },
    select: { photoUrl: true },
  });

  if (!member) return NextResponse.json({ error: "Membro não encontrado" }, { status: 404 });

  return NextResponse.json({ photoUrl: member.photoUrl });
}
