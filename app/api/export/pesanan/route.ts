import { NextResponse } from "next/server";
import ExcelJS from "exceljs";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const orders = await prisma.order.findMany({
    orderBy: {
      tanggal: "desc",
    },
  });

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Pesanan");

  worksheet.columns = [
    { header: "Invoice", key: "invoice", width: 25 },
    { header: "Tanggal", key: "tanggal", width: 20 },
    { header: "Pelanggan", key: "pelanggan", width: 30 },
    { header: "Status", key: "status", width: 20 },
    { header: "Total", key: "total", width: 20 },
  ];

  orders.forEach((order) => {
    worksheet.addRow({
      invoice: order.nomorInvoice,
      tanggal: order.tanggal.toLocaleDateString("id-ID"),
      pelanggan: order.pelanggan,
      status: order.status,
      total: order.total,
    });
  });

  const buffer = await workbook.xlsx.writeBuffer();

  return new NextResponse(buffer, {
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition":
        'attachment; filename="pesanan.xlsx"',
    },
  });
}