import { prisma } from "@/lib/prisma";
import { PlansClient } from "./PlansClient";

export default async function Page() {
  const plans = await prisma.saasPlan.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <div className="text-[10px] font-black uppercase tracking-widest text-white/60">Catálogo</div>
        <h1 className="text-3xl md:text-4xl font-black tracking-tight">Planos</h1>
      </div>

      <PlansClient initialPlans={plans} />
    </div>
  );
}

