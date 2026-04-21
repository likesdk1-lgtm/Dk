import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { getEfiService } from "@/lib/efi";

const schema = z.object({
  companyName: z.string().min(3),
  cnpj: z.string().min(14).max(18),
  subdomain: z.string().regex(/^[a-z0-9-]{3,30}$/),
  adminName: z.string().min(3),
  adminCpf: z.string().min(11).max(14),
  adminPassword: z.string().min(6),
  planCode: z.string().min(2).max(32).optional(),
});

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const parsed = schema.safeParse(data);
    if (!parsed.success) {
      return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
    }

    const cnpj = parsed.data.cnpj.replace(/\D/g, "");
    const cpf = parsed.data.adminCpf.replace(/\D/g, "");
    const subdomain = parsed.data.subdomain.toLowerCase();
    const planCode = (parsed.data.planCode || "TRIAL").toUpperCase();

    const existingTenant = await prisma.tenant.findFirst({
      where: {
        OR: [{ cnpj }, { subdomain }],
      },
    });
    if (existingTenant) {
      return NextResponse.json({ error: "CNPJ ou subdomínio já existe" }, { status: 409 });
    }

    const existingAdmin = await prisma.admin.findUnique({
      where: { cpf },
    });
    if (existingAdmin) {
      return NextResponse.json({ error: "CPF de administrador já existe" }, { status: 409 });
    }

    const tenant = await prisma.tenant.create({
      data: {
        name: parsed.data.companyName,
        cnpj,
        subdomain,
        status: "ACTIVE",
      },
    });

    const hashed = await bcrypt.hash(parsed.data.adminPassword, 10);
    await prisma.admin.create({
      data: {
        name: parsed.data.adminName,
        cpf,
        password: hashed,
        role: "ADMIN",
        tenantId: tenant.id,
      },
    });

    const plan = await prisma.saasPlan.upsert({
      where: { code: planCode },
      update: {},
      create: {
        code: planCode,
        name: planCode === "TRIAL" ? "Teste" : planCode,
        price: planCode === "TRIAL" ? 0 : 199,
        currency: "BRL",
        interval: "MONTHLY",
        status: "ACTIVE",
      },
    });

    if (plan.price > 0) {
      const subscription = await prisma.saasSubscription.create({
        data: {
          tenantId: tenant.id,
          planId: plan.id,
          status: "PENDING",
        },
      });

      const efi = await getEfiService();
      const pix = await efi.generatePixCharge({
        amount: plan.price,
        description: `Plano ${plan.name} - ${tenant.subdomain}`,
        debtor: { cnpj, nome: tenant.name },
        expiresInSeconds: 3600,
      });

      const payment = await prisma.saasPayment.create({
        data: {
          subscriptionId: subscription.id,
          amount: plan.price,
          status: "PENDING",
          efiTxid: pix.txid,
          pixCode: pix.pixCode,
          pixUrl: pix.pixUrl,
        },
      });

      return NextResponse.json({
        success: true,
        tenantId: tenant.id,
        subdomain,
        subscriptionId: subscription.id,
        paymentId: payment.id,
        pixCode: pix.pixCode,
        pixUrl: pix.pixUrl,
      });
    }

    const trialEndsAt = new Date();
    trialEndsAt.setDate(trialEndsAt.getDate() + 7);

    await prisma.saasSubscription.create({
      data: {
        tenantId: tenant.id,
        planId: plan.id,
        status: "TRIAL",
        trialEndsAt,
      },
    });

    return NextResponse.json({
      success: true,
      tenantId: tenant.id,
      subdomain,
      trialEndsAt,
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
