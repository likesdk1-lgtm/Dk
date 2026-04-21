import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withErrorLogging } from "@/lib/api-handler";
import { sendWhatsAppMessage, sendWhatsAppMedia, checkWhatsAppStatus } from "@/lib/whatsapp";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const admin = await prisma.admin.findUnique({
    where: { cpf: session.user.email?.replace(/\D/g, "") }
  });

  if (!admin?.tenantId) {
    return NextResponse.json({ error: "Sindicato não localizado" }, { status: 404 });
  }

  const tenantId = admin.tenantId;

  // Check Status
  const status = await checkWhatsAppStatus(tenantId);

  // Get all unique numbers from ChatMessage for this tenant
  const messages = await prisma.chatMessage.findMany({
    where: { tenantId },
    orderBy: { createdAt: "desc" },
    include: { 
      member: { select: { name: true, registrationNum: true, photoUrl: true, id: true, whatsapp: true } },
      admin: { select: { name: true } }
    },
  });

  // Get unread counts per number
  const unreadCounts = await prisma.chatMessage.groupBy({
    by: ['whatsappNumber'],
    where: {
      tenantId,
      type: 'RECEIVED',
      status: 'DELIVERED'
    },
    _count: {
      id: true
    }
  });

  const unreadMap = new Map(unreadCounts.map(u => [u.whatsappNumber, u._count.id]));

  // Combine them into "Conversations"
  const conversationsMap = new Map();
  
  messages.forEach((msg: any) => {
    if (!conversationsMap.has(msg.whatsappNumber)) {
      conversationsMap.set(msg.whatsappNumber, {
        number: msg.whatsappNumber,
        member: msg.member,
        lastMessage: msg.text || (msg.mediaType ? `[${msg.mediaType}]` : ""),
        lastUpdate: msg.createdAt,
        lastAdmin: msg.admin?.name,
        isGroup: msg.isGroup,
        groupName: msg.groupName,
        unreadCount: unreadMap.get(msg.whatsappNumber) || 0
      });
    }
  });

  // Get members with whatsapp saved for this tenant
  const membersWithWhatsapp = await prisma.member.findMany({
    where: { 
      tenantId,
      whatsapp: { not: null } 
    },
  });

  // Add members who don't have messages yet
  membersWithWhatsapp.forEach((m: any) => {
    if (!conversationsMap.has(m.whatsapp)) {
      conversationsMap.set(m.whatsapp, {
        number: m.whatsapp,
        member: m,
        lastMessage: "",
        lastUpdate: m.updatedAt,
      });
    }
  });

  const conversations = Array.from(conversationsMap.values());

  return NextResponse.json({ conversations, status });
}

export const POST = withErrorLogging(async (req: Request) => {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const admin = await prisma.admin.findUnique({
    where: { cpf: session.user.email?.replace(/\D/g, "") }
  });

  if (!admin?.tenantId) {
    return NextResponse.json({ error: "Sindicato não localizado" }, { status: 404 });
  }

  const { number, text, mediaUrl, mediaType, caption, fileName, memberId } = await req.json();

  if (!number) {
    return NextResponse.json({ error: "Número é obrigatório" }, { status: 400 });
  }

  let result;
  if (mediaUrl && mediaType) {
    // Envio de mídia
    result = await sendWhatsAppMedia(
      admin.tenantId,
      number, 
      mediaUrl, 
      mediaType.toLowerCase() as any, 
      caption || text, 
      fileName,
      admin.id,
      memberId
    );
  } else {
    // Envio de texto
    if (!text) return NextResponse.json({ error: "Texto é obrigatório" }, { status: 400 });
    result = await sendWhatsAppMessage(admin.tenantId, number, text, admin.id, memberId);
  }

  return NextResponse.json(result);
});

export const PATCH = withErrorLogging(async (req: Request) => {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const admin = await prisma.admin.findUnique({
    where: { cpf: session.user.email?.replace(/\D/g, "") }
  });

  if (!admin?.tenantId) {
    return NextResponse.json({ error: "Sindicato não localizado" }, { status: 404 });
  }

  // Associate a number with a member via Registration Number or CPF
  const { number, registrationNum, cpf } = await req.json();

  let member = null;
  if (registrationNum) {
    member = await prisma.member.findFirst({
      where: { 
        registrationNum,
        tenantId: admin.tenantId
      },
    });
  } else if (cpf) {
    member = await prisma.member.findFirst({
      where: { 
        cpf: cpf.replace(/\D/g, ""),
        tenantId: admin.tenantId
      },
    });
  }

  if (!member) {
    return NextResponse.json({ error: "Associado não encontrado" }, { status: 404 });
  }

  // Update member's whatsapp number
  await prisma.member.update({
    where: { id: member.id },
    data: { whatsapp: number },
  });

  // Update all messages from this number to be associated with this member for this tenant
  await prisma.chatMessage.updateMany({
    where: { 
      whatsappNumber: number,
      tenantId: admin.tenantId
    },
    data: { memberId: member.id },
  });

  return NextResponse.json({ success: true, member });
});
