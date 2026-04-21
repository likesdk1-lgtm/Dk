import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const event = (data.event || data.type || "").toUpperCase();
    
    // Log agressivo para depuração
    console.log(`[WHATSAPP WEBHOOK] Evento: ${event}`, JSON.stringify(data, null, 2));

    // Processar atualização de conexão
    if (event.includes("CONNECTION_UPDATE")) {
      const state = data.data?.state;
      console.log(`[WHATSAPP WEBHOOK] Estado da conexão alterado para: ${state}`);
      if (state === "close") {
        console.log("[WHATSAPP WEBHOOK] Conexão fechada! Uma tentativa de reconexão pode ser necessária.");
      }
      return NextResponse.json({ success: true });
    }

    // Processar mensagens (UPSERT ou SEND)
    if (event.includes("MESSAGES_UPSERT") || event.includes("SEND_MESSAGE") || event.includes("MESSAGES_CREATE")) {
      const messageData = data.data || data;
      const key = messageData.key || messageData.message?.key || (messageData.messages && messageData.messages[0]?.key);
      const message = messageData.message || (messageData.messages && messageData.messages[0]?.message) || messageData;

      if (!key) {
        return NextResponse.json({ success: true, message: "Key not found in payload" });
      }

      // Evitar duplicidade de mensagens enviadas por nós mesmos
      if (key.fromMe && !event.includes("SEND_MESSAGE")) {
        return NextResponse.json({ success: true, message: "Ignored self-message in upsert" });
      }

      const remoteJid = key.remoteJid;
      const isGroup = remoteJid.endsWith("@g.us");
      const number = remoteJid.split("@")[0];
      
      // Extração resiliente de conteúdo
      let text = "";
      let mediaType = null;
      let mediaUrl = data.data?.base64 || data.data?.url || null;
      let fileName = null;
      let caption = null;

      const msgContent = message?.viewOnceMessage?.message || 
                         message?.viewOnceMessageV2?.message || 
                         message?.message || 
                         message;

      if (msgContent?.conversation) {
        text = msgContent.conversation;
      } else if (msgContent?.extendedTextMessage?.text) {
        text = msgContent.extendedTextMessage.text;
      } else if (msgContent?.imageMessage) {
        mediaType = "IMAGE";
        caption = msgContent.imageMessage.caption || "";
        text = caption;
      } else if (msgContent?.videoMessage) {
        mediaType = "VIDEO";
        caption = msgContent.videoMessage.caption || "";
        text = caption;
      } else if (msgContent?.audioMessage) {
        mediaType = "AUDIO";
        text = "[Áudio]";
      } else if (msgContent?.documentMessage) {
        mediaType = "DOCUMENT";
        fileName = msgContent.documentMessage.fileName || "documento";
        caption = msgContent.documentMessage.caption || "";
        text = caption || fileName;
      }

      if (!text && !mediaType) {
        return NextResponse.json({ success: true, message: "No text or media content identified" });
      }

      // Tenta encontrar o membro
      let member = null;
      if (!isGroup) {
        member = await prisma.member.findFirst({
          where: { whatsapp: { contains: number } },
        });
      }

      // Persistência no banco com suporte a auditoria e grupos
      const remoteId = key.id || key.messageId;
      
      try {
        await prisma.chatMessage.upsert({
          where: { remoteId: remoteId || "unknown_" + Date.now() },
          update: {
            status: "DELIVERED",
            text: text || null,
            mediaType,
            mediaUrl,
            caption,
            fileName,
          },
          create: {
            remoteId: remoteId,
            whatsappNumber: number,
            text: text || null,
            type: key.fromMe ? "SENT" : "RECEIVED",
            mediaType,
            mediaUrl,
            caption,
            fileName,
            memberId: member?.id || null,
            isGroup: isGroup,
            groupName: isGroup ? (data.data?.pushName || "Grupo WhatsApp") : null,
          },
        });

        // Registrar na auditoria se for uma mensagem importante (ex: com mídia ou de grupo)
        if (mediaType || isGroup) {
          await prisma.auditLog.create({
            data: {
              action: "MESSAGE_RECEIVED",
              resource: "CHAT",
              details: JSON.stringify({
                number,
                isGroup,
                mediaType,
                remoteId
              })
            }
          });
        }
      } catch (dbError) {
        console.error("[WHATSAPP WEBHOOK DB ERROR]:", dbError);
      }

      console.log(`[CRM SAVED] ${key.fromMe ? "ENVIADA" : "RECEBIDA"} - ${number}: ${text}`);
      return NextResponse.json({ success: true });
    }

    // Processar atualizações de status da mensagem (Entregue, Lida)
    if (event.includes("MESSAGES_UPDATE")) {
      const updates = data.data || [];
      for (const update of (Array.isArray(updates) ? updates : [updates])) {
        const remoteId = update.key?.id || update.id;
        const status = update.update?.status || update.status;
        
        if (remoteId && status) {
          let dbStatus = "DELIVERED";
          if (status === 3 || status === "READ") dbStatus = "READ";
          if (status === 2 || status === "DELIVERED") dbStatus = "DELIVERED";

          await prisma.chatMessage.updateMany({
            where: { remoteId: remoteId },
            data: { status: dbStatus }
          });
        }
      }
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ success: true, message: "Event not processed" });
  } catch (error: any) {
    console.error("[WHATSAPP WEBHOOK ERROR]:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
