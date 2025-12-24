import { PrismaClient } from "@prisma/client";

const email = process.argv[2];
if (!email) {
  console.error("Usage: node scripts/set-admin.mjs <email>");
  process.exit(1);
}

const prisma = new PrismaClient();

try {
  await prisma.user.update({
    where: { email: email.toLowerCase() },
    data: { role: "ADMIN" },
  });
  console.log(`Role updated to ADMIN for ${email}`);
} catch (err) {
  console.error("Failed to update role:", err);
  process.exitCode = 1;
} finally {
  await prisma.$disconnect();
}
