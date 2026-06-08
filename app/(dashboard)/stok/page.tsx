import { Trash2 } from "lucide-react";
import { StockMutationType } from "@prisma/client";
import { createStockHistory, deleteStockHistory } from "@/lib/actions/stock-actions";
import { Button, ButtonLink } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, Input, Label, Select, Textarea } from "@/components/ui/form";
import { SubmitButton } from "@/components/ui/submit-button";
import { Badge, stockTypeLabel } from "@/components/ui/status-badge";
import { prisma } from "@/lib/prisma";
import type { PageSearchParams } from "@/lib/types";
import { formatDate } from "@/lib/utils";

export default async function StockPage({ searchParams }: { searchParams: PageSearchParams }) {
  const params = await searchParams;
  const from = String(params.from || "");
  const to = String(params.to || "");
  const where = {
    ...(from || to
      ? {
          tanggal: {
            ...(from ? { gte: new Date(from) } : {}),
            ...(to ? { lte: new Date(to) } : {}),
          },
        }
      : {}),
  };

  const [products, histories] = await Promise.all([
    prisma.product.findMany({ orderBy: { namaProduk: "asc" } }),
    prisma.stockHistory.findMany({
      where,
      include: { produk: true, supplier: true },
      orderBy: { tanggal: "desc" },
      take: 50,
    }),
  ]);

  return (
  <div className="space-y-6">

    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Riwayat Stok
        </h1>
        <p className="text-sm text-zinc-500">
          Input mutasi stok masuk, keluar, dan penyesuaian.
        </p>
      </div>

      <ButtonLink href="/api/export/stok">
        Export Excel
      </ButtonLink>
    </div>

    <Card>
      <CardHeader>
        <CardTitle>Input Mutasi Stok</CardTitle>
      </CardHeader>

      {/* dst */}
        <CardContent>
          <form action={createStockHistory} className="grid gap-4 md:grid-cols-4">
            <Field>
              <Label>Tanggal</Label>
              <Input name="tanggal" type="date" required />
            </Field>
            <Field>
              <Label>Produk</Label>
              <Select name="produkId" required>
                <option value="">Pilih produk</option>
                {products.map((product) => <option key={product.id} value={product.id}>{product.namaProduk}</option>)}
              </Select>
            </Field>
            <Field>
              <Label>Tipe</Label>
              <Select name="tipe">
                {Object.values(StockMutationType).map((type) => <option key={type} value={type}>{stockTypeLabel(type)}</option>)}
              </Select>
            </Field>
            <Field>
              <Label>Qty</Label>
              <Input name="qty" type="number" min="1" required />
            </Field>
            <Field>
              <Label>Stok Akhir</Label>
              <Input name="stokAkhir" type="number" min="0" placeholder="Untuk penyesuaian" />
            </Field>
            <Field>
              <Label>Supplier</Label>
              <Input name="supplier" />
            </Field>
            <Field className="md:col-span-2">
              <Label>Catatan</Label>
              <Textarea name="catatan" />
            </Field>
            <div className="md:col-span-4">
              <SubmitButton>Simpan Mutasi</SubmitButton>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <form className="grid gap-3 md:grid-cols-[180px_180px_auto]">
            <Input name="from" type="date" defaultValue={from} />
            <Input name="to" type="date" defaultValue={to} />
            <Button type="submit" variant="secondary">Filter Tanggal</Button>
          </form>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full min-w-[780px] text-left text-sm">
            <thead className="text-xs uppercase text-zinc-500">
              <tr className="border-b border-zinc-100">
                <th className="py-3">Tanggal</th>
                <th>Produk</th>
                <th>Tipe</th>
                <th>Qty</th>
                <th>Supplier</th>
                <th>Catatan</th>
                <th className="text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {histories.map((history) => (
                <tr key={history.id} className="border-b border-zinc-100">
                  <td className="py-3">{formatDate(history.tanggal)}</td>
                  <td className="font-medium">{history.produk.namaProduk}</td>
                  <td><Badge>{stockTypeLabel(history.tipe)}</Badge></td>
                  <td>{history.qty}</td>
                  <td>{history.supplier?.name || "-"}</td>
                  <td>{history.catatan || "-"}</td>
                  <td>
                    <form action={deleteStockHistory.bind(null, history.id)} className="flex justify-end">
                      <Button type="submit" variant="ghost" className="px-3" aria-label="Hapus riwayat"><Trash2 size={16} /></Button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {histories.length === 0 && <p className="py-10 text-center text-sm text-zinc-500">Belum ada riwayat stok.</p>}
        </CardContent>
      </Card>
    </div>
  );
}
