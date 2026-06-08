"use server";

import { StockMutationType } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { toNumber } from "@/lib/utils";

export async function createStockHistory(formData: FormData) {
  const productId = String(formData.get("produkId") || "");
  const tipe = formData.get("tipe") as StockMutationType;
  const qty = toNumber(formData.get("qty"));
  const supplierName = String(formData.get("supplier") || "").trim();
  const supplier = supplierName
    ? await prisma.supplier.upsert({
        where: { name: supplierName },
        update: {},
        create: { name: supplierName },
      })
    : null;

  await prisma.$transaction([
    prisma.stockHistory.create({
      data: {
        produkId: productId,
        tanggal: new Date(String(formData.get("tanggal") || new Date().toISOString())),
        tipe,
        qty,
        supplierId: supplier?.id,
        catatan: String(formData.get("catatan") || "").trim(),
      },
    }),
    prisma.product.update({
      where: { id: productId },
      data: {
        stok:
          tipe === "STOK_MASUK"
            ? { increment: qty }
            : tipe === "STOK_KELUAR"
              ? { decrement: qty }
              : toNumber(formData.get("stokAkhir")),
      },
    }),
  ]);

  revalidatePath("/stok");
  revalidatePath("/produk");
}

export async function deleteStockHistory(id: string) {
  await prisma.stockHistory.delete({ where: { id } });
  revalidatePath("/stok");
}
