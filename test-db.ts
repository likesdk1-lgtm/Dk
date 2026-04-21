
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("--- Checking Database Connection ---");
  try {
    const adminCount = await prisma.admin.count();
    const memberCount = await prisma.member.count();
    console.log(`Admins: ${adminCount}`);
    console.log(`Members: ${memberCount}`);

    const testAdminCpf = "07938310328";
    const admin = await prisma.admin.findUnique({ where: { cpf: testAdminCpf } });
    console.log(`Admin found: ${admin ? "YES" : "NO"}`);

    const testMemberCpf = "76566412891";
    const member = await prisma.member.findUnique({ where: { cpf: testMemberCpf } });
    console.log(`Member found: ${member ? "YES" : "NO"}`);
    if (member) {
      console.log(`Member birthDate (raw): ${member.birthDate}`);
      console.log(`Member birthDate (ISO): ${member.birthDate.toISOString()}`);
    }
  } catch (err) {
    console.error("Database error:", err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
