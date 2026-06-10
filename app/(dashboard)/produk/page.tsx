import { Search, Trash2 } from "lucide-react";
import { createProduct, deleteProduct, updateProduct } from "@/lib/actions/product-actions";
import { Button, ButtonLink } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, Input, Label, Select } from "@/components/ui/form";
import { SubmitButton } from "@/components/ui/submit-button";
import { prisma } from "@/lib/prisma";
import type { PageSearchParams } from "@/lib/types";
import { formatCurrency, formatDate, getPagination } from "@/lib/utils";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";


export default async function ProductsPage({ searchParams }: { searchParams: PageSearchParams }) {
  const session = await getServerSession(authOptions);
  const params = await searchParams;
  const q = String(params.q || "");
  const kategori = String(params.kategori || "");
  const { page, pageSize, skip } = getPagination(params);

  const [categories, products, total, sales] = await Promise.all([
    prisma.category.findMany({ orderBy: { name: "asc" } }),
    prisma.product.findMany({
      where: {
        ...(q ? { OR: [{ namaProduk: { contains: q } }, { sku: { contains: q } }] } : {}),
        ...(kategori ? { kategoriId: kategori } : {}),
      },
      include: { kategori: true },
      orderBy: { createdAt: "desc" },
      skip,
      take: pageSize,
    }),
    prisma.product.count({
      where: {
        ...(q ? { OR: [{ namaProduk: { contains: q } }, { sku: { contains: q } }] } : {}),
        ...(kategori ? { kategoriId: kategori } : {}),
      },
    }),
    prisma.orderItem.groupBy({
      by: ["productId"],
      _sum: {
      qty: true,
    },
  }),
  ]);
  const totalPages = Math.max(Math.ceil(total / pageSize), 1);
  const soldMap = new Map(
  sales.map((item) => [
    item.productId,
    item._sum.qty || 0,
  ])
);
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Manajemen Produk</h1>
          <p className="text-sm text-zinc-500">Kelola SKU, harga, stok, kategori, dan foto produk.</p>
        </div>
        <ButtonLink href="/api/export/produk">
  Export Excel
</ButtonLink>
      </div>

      {session?.user?.role === "ADMIN" && (
  <Card>
    <CardHeader>
      <CardTitle>Tambah Produk</CardTitle>
    </CardHeader>
    <CardContent>
      <ProductForm
        action={createProduct}
        categories={categories.map((item) => item.name)}
      />
    </CardContent>
  </Card>
)}

      <Card>
        <CardHeader>
          <form className="grid gap-3 md:grid-cols-[1fr_220px_auto]">
            <label className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={17} />
              <Input name="q" defaultValue={q} placeholder="Cari nama produk atau SKU" className="pl-9" />
            </label>
            <Select name="kategori" defaultValue={kategori}>
              <option value="">Semua kategori</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>{category.name}</option>
              ))}
            </Select>
            <Button type="submit" variant="secondary">Filter</Button>
          </form>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full min-w-[920px] text-left text-sm">
            <thead className="text-xs uppercase text-zinc-500">
              <tr className="border-b border-zinc-100">
                <th className="py-3">Produk</th>
                <th>SKU</th>
                <th>Kategori</th>
                <th>Modal</th>
                <th>Jual</th>
                <th>Stok</th>
                <th>Terjual</th>
                <th>Dibuat</th>
                <th className="text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id} className="border-b border-zinc-100 align-top">
                  <td className="py-3">
                    <div className="flex items-center gap-3">
                      <div className="size-12 overflow-hidden rounded-md bg-zinc-100">
                        {product.fotoProduk ? <img src={product.fotoProduk} alt="" className="size-full object-cover" /> : null}
                      </div>
                      <span className="font-medium text-zinc-950">{product.namaProduk}</span>
                    </div>
                  </td>
                  <td>{product.sku}</td>
                  <td>{product.kategori.name}</td>
                  <td>{formatCurrency(product.hargaModal)}</td>
                  <td>{formatCurrency(product.hargaJual)}</td>
                  <td>{product.stok}</td>
                  <td>{soldMap.get(product.id) || 0}</td>
                  <td>{formatDate(product.createdAt)}</td>
                  <td>
  <div className="flex justify-end gap-2">
    {session?.user?.role === "ADMIN" && (
      <>
        <details className="group">
          <summary className="cursor-pointer rounded-md border border-zinc-200 px-3 py-2 text-sm font-medium marker:content-none hover:bg-zinc-50">
            Edit
          </summary>

          <div className="absolute right-6 z-10 mt-2 w-[min(720px,calc(100vw-2rem))] rounded-lg border border-zinc-200 bg-white p-4 shadow-xl">
            <ProductForm
              action={updateProduct.bind(null, product.id)}
              categories={categories.map((item) => item.name)}
              product={product}
            />
          </div>
        </details>

        <form action={deleteProduct.bind(null, product.id)}>
          <Button
            type="submit"
            variant="ghost"
            className="px-3"
            aria-label="Hapus produk"
          >
            <Trash2 size={16} />
          </Button>
        </form>
      </>
    )}
  </div>
</td>
                </tr>
              ))}
            </tbody>
          </table>
          {products.length === 0 && <p className="py-10 text-center text-sm text-zinc-500">Belum ada produk.</p>}
          <div className="mt-4 flex items-center justify-between text-sm text-zinc-500">
            <span>Halaman {page} dari {totalPages}</span>
            <div className="flex gap-2">
              <ButtonLink href={`/produk?page=${Math.max(page - 1, 1)}&q=${q}&kategori=${kategori}`} variant="secondary">Prev</ButtonLink>
              <ButtonLink href={`/produk?page=${Math.min(page + 1, totalPages)}&q=${q}&kategori=${kategori}`} variant="secondary">Next</ButtonLink>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function ProductForm({
  action,
  categories,
  product,
}: {
  action: (formData: FormData) => void | Promise<void>;
  categories: string[];
  product?: { sku: string; namaProduk: string; kategori: { name: string }; hargaModal: number; hargaJual: number; stok: number };
}) {
  return (
    <form action={action} className="grid gap-4 md:grid-cols-3">
      <Field>
        <Label>SKU</Label>
        <Input name="sku" required defaultValue={product?.sku} />
      </Field>
      <Field>
        <Label>Nama Produk</Label>
        <Input name="namaProduk" required defaultValue={product?.namaProduk} />
      </Field>
      <Field>
        <Label>Kategori</Label>
        <Input name="kategori" list="category-options" required defaultValue={product?.kategori.name} />
        <datalist id="category-options">
          {categories.map((category) => <option key={category} value={category} />)}
        </datalist>
      </Field>
      <Field>
        <Label>Harga Modal</Label>
        <Input name="hargaModal" type="number" min="0" required defaultValue={product?.hargaModal} />
      </Field>
      <Field>
        <Label>Harga Jual</Label>
        <Input name="hargaJual" type="number" min="0" required defaultValue={product?.hargaJual} />
      </Field>
      <Field>
        <Label>Stok</Label>
        <Input name="stok" type="number" min="0" required defaultValue={product?.stok} />
      </Field>
      <Field className="md:col-span-2">
        <Label>Foto Produk</Label>
        <Input name="fotoProduk" type="file" accept="image/*" />
      </Field>
      <div className="flex items-end">
        <SubmitButton>{product ? "Update Produk" : "Tambah Produk"}</SubmitButton>
      </div>
    </form>
  );
}
