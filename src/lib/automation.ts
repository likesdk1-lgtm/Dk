import { prisma } from "./prisma";
import { sendWhatsAppMessage } from "./whatsapp";

export async function sendBillingNotification(memberId: string, type: "GENERATED" | "REMINDER_3_DAYS" | "REMINDER_15_DAYS") {
  try {
    const member = await prisma.member.findUnique({
      where: { id: memberId }
    });

    if (!member || !member.whatsapp) return;
    if (!member.tenantId) return;

    const settings = await prisma.settings.findUnique({
      where: { tenantId: member.tenantId }
    });
    if (!settings || !settings.automationEnabled) return;

    let messageTemplate = "";
    if (type === "GENERATED") {
      messageTemplate = settings.billingGeneratedMessage || "Olá {nome}, sua mensalidade do sindicato já está disponível!";
    } else if (type === "REMINDER_3_DAYS") {
      messageTemplate = settings.billingReminder3DaysMessage || "Olá {nome}, notamos que sua mensalidade ainda não foi paga (3 dias de atraso).";
    } else if (type === "REMINDER_15_DAYS") {
      messageTemplate = settings.billingReminder15DaysMessage || "Olá {nome}, sua mensalidade está com 15 dias de atraso. Por favor, regularize sua situação.";
    }

    const finalMessage = messageTemplate.replace("{nome}", member.name.split(" ")[0]);

    await sendWhatsAppMessage(member.tenantId, member.whatsapp, finalMessage, undefined, member.id);

    // Também registra uma notificação formal
    await prisma.notification.create({
      data: {
        title: "Cobrança WhatsApp",
        message: finalMessage,
        channel: "WHATSAPP",
        memberId: member.id,
      }
    });

  } catch (error) {
    console.error("[AUTOMATION] Erro ao enviar notificação de cobrança:", error);
  }
}
