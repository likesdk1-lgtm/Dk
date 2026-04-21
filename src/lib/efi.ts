import axios from "axios";
import https from "https";
import { prisma } from "@/lib/prisma";

export interface EfiCredentials {
  clientId: string;
  clientSecret: string;
  certificate: string; // Base64 string of the .p12 certificate
  pixKey: string;
}

export type PixDebtor =
  | { cpf: string; nome: string }
  | { cnpj: string; nome: string };

export class EfiService {
  private baseUrl: string;
  private credentials: EfiCredentials;
  private token: string | null = null;

  constructor(credentials: EfiCredentials, isSandbox = false) {
    this.credentials = credentials;
    this.baseUrl = isSandbox
      ? "https://pix-h.gerencianet.com.br"
      : "https://pix.gerencianet.com.br";
  }

  private getHttpsAgent() {
    if (!this.credentials.certificate) {
      return new https.Agent();
    }

    const certBuffer = Buffer.from(this.credentials.certificate, "base64");
    return new https.Agent({
      pfx: certBuffer,
      passphrase: "", // Certificate password if any
    });
  }

  private async authenticate() {
    const auth = Buffer.from(
      `${this.credentials.clientId}:${this.credentials.clientSecret}`
    ).toString("base64");

    const response = await axios.post(
      `${this.baseUrl}/oauth/token`,
      { grant_type: "client_credentials" },
      {
        headers: {
          Authorization: `Basic ${auth}`,
          "Content-Type": "application/json",
        },
        httpsAgent: this.getHttpsAgent(),
      }
    );

    this.token = response.data.access_token;
  }

  public async generatePixCharge(input: {
    amount: number;
    description: string;
    debtor?: PixDebtor;
    expiresInSeconds?: number;
  }) {
    if (!this.token) await this.authenticate();

    const expiracao = input.expiresInSeconds ?? 3600;
    const payload: any = {
      calendario: { expiracao },
      valor: { original: input.amount.toFixed(2) },
      chave: this.credentials.pixKey,
      solicitacaoPagador: input.description,
    };

    if (input.debtor) {
      if ("cpf" in input.debtor) {
        payload.devedor = {
          cpf: input.debtor.cpf.replace(/\D/g, ""),
          nome: input.debtor.nome,
        };
      } else {
        payload.devedor = {
          cnpj: input.debtor.cnpj.replace(/\D/g, ""),
          nome: input.debtor.nome,
        };
      }
    }

    const response = await axios.post(`${this.baseUrl}/v2/cob`, payload, {
      headers: {
        Authorization: `Bearer ${this.token}`,
        "Content-Type": "application/json",
      },
      httpsAgent: this.getHttpsAgent(),
    });

    const txid = response.data.txid;
    const locId = response.data.loc.id;

    const qrcodeResponse = await axios.get(`${this.baseUrl}/v2/loc/${locId}/qrcode`, {
      headers: {
        Authorization: `Bearer ${this.token}`,
      },
      httpsAgent: this.getHttpsAgent(),
    });

    return {
      txid,
      pixUrl: qrcodeResponse.data.imagemQrcode,
      pixCode: qrcodeResponse.data.qrcode,
    };
  }

  public async generatePix(amount: number, description: string, memberCpf: string, memberName: string) {
    return this.generatePixCharge({
      amount,
      description,
      debtor: { cpf: memberCpf, nome: memberName },
    });
  }

  public async configureWebhook(webhookUrl: string) {
    if (!this.token) await this.authenticate();

    await axios.put(
      `${this.baseUrl}/v2/webhook/${this.credentials.pixKey}`,
      { webhookUrl },
      {
        headers: {
          Authorization: `Bearer ${this.token}`,
          "Content-Type": "application/json",
        },
        httpsAgent: this.getHttpsAgent(),
      }
    );
  }

  public async checkPixStatus(txid: string) {
    if (!this.token) await this.authenticate();

    const response = await axios.get(`${this.baseUrl}/v2/cob/${txid}`, {
      headers: {
        Authorization: `Bearer ${this.token}`,
      },
      httpsAgent: this.getHttpsAgent(),
    });

    return response.data.status; // 'CONCLUIDA', 'ATIVA', etc.
  }
}

export async function getEfiService() {
  const settings = await prisma.settings.findFirst();
  
  // Prefer settings from DB as requested for web control
  const clientId = settings?.efiClientId || process.env.EFI_CLIENT_ID;
  const clientSecret = settings?.efiClientSecret || process.env.EFI_CLIENT_SECRET;
  const certificate = settings?.efiCertificate || process.env.EFI_CERTIFICATE_BASE64 || "";
  const isSandbox = settings?.efiSandbox ?? (process.env.NODE_ENV === "development");
  
  const pixKey = settings?.efiPixKey || process.env.EFI_PIX_KEY;

  if (!clientId || !clientSecret || !pixKey) {
    throw new Error("Credenciais Efí (Client ID/Secret) não configuradas no Admin");
  }

  return new EfiService({
    clientId,
    clientSecret,
    certificate,
    pixKey
  }, isSandbox);
}
