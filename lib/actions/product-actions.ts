"use server";

import { requireAdmin } from "@/lib/auth-guard";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { toNumber } from "@/lib/utils";
import { createLog } from "@/lib/activity-log";

async function saveProductPhoto(file: FormDataEntryValue | null) {
  if (!(file instanceof File) || file.size === 0) return undefined;

  const uploadDir = path.join(process.cwd(), "public", "uploads");
  await mkdir(uploadDir, { recursive: true });

  const ext = path.extname(file.name) || ".jpg";
  const filename = `${Date.now()}-${crypto.randomUUID()}${ext}`;
  const bytes = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(uploadDir, filename), bytes);

  return `/uploads/${filename}`;
}

export async function createProduct(formData: FormData) {
  await requireAdmin();
  const categoryName = String(formData.get("kategori") || "Umum").trim();
  const fotoProduk = await saveProductPhoto(formData.get("fotoProduk"));
  const category = await prisma.category.upsert({
    where: { name: categoryName },
    update: {},
    create: { name: categoryName },
  });

  await prisma.product.create({
    data: {
      sku: String(formData.get("sku") || "").trim(),
      namaProduk: String(formData.get("namaProduk") || "").trim(),
      kategoriId: category.id,
      hargaModal: toNumber(formData.get("hargaModal")),
      hargaJual: toNumber(formData.get("hargaJual")),
      stok: toNumber(formData.get("stok")),
      fotoProduk,
    },
  });

  await createLog(
  "CREATE_PRODUCT",
  `Menambahkan produk ${String(formData.get("namaProduk"))}`
);

  revalidatePath("/produk");
  redirect("/produk");
}

export async function updateProduct(id: string, formData: FormData) {
  await requireAdmin();
  const categoryName = String(formData.get("kategori") || "Umum").trim();
  const fotoProduk = await saveProductPhoto(formData.get("fotoProduk"));
  const category = await prisma.category.upsert({
    where: { name: categoryName },
    update: {},
    create: { name: categoryName },
  });

  await prisma.product.update({
    where: { id },
    data: {
      sku: String(formData.get("sku") || "").trim(),
      namaProduk: String(formData.get("namaProduk") || "").trim(),
      kategoriId: category.id,
      hargaModal: toNumber(formData.get("hargaModal")),
      hargaJual: toNumber(formData.get("hargaJual")),
      stok: toNumber(formData.get("stok")),
      ...(fotoProduk ? { fotoProduk } : {}),
    },
  });

  await createLog(
  "UPDATE_PRODUCT",
  `Mengubah produk ${String(formData.get("namaProduk"))}`
);

  revalidatePath("/produk");
  redirect("/produk");
}

export async function deleteProduct(id: string) {
  await requireAdmin();

  const product = await prisma.product.findUnique({
  where: { id },
});

  const stockCount = await prisma.stockHistory.count({
  where: {
    produkId: id,
  },
});

const orderCount = await prisma.orderItem.count({
  where: {
    productId: id,
  },
});

if (stockCount > 0 || orderCount > 0) {
  throw new Error(
    "Produk tidak bisa dihapus karena sudah memiliki riwayat transaksi"
  );
}

await prisma.product.delete({
  where: { id },
});

await createLog(
  "DELETE_PRODUCT",
  `Menghapus produk ${product?.namaProduk}`
);

 revalidatePath("/produk");
}

