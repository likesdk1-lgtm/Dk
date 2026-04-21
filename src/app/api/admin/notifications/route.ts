import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const notifications = await prisma.notification.findMany({
      orderBy: { sentAt: "desc" },
      take: 50,
    });
    return NextResponse.json(notifications);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const title = formData.get("title") as string;
    const message = formData.get("message") as string;
    const channel = formData.get("channel") as string;
    const memberIdInput = formData.get("memberId") as string;
    const file = formData.get("file") as File;

    let targetMembers = [];
    if (memberIdInput) {
      const member = await prisma.member.findFirst({
        where: {
          OR: [
            { cpf: memberIdInput.replace(/\D/g, "") },
            { registrationNum: memberIdInput },
          ],
        },
      });
      if (member) targetMembers.push(member);
    } else {
      targetMembers = await prisma.member.findMany({
        where: { status: "ACTIVE" },
      });
    }

    if (targetMembers.length === 0) {
      return NextResponse.json({ error: "Nenhum associado encontrado" }, { status: 400 });
    }

    const fileUrl = file ? `/uploads/notifications/${Date.now()}-${file.name}` : null;

    const notifications = await Promise.all(
      targetMembers.map((member) => {
        // Personalize message if tag {nome} exists
        const personalizedMessage = message.replace(/{nome}/g, member.name.split(" ")[0]);

        return prisma.notification.create({
          data: {
            title,
            message: personalizedMessage,
            channel,
            fileUrl,
            memberId: member.id,
          },
        });
      })
    );

    return NextResponse.json({ count: notifications.length });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
