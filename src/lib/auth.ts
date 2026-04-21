import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { createMemberLog, createLog } from "./logger";
import { format } from "date-fns";
import { headers } from "next/headers";
import { createSecurityEvent, getLocationFromHeaders, getRequestIpFromHeaders } from "@/lib/security";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      id: "admin-login",
      name: "Admin Login",
      credentials: {
        cpf: { label: "CPF", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        console.log("[ADMIN AUTH] Iniciando autorização...");
        try {
          if (!credentials?.cpf || !credentials?.password) {
            console.log("[ADMIN AUTH] CPF ou Senha ausentes nos credentials");
            return null;
          }
          
          const cleanCpf = credentials.cpf.replace(/\D/g, "");
          console.log(`[ADMIN AUTH] CPF Limpo: ${cleanCpf}`);
          const h = headers();
          const ipAddress = getRequestIpFromHeaders(h);
          const userAgent = h.get("user-agent");
          const referer = h.get("referer") || "";
          const location = getLocationFromHeaders(h);
          let admin = null as any;
          try {
            const host = h.get("host") || "";
            const parts = host.split(".");
            const isLocal = host.includes("localhost");
            if (!isLocal && parts.length > 2) {
              const sub = parts[0].toLowerCase();
              const tenant = await prisma.tenant.findFirst({ where: { subdomain: sub } });
              if (tenant) {
                admin = await prisma.admin.findFirst({
                  where: { cpf: cleanCpf, tenantId: tenant.id },
                });
              }
            }
          } catch {}
          if (!admin) {
            admin = await prisma.admin.findUnique({
              where: { cpf: cleanCpf },
            });
          }

          if (!admin) {
            console.log(`[ADMIN AUTH] Admin não encontrado no DB para o CPF: ${cleanCpf}`);
            return null;
          }

          if (!admin.password) {
            console.error(`[ADMIN AUTH] ERRO: Admin ${admin.name} sem senha no DB.`);
            return null;
          }

          console.log(`[ADMIN AUTH] Admin encontrado: ${admin.name}. Validando senha...`);
          const isPasswordValid = await bcrypt.compare(String(credentials.password).trim(), String(admin.password));
          
          if (isPasswordValid) {
            console.log(`[ADMIN AUTH] SUCESSO: Login autorizado para ${admin.name}`);
            
            // Busca dados do Tenant para o Admin
            let tenantData = null;
            if (admin.tenantId) {
              tenantData = await prisma.tenant.findUnique({
                where: { id: admin.tenantId },
                select: { name: true, initials: true }
              });
            }

            return {
              id: admin.id,
              name: admin.name,
              email: admin.cpf,
              role: admin.role,
              tenantId: admin.tenantId,
              tenantName: tenantData?.name || "Dk Sind",
              tenantInitials: tenantData?.initials || "DKS",
            };
          } else {
            console.log(`[ADMIN AUTH] FALHA: Senha incorreta para ${admin.name}`);
            await createSecurityEvent({
              tenantId: admin.tenantId || null,
              portal: referer.includes("/saas") ? "SAAS" : "ADMIN",
              action: "LOGIN_FAILED",
              ipAddress,
              userAgent,
              location,
              actorRole: admin.role,
              actorId: admin.id,
              details: `CPF ${cleanCpf}`,
            });
            return null;
          }
        } catch (error: any) {
          console.error("[ADMIN AUTH] ERRO CRÍTICO NO AUTHORIZE:", error.message);
          return null;
        }
      },
    }),
    CredentialsProvider({
      id: "member-login",
      name: "Member Login",
      credentials: {
        cpf: { label: "CPF", type: "text" },
        birthDate: { label: "Data de Nascimento", type: "text" },
      },
      async authorize(credentials) {
        try {
          if (!credentials?.cpf || !credentials?.birthDate) return null;
          
          const cleanCpf = credentials.cpf.replace(/\D/g, "");
          console.log(`[AUTH] Tentativa de login CPF: ${cleanCpf}, Data: ${credentials.birthDate}`);
          
          const h = headers();
          const ipAddress = getRequestIpFromHeaders(h);
          const userAgent = h.get("user-agent");
          const location = getLocationFromHeaders(h);

          const member = await prisma.member.findUnique({
            where: { cpf: cleanCpf },
          });

          if (member) {
            // Normaliza ambas as datas para comparação
            let dbDateString = "";
            try {
              // Tenta obter a data em formato YYYY-MM-DD
              if (member.birthDate && member.birthDate instanceof Date) {
                dbDateString = member.birthDate.toISOString().split('T')[0];
              } else if (member.birthDate) {
                dbDateString = new Date(member.birthDate).toISOString().split('T')[0];
              } else {
                console.error("[AUTH] Data de nascimento nula no banco para:", member.name);
              }
            } catch (e) {
              console.error("[AUTH] Erro ao processar data do banco:", e);
            }
            
            // Se o input vier em formato brasileiro DD/MM/YYYY, converte para YYYY-MM-DD
            let inputDate = credentials.birthDate;
            if (inputDate && inputDate.includes("/")) {
              const [day, month, year] = inputDate.split("/");
              inputDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
            }
            
            console.log(`[AUTH] Associado encontrado: ${member.name}`);
            console.log(`[AUTH] Comparando: DB(${dbDateString}) vs Input(${inputDate})`);

            if (dbDateString && inputDate && dbDateString === inputDate) {
              // Busca dados do Tenant para o Associado
              let tenantData = null;
              if (member.tenantId) {
                tenantData = await prisma.tenant.findUnique({
                  where: { id: member.tenantId },
                  select: { name: true, initials: true }
                });
              }

              return {
                id: member.id,
                name: member.name,
                email: member.cpf,
                role: "MEMBER",
                tenantId: member.tenantId,
                tenantName: tenantData?.name || "Dk Sind",
                tenantInitials: tenantData?.initials || "DKS",
              };
            } else {
              console.log(`[AUTH] Falha: Datas não conferem. Esperado: ${dbDateString}, Recebido: ${inputDate}`);
              await createSecurityEvent({
                tenantId: member.tenantId || null,
                portal: "PORTAL",
                action: "LOGIN_FAILED",
                ipAddress,
                userAgent,
                location,
                actorRole: "MEMBER",
                actorId: member.id,
                details: `CPF ${cleanCpf}`,
              });
            }
          } else {
            console.log(`[AUTH] Falha: CPF não encontrado no banco`);
            await createSecurityEvent({
              tenantId: null,
              portal: "PORTAL",
              action: "LOGIN_FAILED",
              ipAddress,
              userAgent,
              location,
              actorRole: "MEMBER",
              actorId: null,
              details: `CPF ${cleanCpf}`,
            });
          }
          return null;
        } catch (error) {
          console.error("[AUTH] Erro crítico no authorize:", error);
          return null;
        }
      },
    }),
    CredentialsProvider({
      id: "partner-login",
      name: "Partner Login",
      credentials: {
        document: { label: "CNPJ/CPF", type: "text" },
        password: { label: "Senha", type: "password" },
      },
      async authorize(credentials) {
        try {
          if (!credentials?.document || !credentials?.password) return null;
          
          const cleanDoc = credentials.document.replace(/\D/g, "");
          const h = headers();
          const ipAddress = getRequestIpFromHeaders(h);
          const userAgent = h.get("user-agent");
          const location = getLocationFromHeaders(h);
          const partner = await prisma.partnerCompany.findUnique({
            where: { document: cleanDoc },
          });

          if (partner && partner.status === "ACTIVE") {
            const isPasswordValid = await bcrypt.compare(credentials.password, partner.password);
            if (isPasswordValid) {
              return {
                id: partner.id,
                name: partner.name,
                email: partner.document,
                role: "PARTNER",
              };
            }
          }
          await createSecurityEvent({
            tenantId: null,
            portal: "PARTNER",
            action: "LOGIN_FAILED",
            ipAddress,
            userAgent,
            location,
            actorRole: "PARTNER",
            actorId: partner?.id || null,
            details: `DOC ${cleanDoc}`,
          });
          return null;
        } catch (error) {
          console.error("[PARTNER AUTH] Erro crítico:", error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      try {
        if (user) {
          token.id = user.id;
          token.role = (user as any).role || "MEMBER";
          token.email = user.email;
          token.tenantId = (user as any).tenantId;
          token.tenantName = (user as any).tenantName;
          token.tenantInitials = (user as any).tenantInitials;
        }
        return token;
      } catch (err) {
        console.error("[AUTH CALLBACKS] JWT Error:", err);
        return token;
      }
    },
    async session({ session, token }) {
      try {
        if (token && session.user) {
          session.user.id = token.id as string;
          session.user.role = token.role as string;
          session.user.email = token.email as string;
          (session.user as any).tenantId = token.tenantId;
          (session.user as any).tenantName = token.tenantName;
          (session.user as any).tenantInitials = token.tenantInitials;
        }
        return session;
      } catch (err) {
        console.error("[AUTH CALLBACKS] Session Error:", err);
        return session;
      }
    },
  },
  events: {
    async signIn({ user }) {
      try {
        let ipAddress: string | null = null;
        let userAgent: string | null = null;
        let referer = "";
        let location: string | null = null;
        try {
          const h = headers();
          ipAddress = getRequestIpFromHeaders(h);
          userAgent = h.get("user-agent");
          referer = h.get("referer") || "";
          location = getLocationFromHeaders(h);
        } catch {}
        const role = (user as any)?.role || "MEMBER";
        let tenantId: string | null = null;
        if (role === "MEMBER") {
          const member = await prisma.member.findUnique({ where: { id: user.id } });
          tenantId = member?.tenantId || null;
        } else if (role === "ADMIN" || role === "SUPER_ADMIN") {
          const admin = await prisma.admin.findUnique({ where: { id: user.id } });
          tenantId = admin?.tenantId || null;
        }
        await createSecurityEvent({
          tenantId,
          portal: referer.includes("/partner") ? "PARTNER" : referer.includes("/saas") ? "SAAS" : role === "MEMBER" ? "PORTAL" : "ADMIN",
          action: "LOGIN_SUCCESS",
          ipAddress,
          userAgent,
          location,
          actorRole: role,
          actorId: user.id,
        });

        if (user && (user as any).role === "MEMBER") {
          await createMemberLog(
            user.id,
            "LOGIN",
            "Login realizado no portal do associado"
          );
        } else if (user) {
          await createLog(
            user.id,
            "LOGIN",
            "Login realizado no terminal administrativo"
          );
        }
      } catch (err) {
        console.error("Error in signIn event:", err);
      }
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: {
    strategy: "jwt",
  },
};
