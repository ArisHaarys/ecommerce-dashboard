import { NextResponse } from "next/server";
import ExcelJS from "exceljs";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const products = await prisma.product.findMany({
    include: {
      kategori: true,
    },
    orderBy: {
      namaProduk: "asc",
    },
  });

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Produk");

  worksheet.columns = [
    { header: "SKU", key: "sku", width: 20 },
    { header: "Nama Produk", key: "namaProduk", width: 35 },
    { header: "Kategori", key: "kategori", width: 25 },
    { header: "Harga Modal", key: "hargaModal", width: 18 },
    { header: "Harga Jual", key: "hargaJual", width: 18 },
    { header: "Stok", key: "stok", width: 10 },
  ];

  products.forEach((product) => {
    worksheet.addRow({
      sku: product.sku,
      namaProduk: product.namaProduk,
      kategori: product.kategori.name,
      hargaModal: product.hargaModal,
      hargaJual: product.hargaJual,
      stok: product.stok,
    });
  });

  const buffer = await workbook.xlsx.writeBuffer();

  return new NextResponse(buffer, {
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition":
        'attachment; filename="produk.xlsx"',
    },
  });
}