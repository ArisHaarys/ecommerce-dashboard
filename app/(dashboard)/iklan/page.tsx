import { requireAdmin } from "@/lib/auth-guard";
import { Trash2 } from "lucide-react";
import { CampaignPlatform } from "@prisma/client";
import { createCampaign, deleteCampaign } from "@/lib/actions/campaign-actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, Input, Label, Select } from "@/components/ui/form";
import { SubmitButton } from "@/components/ui/submit-button";
import { Badge, platformLabel } from "@/components/ui/status-badge";
import { prisma } from "@/lib/prisma";
import { formatCurrency, formatDate } from "@/lib/utils";

export default async function CampaignPage() {
  await requireAdmin();
  const campaigns = await prisma.campaign.findMany({ orderBy: { tanggal: "desc" } });
  const spend = campaigns.reduce((sum, item) => sum + item.biayaIklan, 0);
  const leads = campaigns.reduce((sum, item) => sum + item.leads, 0);
  const conversion = campaigns.reduce((sum, item) => sum + item.conversion, 0);
  const sales = campaigns.reduce((sum, item) => sum + item.penjualan, 0);
  const criticalStockCount = await prisma.product.count({
  where: {
    stok: {
      lte: 5,
    },
  },
});

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Rekap Iklan</h1>
        <p className="text-sm text-zinc-500">Pantau Shopee Ads, TikTok Ads, dan Offline Campaign.</p>
      </div>

      <section className="grid gap-4 md:grid-cols-4">
        <Summary title="Total Ads Spend" value={formatCurrency(spend)} />
        <Summary title="Total Leads" value={String(leads)} />
        <Summary title="Conversion Rate" value={`${leads ? ((conversion / leads) * 100).toFixed(1) : "0"}%`} />
        <Summary title="ROAS" value={`${spend ? (sales / spend).toFixed(2) : "0.00"}x`} />
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Tambah Campaign</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={createCampaign} className="grid gap-4 md:grid-cols-4">
            <Field>
              <Label>Platform</Label>
              <Select name="platform">
                {Object.values(CampaignPlatform).map((platform) => <option key={platform} value={platform}>{platformLabel(platform)}</option>)}
              </Select>
            </Field>
            <Field>
              <Label>Campaign</Label>
              <Input name="campaign" required />
            </Field>
            <Field>
              <Label>Tanggal</Label>
              <Input name="tanggal" type="date" required />
            </Field>
            <Field>
              <Label>Biaya Iklan</Label>
              <Input name="biayaIklan" type="number" min="0" required />
            </Field>
            <Field>
              <Label>Leads</Label>
              <Input name="leads" type="number" min="0" required />
            </Field>
            <Field>
              <Label>Conversion</Label>
              <Input name="conversion" type="number" min="0" required />
            </Field>
            <Field>
              <Label>Penjualan</Label>
              <Input name="penjualan" type="number" min="0" required />
            </Field>
            <div className="flex items-end">
              <SubmitButton>Tambah Campaign</SubmitButton>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Riwayat Campaign</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full min-w-[860px] text-left text-sm">
            <thead className="text-xs uppercase text-zinc-500">
              <tr className="border-b border-zinc-100">
                <th className="py-3">Tanggal</th>
                <th>Platform</th>
                <th>Campaign</th>
                <th>Spend</th>
                <th>Leads</th>
                <th>Conversion</th>
                <th>Penjualan</th>
                <th>ROAS</th>
                <th className="text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {campaigns.map((campaign) => (
                <tr key={campaign.id} className="border-b border-zinc-100">
                  <td className="py-3">{formatDate(campaign.tanggal)}</td>
                  <td><Badge>{platformLabel(campaign.platform)}</Badge></td>
                  <td className="font-medium">{campaign.campaign}</td>
                  <td>{formatCurrency(campaign.biayaIklan)}</td>
                  <td>{campaign.leads}</td>
                  <td>{campaign.conversion}</td>
                  <td>{formatCurrency(campaign.penjualan)}</td>
                  <td>{campaign.biayaIklan ? (campaign.penjualan / campaign.biayaIklan).toFixed(2) : "0.00"}x</td>
                  <td>
                    <form action={deleteCampaign.bind(null, campaign.id)} className="flex justify-end">
                      <Button type="submit" variant="ghost" className="px-3" aria-label="Hapus campaign"><Trash2 size={16} /></Button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {campaigns.length === 0 && <p className="py-10 text-center text-sm text-zinc-500">Belum ada campaign.</p>}
        </CardContent>
      </Card>
    </div>
  );
}

function Summary({ title, value }: { title: string; value: string }) {
  return (
    <Card>
      <CardContent>
        <p className="text-sm font-medium text-zinc-500">{title}</p>
        <p className="mt-3 text-2xl font-semibold">{value}</p>
      </CardContent>
    </Card>
  );
}
