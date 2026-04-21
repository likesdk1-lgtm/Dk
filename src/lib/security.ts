import { prisma } from "@/lib/prisma";

export function getRequestIpFromHeaders(h: Headers) {
  const forwarded = h.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim() || null;
  return h.get("x-real-ip") || null;
}

export function getDeviceFromUserAgent(userAgent: string | null) {
  if (!userAgent) return null;
  const ua = userAgent.toLowerCase();
  if (ua.includes("android") || ua.includes("iphone") || ua.includes("ipad") || ua.includes("mobile")) return "MOBILE";
  return "DESKTOP";
}

export function getLocationFromHeaders(h: Headers) {
  const country =
    h.get("x-vercel-ip-country") ||
    h.get("cf-ipcountry") ||
    h.get("x-country") ||
    h.get("x-forwarded-country");
  if (country) return country;
  return null;
}

export async function createSecurityEvent(input: {
  tenantId?: string | null;
  portal: string;
  action: string;
  ipAddress?: string | null;
  userAgent?: string | null;
  actorRole?: string | null;
  actorId?: string | null;
  details?: string | null;
  location?: string | null;
}) {
  await prisma.securityEvent.create({
    data: {
      tenantId: input.tenantId || null,
      portal: input.portal,
      action: input.action,
      ipAddress: input.ipAddress || null,
      userAgent: input.userAgent || null,
      device: getDeviceFromUserAgent(input.userAgent || null),
      location: input.location || null,
      actorRole: input.actorRole || null,
      actorId: input.actorId || null,
      details: input.details || null,
    },
  });
}
