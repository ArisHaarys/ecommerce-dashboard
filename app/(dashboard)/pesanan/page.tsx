import Link from "next/link";
import { Trash2 } from "lucide-react";
import { OrderStatus } from "@prisma/client";
import { createOrder, deleteOrder, updateOrderStatus } from "@/lib/actions/order-actions";
import { Button, ButtonLink } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, Input, Label, Select } from "@/components/ui/form";
import { SubmitButton } from "@/components/ui/submit-button";
import { orderStatusLabel } from "@/components/ui/status-badge";
import { prisma } from "@/lib/prisma";
import { formatCurrency, formatDate } from "@/lib/utils";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const statuses = Object.values(OrderStatus);

export default async function OrdersPage() {
  const session = await getServerSession(authOptions);
  const [orders, products] = await Promise.all([
    prisma.order.findMany({ include: { items: { include: { product: true } } }, orderBy: { tanggal: "desc" } }),
    prisma.product.findMany({ orderBy: { namaProduk: "asc" } }),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
  <div>
    <h1 className="text-2xl font-semibold tracking-tight">
      Pesanan
    </h1>
    <p className="text-sm text-zinc-500">
      Buat invoice, update status, lihat detail, dan cetak invoice.
    </p>
  </div>

  <ButtonLink href="/api/export/pesanan">
    Export Excel
  </ButtonLink>
</div>

      <Card>
        <CardHeader>
          <CardTitle>Tambah Pesanan</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={createOrder} className="grid gap-4 md:grid-cols-4">
            <Field>
              <Label>Nomor Invoice</Label>
              <Input name="nomorInvoice" placeholder="INV-001" />
            </Field>
            <Field>
              <Label>Tanggal</Label>
              <Input name="tanggal" type="date" required />
            </Field>
            <Field>
              <Label>Pelanggan</Label>
              <Input name="pelanggan" required />
            </Field>
            <Field>
              <Label>Status</Label>
              <Select name="status" defaultValue="BARU">
                {statuses.map((status) => <option key={status} value={status}>{orderStatusLabel(status)}</option>)}
              </Select>
            </Field>
            <Field>
              <Label>Produk</Label>
              <Select name="productId">
                <option value="">Tanpa item</option>
                {products.map((product) => <option key={product.id} value={product.id}>{product.namaProduk}</option>)}
              </Select>
            </Field>
            <Field>
              <Label>Qty</Label>
              <Input name="qty" type="number" min="1" defaultValue={1} />
            </Field>
            <Field>
              <Label>Total Manual</Label>
              <Input name="total" type="number" min="0" placeholder="Opsional" />
            </Field>
            <div className="flex items-end">
              <SubmitButton>Tambah Pesanan</SubmitButton>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Pesanan</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full min-w-[820px] text-left text-sm">
            <thead className="text-xs uppercase text-zinc-500">
              <tr className="border-b border-zinc-100">
                <th className="py-3">Invoice</th>
                <th>Tanggal</th>
                <th>Pelanggan</th>
                <th>Status</th>
                <th>Total</th>
                <th className="text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id} className="border-b border-zinc-100">
                  <td className="py-3 font-medium"><Link href={`/pesanan/${order.id}`}>{order.nomorInvoice}</Link></td>
                  <td>{formatDate(order.tanggal)}</td>
                  <td>{order.pelanggan}</td>
                  <td>
                    <form action={updateOrderStatus.bind(null, order.id)} className="flex items-center gap-2">
                      <Select name="status" defaultValue={order.status} className="w-36">
                        {statuses.map((status) => <option key={status} value={status}>{orderStatusLabel(status)}</option>)}
                      </Select>
                      <Button type="submit" variant="secondary">Update</Button>
                    </form>
                  </td>
                  <td>{formatCurrency(order.total)}</td>
                  <td>
                    <div className="flex justify-end gap-2">
                      <ButtonLink href={`/pesanan/${order.id}`} variant="secondary">Detail</ButtonLink>
                      {session?.user?.role === "ADMIN" && (
                        <form action={deleteOrder.bind(null, order.id)}>
                          <Button
                            type="submit"
                            variant="ghost"
                          >
                          <Trash2 size={16} />
                          </Button>
                        </form>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {orders.length === 0 && <p className="py-10 text-center text-sm text-zinc-500">Belum ada pesanan.</p>}
        </CardContent>
      </Card>
    </div>
  );
}
