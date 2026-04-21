import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request, { params }: { params: { tenantId: string } }) {
  try {
    const { tenantId } = params;
    const body = await req.json();

    console.log(`[WHATSAPP WEBHOOK] Received event: ${body.event} for tenant: ${tenantId}`);

    if (body.event === "messages.upsert") {
      const message = body.data;
      const fromMe = message.key.fromMe;
      
      // Se a mensagem for de um grupo, podemos ignorar se o usuário não quiser
      if (message.key.remoteJid.includes("@g.us")) {
        // Lógica para grupos se necessário
      }

      const whatsappNumber = message.key.remoteJid.split("@")[0];
      const text = message.message?.conversation || 
                   message.message?.extendedTextMessage?.text || 
                   message.message?.imageMessage?.caption || "";
      
      const mediaType = message.message?.imageMessage ? "IMAGE" :
                        message.message?.videoMessage ? "VIDEO" :
                        message.message?.audioMessage ? "AUDIO" :
                        message.message?.documentMessage ? "DOCUMENT" : null;

      // Tenta encontrar o associado pelo número de whatsapp
      const member = await prisma.member.findFirst({
        where: { 
          whatsapp: { contains: whatsappNumber },
          tenantId 
        }
      });

      // Salva a mensagem recebida
      await prisma.chatMessage.create({
        data: {
          tenantId,
          whatsappNumber,
          text,
          type: fromMe ? "SENT" : "RECEIVED",
          status: "DELIVERED",
          remoteId: message.key.id,
          memberId: member?.id || null,
          mediaType,
          isGroup: message.key.remoteJid.includes("@g.us"),
        }
      });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("[WHATSAPP WEBHOOK ERROR]:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
