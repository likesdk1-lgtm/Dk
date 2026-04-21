import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import bcrypt from "bcryptjs";

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const data = await req.json();
    const { name, cpf, password, role } = data;

    const updateData: any = {};
    if (name) updateData.name = name;
    if (cpf) updateData.cpf = cpf.replace(/\D/g, "");
    if (role) updateData.role = role;
    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    await prisma.admin.update({
      where: { id: params.id },
      data: updateData,
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("ERRO AO ATUALIZAR ADMINISTRADOR:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const adminToDelete = await prisma.admin.findUnique({
      where: { id: params.id },
    });

    if (!adminToDelete) {
      return NextResponse.json({ error: "Administrador não encontrado." }, { status: 404 });
    }

    // Se for SUPER_ADMIN, verificar se existe mais de um
    if (adminToDelete.role === "SUPER_ADMIN") {
      const superAdminsCount = await prisma.admin.count({
        where: { role: "SUPER_ADMIN" },
      });

      if (superAdminsCount <= 1) {
        return NextResponse.json(
          { error: "Não é possível excluir o único Super Administrador do sistema." },
          { status: 400 }
        );
      }
    }

    await prisma.admin.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("ERRO AO EXCLUIR ADMINISTRADOR:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
