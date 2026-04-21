import { prisma } from "./prisma";
import axios from "axios";

// CONFIGURAÇÃO EVOLUTION API - Usar variáveis de ambiente se possível, senão fallback para local
const EVOLUTION_URL = process.env.NEXT_PUBLIC_EVOLUTION_URL || "http://localhost:8080"; 
const API_KEY = process.env.EVOLUTION_API_KEY || "SINDICATO_TOKEN";

const axiosConfig = {
  headers: {
    apikey: API_KEY
  }
};

function getInstanceName(tenantId: string) {
  // Garante um nome de instância limpo e único por sindicato
  return `DKSIND_${tenantId.replace(/[^a-zA-Z0-9]/g, "")}`;
}

export async function checkWhatsAppStatus(tenantId: string) {
  try {
    const instanceName = getInstanceName(tenantId);
    const response = await axios.get(`${EVOLUTION_URL}/instance/connectionState/${instanceName}`, axiosConfig);
    
    const state = response.data?.instance?.state || response.data?.state;
    
    // Buscar informações do número conectado se estiver aberto
    let number = null;
    let profilePic = null;
    
    if (state === "open" || state === "CONNECTED") {
      try {
        const info = await axios.get(`${EVOLUTION_URL}/instance/fetchInstances?instanceName=${instanceName}`, axiosConfig);
        const inst = Array.isArray(info.data) ? info.data.find((i: any) => i.instanceName === instanceName) : null;
        number = inst?.owner || inst?.number;
        profilePic = inst?.profilePictureUrl;
      } catch (e) {
        console.error("Erro ao buscar detalhes da instância");
      }
    }
    
    return { 
      connected: state === "open" || state === "CONNECTED",
      state: state,
      number,
      profilePic,
      platform: "Evolution API"
    };
  } catch (error: any) {
    return { connected: false, message: "Instância não encontrada ou offline" };
  }
}

export async function getWhatsAppQRCode(tenantId: string) {
  try {
    const instanceName = getInstanceName(tenantId);
    
    // 1. Verifica status atual
    const status = await checkWhatsAppStatus(tenantId);
    if (status.connected) {
      return { connected: true, message: "WhatsApp já está conectado.", number: status.number };
    }

    // 2. Tenta criar a instância se não existir
    try {
      await axios.post(`${EVOLUTION_URL}/instance/create`, {
        instanceName: instanceName,
        qrcode: true,
        token: API_KEY,
        webhook: `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/whatsapp/${tenantId}`,
        webhook_by_events: true,
        events: [
          "MESSAGES_UPSERT",
          "MESSAGES_UPDATE",
          "MESSAGES_DELETE",
          "CONNECTION_UPDATE"
        ]
      }, axiosConfig);
    } catch (e: any) {
      // Instância já pode existir
    }

    // 3. Solicita o QR Code
    const response = await axios.get(`${EVOLUTION_URL}/instance/connect/${instanceName}`, axiosConfig);

    if (response.data?.base64) {
      return { base64: response.data.base64 };
    }
    
    return response.data; 
  } catch (error: any) {
    console.error("[WHATSAPP QR ERROR]:", error.response?.data || error.message);
    throw new Error("Erro ao gerar QR Code. Verifique se a API Evolution está rodando.");
  }
}

export async function disconnectWhatsApp(tenantId: string) {
  const instanceName = getInstanceName(tenantId);
  try {
    await axios.delete(`${EVOLUTION_URL}/instance/logout/${instanceName}`, axiosConfig);
    return { success: true };
  } catch (error: any) {
    console.error("[WHATSAPP LOGOUT ERROR]:", error.response?.data || error.message);
    // Tenta forçar o delete se o logout falhar
    try {
      await axios.delete(`${EVOLUTION_URL}/instance/delete/${instanceName}`, axiosConfig);
      return { success: true };
    } catch (e) {
      throw new Error("Falha ao desconectar WhatsApp");
    }
  }
}

function normalizeBrazilianNumber(number: string): string | null {
  const cleaned = number.replace(/\D/g, "");
  if (cleaned.length === 13 && cleaned.startsWith("55")) return cleaned;
  if (cleaned.length === 11) return `55${cleaned}`;
  return null;
}

export async function sendWhatsAppMessage(tenantId: string, to: string, message: string, adminId?: string, memberId?: string) {
  try {
    const instanceName = getInstanceName(tenantId);
    const formattedNumber = normalizeBrazilianNumber(to);
    if (!formattedNumber) throw new Error(`Número inválido: ${to}`);

    const response = await axios.post(`${EVOLUTION_URL}/message/sendText/${instanceName}`, {
      number: formattedNumber,
      textMessage: { text: message }
    }, axiosConfig);

    const messageId = response.data?.key?.id || response.data?.messageId;

    try {
      await prisma.chatMessage.create({
        data: {
          tenantId,
          remoteId: messageId,
          whatsappNumber: formattedNumber.substring(2),
          text: message,
          type: "SENT",
          status: "DELIVERED",
          adminId: adminId || null,
          memberId: memberId || null,
        }
      });
    } catch (dbError) {
      console.error("[CRM SAVE ERROR]:", dbError);
    }

    return { success: true, messageId };
  } catch (error: any) {
    console.error("[WHATSAPP SEND ERROR]:", error.message);
    return { success: false, error: error.message };
  }
}

export async function sendWhatsAppMedia(tenantId: string, to: string, mediaUrl: string, mediaType: "image" | "video" | "audio" | "document", caption?: string, fileName?: string, adminId?: string, memberId?: string) {
  try {
    const instanceName = getInstanceName(tenantId);
    const formattedNumber = normalizeBrazilianNumber(to);
    if (!formattedNumber) throw new Error(`Número inválido: ${to}`);

    const base64Data = mediaUrl.includes(";base64,") ? mediaUrl.split(";base64,").pop() : mediaUrl;

    const response = await axios.post(`${EVOLUTION_URL}/message/sendMedia/${instanceName}`, {
      number: formattedNumber,
      mediatype: mediaType,
      media: base64Data,
      caption: caption || "",
      fileName: fileName || "file"
    }, axiosConfig);

    const messageId = response.data?.key?.id || response.data?.messageId;

    try {
      await prisma.chatMessage.create({
        data: {
          tenantId,
          remoteId: messageId,
          whatsappNumber: formattedNumber.substring(2),
          text: caption || `[Mídia: ${mediaType.toUpperCase()}]`,
          type: "SENT",
          status: "DELIVERED",
          mediaUrl,
          mediaType: mediaType.toUpperCase(),
          caption,
          fileName,
          adminId: adminId || null,
          memberId: memberId || null,
        }
      });
    } catch (dbError) {
      console.error("[CRM MEDIA SAVE ERROR]:", dbError);
    }

    return { success: true, messageId };
  } catch (error: any) {
    return { success: false, error: error.response?.data?.message || error.message };
  }
}
