import { PrismaClient, UserRole } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const password = await hash("admin123", 10);

  await prisma.user.upsert({
    where: {
      email: "admin@toko.com",
    },
    update: {},
    create: {
      nama: "Administrator",
      email: "admin@toko.com",
      password,
      role: UserRole.ADMIN,
    },
  });

  await prisma.user.upsert({
  where: {
    email: "karyawan@test.com",
  },
  update: {},
  create: {
    nama: "Karyawan",
    email: "karyawan@test.com",
    password: await hash("123456", 10),
    role: "KARYAWAN",
  },
});

  console.log("Admin berhasil dibuat");
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });