"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-guard";

export async function createUser(formData: FormData) {
  await requireAdmin();

  const password = await bcrypt.hash(
    String(formData.get("password")),
    10
  );

  await prisma.user.create({
    data: {
      nama: String(formData.get("nama")),
      email: String(formData.get("email")),
      password,
      role: formData.get("role") as any,
    },
  });

  revalidatePath("/users");
}

export async function deleteUser(id: string) {
  await requireAdmin();

  await prisma.user.delete({
    where: { id },
  });

  revalidatePath("/users");
}