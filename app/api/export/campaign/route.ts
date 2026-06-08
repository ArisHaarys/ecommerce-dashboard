import { NextResponse } from "next/server";
import ExcelJS from "exceljs";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const campaigns = await prisma.campaign.findMany({
    orderBy: {
      tanggal: "desc",
    },
  });

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Campaign");

  worksheet.columns = [
    { header: "Tanggal", key: "tanggal", width: 20 },
    { header: "Platform", key: "platform", width: 20 },
    { header: "Campaign", key: "campaign", width: 30 },
    { header: "Ads Spend", key: "biaya", width: 18 },
    { header: "Leads", key: "leads", width: 12 },
    { header: "Conversion", key: "conversion", width: 15 },
    { header: "Penjualan", key: "penjualan", width: 18 },
    { header: "ROAS", key: "roas", width: 12 },
  ];

  campaigns.forEach((item) => {
    worksheet.addRow({
      tanggal: item.tanggal.toLocaleDateString("id-ID"),
      platform: item.platform,
      campaign: item.campaign,
      biaya: item.biayaIklan,
      leads: item.leads,
      conversion: item.conversion,
      penjualan: item.penjualan,
      roas: item.biayaIklan
        ? (item.penjualan / item.biayaIklan).toFixed(2)
        : "0.00",
    });
  });

  const buffer = await workbook.xlsx.writeBuffer();

  return new NextResponse(buffer, {
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition":
        'attachment; filename="campaign.xlsx"',
    },
  });
}