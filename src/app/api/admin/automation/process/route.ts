import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendBillingNotification } from "@/lib/automation";
import { subDays, startOfDay, endOfDay } from "date-fns";

export async function GET() {
  try {
    const today = new Date();
    
    // 1. Lembrança de 3 dias (cobranças vencidas há 3 dias)
    const threeDaysAgo = subDays(today, 3);
    const billings3Days = await prisma.billing.findMany({
      where: {
        status: "PENDING",
        dueDate: {
          gte: startOfDay(threeDaysAgo),
          lte: endOfDay(threeDaysAgo)
        }
      }
    });

    for (const bill of billings3Days) {
      await sendBillingNotification(bill.memberId, "REMINDER_3_DAYS");
    }

    // 2. Lembrança de 15 dias (cobranças vencidas há 15 dias)
    const fifteenDaysAgo = subDays(today, 15);
    const billings15Days = await prisma.billing.findMany({
      where: {
        status: "PENDING",
        dueDate: {
          gte: startOfDay(fifteenDaysAgo),
          lte: endOfDay(fifteenDaysAgo)
        }
      }
    });

    for (const bill of billings15Days) {
      await sendBillingNotification(bill.memberId, "REMINDER_15_DAYS");
    }

    return NextResponse.json({
      processed: true,
      reminders3Days: billings3Days.length,
      reminders15Days: billings15Days.length
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
