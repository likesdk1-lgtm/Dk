import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  console.log("BUSCANDO ASSOCIADO ID:", params.id);
  try {
    const member = await prisma.member.findUnique({
      where: { id: params.id },
      include: {
        documents: true,
        modality: true,
        billing: {
          orderBy: { dueDate: "desc" }
        },
      },
    });

    if (!member) {
      console.error("ASSOCIADO NÃO ENCONTRADO NO BANCO");
      return NextResponse.json({ error: "Associado não encontrado" }, { status: 404 });
    }

    return NextResponse.json(member);
  } catch (error: any) {
    console.error("ERRO AO BUSCAR ASSOCIADO:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const formData = await req.formData();
    const name = formData.get("name") as string;
    const cpf = (formData.get("cpf") as string)?.replace(/\D/g, "");
    const birthDateStr = formData.get("birthDate") as string;
    const healthUnit = formData.get("healthUnit") as string;
    const modalityId = formData.get("modalityId") as string;
    const whatsapp = (formData.get("whatsapp") as string || "").replace(/\D/g, "");
    const status = formData.get("status") as string;

    const updateData: any = {
      name,
      cpf,
      healthUnit,
      whatsapp: whatsapp || null,
      modalityId: modalityId || null,
      status: status || "ACTIVE",
    };

    if (birthDateStr) {
      const birthDate = new Date(birthDateStr);
      if (!isNaN(birthDate.getTime())) {
        updateData.birthDate = birthDate;
      }
    }

    // Handle Photo
    const photo = formData.get("photo") as File | null;
    if (photo && photo.size > 0) {
      const bytes = await photo.arrayBuffer();
      const buffer = Buffer.from(bytes);
      updateData.photoUrl = `data:${photo.type};base64,${buffer.toString("base64")}`;
    }

    const member = await (prisma as any).member.update({
      where: { id: params.id },
      data: updateData,
    });

    return NextResponse.json(member);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.member.delete({
      where: { id: params.id },
    });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
