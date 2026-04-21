const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

async function main() {
  const name = process.argv[2] || "";
  const cpfRaw = process.argv[3] || "";
  const password = process.argv[4] || "";

  if (!name || !cpfRaw || !password) {
    process.stderr.write("Uso: node scripts/create-super-admin.cjs <nome> <cpf> <senha>\\n");
    process.exit(2);
  }

  const cpf = String(cpfRaw).replace(/\D/g, "");
  const hashed = await bcrypt.hash(String(password), 10);

  const prisma = new PrismaClient();
  try {
    const admin = await prisma.admin.upsert({
      where: { cpf },
      update: {
        name,
        password: hashed,
        role: "SUPER_ADMIN",
        tenantId: null,
      },
      create: {
        name,
        cpf,
        password: hashed,
        role: "SUPER_ADMIN",
      },
    });

    process.stdout.write(`OK_SUPER_ADMIN ${admin.id}\n`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  process.stderr.write(String(e?.stack || e) + "\n");
  process.exit(1);
});
