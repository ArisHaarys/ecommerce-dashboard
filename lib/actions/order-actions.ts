"use server";

import { OrderStatus, StockMutationType } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { toNumber } from "@/lib/utils";
import { requireAdmin } from "@/lib/auth-guard";

type OrderUpdateData = {
  nomorInvoice?: string;
  tanggal?: Date;
  pelanggan?: string;
  status: OrderStatus;
  total?: number;
};

async function updateOrderWithCancellation(id: string, data: OrderUpdateData) {
  await prisma.$transaction(async (tx) => {
    const order = await tx.order.findUnique({
      where: { id },
      include: { items: true },
    });

    if (!order) {
      throw new Error("Pesanan tidak ditemukan.");
    }

    if (order.status === OrderStatus.DIBATALKAN && data.status !== OrderStatus.DIBATALKAN) {
      throw new Error("Pesanan yang sudah dibatalkan tidak dapat diaktifkan kembali.");
    }

    if (data.status !== OrderStatus.DIBATALKAN || order.status === OrderStatus.DIBATALKAN) {
      await tx.order.update({
        where: { id },
        data,
      });
      return;
    }

    const cancelUpdate = await tx.order.updateMany({
      where: {
        id,
        status: { not: OrderStatus.DIBATALKAN },
      },
      data,
    });

    if (cancelUpdate.count !== 1) {
      return;
    }

    for (const item of order.items) {
      await tx.product.update({
        where: { id: item.productId },
        data: {
          stok: { increment: item.qty },
        },
      });

      await tx.stockHistory.create({
        data: {
          produkId: item.productId,
          tanggal: new Date(),
          tipe: StockMutationType.STOK_MASUK,
          qty: item.qty,
          catatan: `Pembatalan pesanan ${order.nomorInvoice}`,
        },
      });
    }
  });
}

export async function createOrder(formData: FormData) {
  const productId = String(formData.get("productId") || "");
  const qty = toNumber(formData.get("qty"));
  const nomorInvoice = String(formData.get("nomorInvoice") || `INV-${Date.now()}`).trim();
  const tanggal = new Date(String(formData.get("tanggal") || new Date().toISOString()));
  const pelanggan = String(formData.get("pelanggan") || "").trim();
  const status = formData.get("status") as OrderStatus;

  await prisma.$transaction(async (tx) => {
    if (!productId) {
      await tx.order.create({
        data: {
          nomorInvoice,
          tanggal,
          pelanggan,
          status,
          total: toNumber(formData.get("total")),
        },
      });
      return;
    }

    if (qty <= 0) {
      throw new Error("Qty pesanan harus lebih dari 0.");
    }

    const product = await tx.product.findUnique({ where: { id: productId } });

    if (!product) {
      throw new Error("Produk pesanan tidak ditemukan.");
    }

    if (status !== OrderStatus.DIBATALKAN && product.stok < qty) {
      throw new Error(
        `Stok ${product.namaProduk} tidak cukup. Stok tersedia ${product.stok}, diminta ${qty}.`,
      );
    }

    const harga = product.hargaJual;
    const total = toNumber(formData.get("total")) || harga * qty;

    const order = await tx.order.create({
      data: {
        nomorInvoice,
        tanggal,
        pelanggan,
        status,
        total,
        items: {
          create: {
            productId,
            qty,
            harga,
            subtotal: harga * qty,
          },
        },
      },
    });

    if (status === OrderStatus.DIBATALKAN) {
      return;
    }

    const stockUpdate = await tx.product.updateMany({
      where: {
        id: productId,
        stok: { gte: qty },
      },
      data: {
        stok: { decrement: qty },
      },
    });

    if (stockUpdate.count !== 1) {
      throw new Error(
        `Stok ${product.namaProduk} tidak cukup. Stok tersedia ${product.stok}, diminta ${qty}.`,
      );
    }

    await tx.stockHistory.create({
      data: {
        produkId: productId,
        tanggal,
        tipe: StockMutationType.STOK_KELUAR,
        qty,
        catatan: `Pesanan ${order.nomorInvoice}`,
      },
    });
  });

  revalidatePath("/pesanan");
  revalidatePath("/produk");
  revalidatePath("/stok");
  redirect("/pesanan");
}

export async function updateOrder(id: string, formData: FormData) {
  await updateOrderWithCancellation(id, {
    nomorInvoice: String(formData.get("nomorInvoice") || "").trim(),
    tanggal: new Date(String(formData.get("tanggal") || new Date().toISOString())),
    pelanggan: String(formData.get("pelanggan") || "").trim(),
    status: formData.get("status") as OrderStatus,
    total: toNumber(formData.get("total")),
  });

  revalidatePath("/pesanan");
  revalidatePath("/produk");
  revalidatePath("/stok");
  revalidatePath(`/pesanan/${id}`);
  redirect("/pesanan");
}

export async function updateOrderStatus(id: string, formData: FormData) {
  await updateOrderWithCancellation(id, {
    status: formData.get("status") as OrderStatus,
  });
  revalidatePath("/pesanan");
  revalidatePath("/produk");
  revalidatePath("/stok");
  revalidatePath(`/pesanan/${id}`);
}

export async function deleteOrder(id: string) {
  await requireAdmin();
  await prisma.order.delete({ where: { id } });
  revalidatePath("/pesanan");
}
