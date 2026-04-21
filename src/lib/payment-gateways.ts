import { prisma } from "@/lib/prisma";
import { EfiService } from "@/lib/efi";

export async function getPaymentGatewayForTenant(tenantId: string) {
  const gateway = await prisma.tenantPaymentGateway.findUnique({ where: { tenantId } });
  const provider = (gateway?.provider || "EFI").toUpperCase();

  if (provider === "EFI") {
    const settings = await prisma.settings.findFirst();
    const clientId = gateway?.efiClientId || settings?.efiClientId || process.env.EFI_CLIENT_ID;
    const clientSecret = gateway?.efiClientSecret || settings?.efiClientSecret || process.env.EFI_CLIENT_SECRET;
    const certificate = gateway?.efiCertificate || settings?.efiCertificate || process.env.EFI_CERTIFICATE_BASE64 || "";
    const pixKey = gateway?.efiPixKey || settings?.efiPixKey || process.env.EFI_PIX_KEY;
    const isSandbox = gateway?.efiSandbox ?? settings?.efiSandbox ?? (process.env.NODE_ENV === "development");

    if (!clientId || !clientSecret || !pixKey) {
      throw new Error("Gateway Efí não configurado para este sindicato");
    }

    const efi = new EfiService(
      {
        clientId,
        clientSecret,
        certificate,
        pixKey,
      },
      isSandbox
    );

    return {
      provider: "EFI",
      generatePix: efi.generatePix.bind(efi),
      generatePixCharge: efi.generatePixCharge.bind(efi),
      checkPixStatus: efi.checkPixStatus.bind(efi),
      configureWebhook: efi.configureWebhook.bind(efi),
    };
  }

  if (provider === "MERCADO_PAGO") {
    throw new Error("Gateway Mercado Pago ainda não implementado");
  }
  if (provider === "BANCO_DO_BRASIL") {
    throw new Error("Gateway Banco do Brasil ainda não implementado");
  }
  if (provider === "SICOOB") {
    throw new Error("Gateway Sicoob ainda não implementado");
  }
  if (provider === "ITAU") {
    throw new Error("Gateway Itaú ainda não implementado");
  }

  throw new Error("Gateway de pagamento inválido");
}

