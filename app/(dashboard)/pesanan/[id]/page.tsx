import { notFound } from "next/navigation";
import { OrderStatus } from "@prisma/client";
import { updateOrder } from "@/lib/actions/order-actions";
import { ButtonLink } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, Input, Label, Select } from "@/components/ui/form";
import { SubmitButton } from "@/components/ui/submit-button";
import { Badge, orderStatusLabel } from "@/components/ui/status-badge";
import { prisma } from "@/lib/prisma";
import { formatCurrency, formatDate } from "@/lib/utils";

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const order = await prisma.order.findUnique({
    where: { id },
    include: { items: { include: { product: true } } },
  });

  if (!order) notFound();

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{order.nomorInvoice}</h1>
          <p className="text-sm text-zinc-500">{order.pelanggan} - {formatDate(order.tanggal)}</p>
        </div>
        <ButtonLink href={`/pesanan/${order.id}?print=1`} variant="secondary">Cetak Invoice</ButtonLink>
      </div>

      <section className="grid gap-4 xl:grid-cols-[1fr_380px]">
        <Card>
          <CardHeader>
            <CardTitle>Detail Pesanan</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Badge>{orderStatusLabel(order.status)}</Badge>
              <strong>{formatCurrency(order.total)}</strong>
            </div>
            <table className="w-full text-left text-sm">
              <thead className="text-xs uppercase text-zinc-500">
                <tr className="border-b border-zinc-100">
                  <th className="py-3">Produk</th>
                  <th>Qty</th>
                  <th>Harga</th>
                  <th>Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {order.items.map((item) => (
                  <tr key={item.id} className="border-b border-zinc-100">
                    <td className="py-3">{item.product.namaProduk}</td>
                    <td>{item.qty}</td>
                    <td>{formatCurrency(item.harga)}</td>
                    <td>{formatCurrency(item.subtotal)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Edit Pesanan</CardTitle>
          </CardHeader>
          <CardContent>
            <form action={updateOrder.bind(null, order.id)} className="space-y-4">
              <Field>
                <Label>Nomor Invoice</Label>
                <Input name="nomorInvoice" defaultValue={order.nomorInvoice} required />
              </Field>
              <Field>
                <Label>Tanggal</Label>
                <Input name="tanggal" type="date" defaultValue={order.tanggal.toISOString().slice(0, 10)} required />
              </Field>
              <Field>
                <Label>Pelanggan</Label>
                <Input name="pelanggan" defaultValue={order.pelanggan} required />
              </Field>
              <Field>
                <Label>Status</Label>
                <Select name="status" defaultValue={order.status}>
                  {Object.values(OrderStatus).map((status) => <option key={status} value={status}>{orderStatusLabel(status)}</option>)}
                </Select>
              </Field>
              <Field>
                <Label>Total</Label>
                <Input name="total" type="number" min="0" defaultValue={order.total} required />
              </Field>
              <SubmitButton>Update Pesanan</SubmitButton>
            </form>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
