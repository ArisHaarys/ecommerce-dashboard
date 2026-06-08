import { NextResponse } from "next/server";
import ExcelJS from "exceljs";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const histories = await prisma.stockHistory.findMany({
    include: {
      produk: true,
      supplier: true,
    },
    orderBy: {
      tanggal: "desc",
    },
  });

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Riwayat Stok");

  worksheet.columns = [
    { header: "Tanggal", key: "tanggal", width: 20 },
    { header: "Produk", key: "produk", width: 35 },
    { header: "Tipe", key: "tipe", width: 20 },
    { header: "Qty", key: "qty", width: 12 },
    { header: "Supplier", key: "supplier", width: 30 },
    { header: "Catatan", key: "catatan", width: 40 },
  ];

  histories.forEach((item) => {
    worksheet.addRow({
      tanggal: item.tanggal.toLocaleDateString("id-ID"),
      produk: item.produk.namaProduk,
      tipe: item.tipe,
      qty: item.qty,
      supplier: item.supplier?.name ?? "-",
      catatan: item.catatan ?? "-",
    });
  });

  const buffer = await workbook.xlsx.writeBuffer();

  return new NextResponse(buffer, {
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition":
        'attachment; filename="stok.xlsx"',
    },
  });
}