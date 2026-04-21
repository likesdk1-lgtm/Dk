import { prisma } from "@/lib/prisma";
import { startOfMonth, addDays, isWeekend, getDay } from "date-fns";

export function getFifthBusinessDay(date: Date): Date {
  let count = 0;
  let current = startOfMonth(date);
  while (count < 5) {
    const day = getDay(current);
    if (day !== 0 && day !== 6) { // Not Sunday or Saturday
      count++;
    }
    if (count < 5) {
      current = addDays(current, 1);
    }
  }
  return current;
}

export async function generateMonthlyBillings() {
  const members = await prisma.member.findMany({
    where: {
      status: "ACTIVE",
      modality: {
        is: {
          name: { contains: "mensal" }
        }
      }
    },
    include: { modality: true }
  });

  const dueDate = getFifthBusinessDay(new Date());

  for (const member of members) {
    if (!member.modality) continue;

    // Check if billing for this month already exists
    const existing = await prisma.billing.findFirst({
      where: {
        memberId: member.id,
        ...(member.tenantId ? { tenantId: member.tenantId } : {}),
        dueDate: {
          gte: startOfMonth(new Date()),
          lte: addDays(startOfMonth(new Date()), 31)
        }
      }
    });

    if (!existing) {
      await prisma.billing.create({
        data: {
          memberId: member.id,
          amount: member.modality.value,
          dueDate: dueDate,
          status: "PENDING",
          tenantId: member.tenantId || null,
        }
      });
    }
  }
}
