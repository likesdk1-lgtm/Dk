import { prisma } from "@/lib/prisma";

export async function createLog(adminId: string, action: string, details: string, ipAddress?: string) {
  try {
    await prisma.log.create({
      data: {
        adminId,
        action,
        details,
        ipAddress,
      },
    });
  } catch (error) {
    console.error("Failed to create log:", error);
  }
}

export async function createMemberLog(memberId: string, action: string, details: string, ipAddress?: string, userAgent?: string) {
  try {
    await prisma.memberLog.create({
      data: {
        memberId,
        action,
        details,
        ipAddress,
        userAgent,
      },
    });
  } catch (error) {
    console.error("Failed to create member log:", error);
  }
}

export async function createErrorLog(message: string, stack?: string, path?: string, method?: string, statusCode?: number, ipAddress?: string, userAgent?: string) {
  try {
    await prisma.errorLog.create({
      data: {
        message,
        stack,
        path,
        method,
        statusCode,
        ipAddress,
        userAgent,
      },
    });
  } catch (error) {
    console.error("Failed to create error log:", error);
  }
}
