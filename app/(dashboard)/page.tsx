import { AdsChart, SalesChart } from "@/components/dashboard/charts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge, platformLabel } from "@/components/ui/status-badge";
import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/utils";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { createUser, deleteUser } from "@/lib/actions/user-actions";
import { Trash2 } from "lucide-react";


export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1);

  const [todayOrders, monthOrders, orderCount, bestProducts, lowStock, campaigns] = await Promise.all([
    prisma.order.aggregate({ _sum: { total: true }, where: { tanggal: { gte: today }, status: "SELESAI", }, }),
    prisma.order.aggregate({ _sum: { total: true }, where: { tanggal: { gte: monthStart }, status: "SELESAI", }, }),
    prisma.order.count({ where: { status: { not: "DIBATALKAN",}, }, }),
    prisma.orderItem.groupBy({ by: ["productId"], _sum: { qty: true }, orderBy: { _sum: { qty: "desc" } }, take: 5 }),
    prisma.product.findMany({ where: { stok: { lte: 10 } }, include: { kategori: true }, orderBy: { stok: "asc" }, take: 5 }),
    prisma.campaign.findMany({ orderBy: { tanggal: "desc" }, take: 8 }),
  ]);

  const productNames = await prisma.product.findMany({
    where: { id: { in: bestProducts.map((item) => item.productId) } },
    select: { id: true, namaProduk: true },
  });
  const names = new Map(productNames.map((product) => [product.id, product.namaProduk]));

  const completedWeekOrders = await prisma.order.findMany({
  where: {
    status: "SELESAI",
    tanggal: {
      gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    },
  },
  });

  const completedMonthOrders = await prisma.order.findMany({
  where: {
    status: "SELESAI",
    tanggal: {
      gte: monthStart,
    },
  },
  include: {
    items: {
      include: {
        product: true,
      },
    },
  },
});

  const profit = completedMonthOrders.reduce(
  (sum, order) =>
    sum +
    order.items.reduce(
      (itemSum, item) =>
        itemSum +
        (item.harga - item.product.hargaModal) *
          item.qty,
      0
    ),
  0
);

  const salesData = Array.from({ length: 7 }).map((_, index) => {
  const date = new Date();
  date.setDate(date.getDate() - (6 - index));

  const omzet = completedWeekOrders
    .filter(
      (order) =>
        order.tanggal.toDateString() === date.toDateString()
    )
    .reduce((sum, order) => sum + order.total, 0);

  return {
    name: date.toLocaleDateString("id-ID", {
      weekday: "short",
    }),
    omzet,
  };
});

  const adsData = campaigns.slice(0, 5).reverse().map((campaign) => ({
    name: platformLabel(campaign.platform),
    biaya: campaign.biayaIklan,
    leads: campaign.leads,
  }));

  const totalSpend = campaigns.reduce((sum, campaign) => sum + campaign.biayaIklan, 0);
  const totalLeads = campaigns.reduce((sum, campaign) => sum + campaign.leads, 0);
  const totalSales = campaigns.reduce((sum, campaign) => sum + campaign.penjualan, 0);
  const roas = totalSpend ? totalSales / totalSpend : 0;
  const criticalStockCount = lowStock.filter((item) => item.stok <= 5).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-950">Dashboard</h1>
        <p className="text-sm text-zinc-500">Ringkasan operasional toko hari ini.</p>
      </div>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Metric title="Omzet Hari Ini" value={formatCurrency(todayOrders._sum.total || 0)} helper="Order sejak pukul 00:00" />
        <Metric title="Omzet Bulan Ini" value={formatCurrency(monthOrders._sum.total || 0)} helper="Akumulasi bulan berjalan" />
        <Metric title="Jumlah Pesanan" value={String(orderCount)} helper="Total invoice tersimpan" />
        <Metric title="Performa Iklan" value={`${roas.toFixed(2)}x`} helper={`${formatCurrency(totalSpend)} ads spend`} />
        <Metric title="Profit Bulan Ini" value={formatCurrency(profit)} helper="Laba bersih penjualan" />
      </section>

      {criticalStockCount > 0 && (
  <Card className="border-red-300">
    <CardContent>
      <p className="text-sm font-medium text-red-600">
        ⚠️ Stok Kritis
      </p>

      <p className="mt-2 text-2xl font-bold text-red-600">
        {criticalStockCount}
      </p>

      <p className="text-xs text-zinc-500">
        produk stok ≤ 5
      </p>
    </CardContent>
  </Card>
)}

      <section className="grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Omzet Mingguan</CardTitle>
          </CardHeader>
          <CardContent>
            <SalesChart data={salesData} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Performa Iklan</CardTitle>
          </CardHeader>
          <CardContent>
            <AdsChart data={adsData} />
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 xl:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Produk Terlaris</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {bestProducts.length === 0 && <p className="text-sm text-zinc-500">Belum ada data penjualan.</p>}
            {bestProducts.map((item) => (
              <div key={item.productId} className="flex items-center justify-between text-sm">
                <span className="font-medium text-zinc-800">{names.get(item.productId) || "Produk"}</span>
                <Badge>{item._sum.qty || 0} terjual</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Produk Stok Menipis</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {lowStock.length === 0 && <p className="text-sm text-zinc-500">Stok aman.</p>}
            {lowStock.map((product) => (
              <div key={product.id} className="flex items-center justify-between text-sm">
                <span className="font-medium text-zinc-800">{product.namaProduk}</span>
                <Badge>{product.stok <= 5
                  ? `⚠️ ${product.stok} stok`
                  : `${product.stok} stok`}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
        {session?.user?.role === "ADMIN" && (
        <Card>
          <CardHeader>
            <CardTitle>Rekap Iklan</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between"><span>Total Ads Spend</span><strong>{formatCurrency(totalSpend)}</strong></div>
            <div className="flex justify-between"><span>Total Leads</span><strong>{totalLeads}</strong></div>
            <div className="flex justify-between"><span>Conversion Rate</span><strong>{totalLeads ? ((campaigns.reduce((s, c) => s + c.conversion, 0) / totalLeads) * 100).toFixed(1) : "0"}%</strong></div>
            <div className="flex justify-between"><span>ROAS</span><strong>{roas.toFixed(2)}x</strong></div>
          </CardContent>
        </Card>
        )}
      </section>
    </div>
  );
}

function Metric({ title, value, helper }: { title: string; value: string; helper: string }) {
  return (
    <Card>
      <CardContent>
        <p className="text-sm font-medium text-zinc-500">{title}</p>
        <p className="mt-3 text-2xl font-semibold text-zinc-950">{value}</p>
        <p className="mt-1 text-xs text-zinc-500">{helper}</p>
      </CardContent>
    </Card>
  );
}
