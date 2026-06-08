import { OrderStatus, StockMutationType, CampaignPlatform } from "@prisma/client";

const orderLabels: Record<OrderStatus, string> = {
  BARU: "Baru",
  DIPROSES: "Diproses",
  DIKIRIM: "Dikirim",
  SELESAI: "Selesai",
  DIBATALKAN: "Dibatalkan",
};

const stockLabels: Record<StockMutationType, string> = {
  STOK_MASUK: "Stok Masuk",
  STOK_KELUAR: "Stok Keluar",
  PENYESUAIAN: "Penyesuaian",
};

const platformLabels: Record<CampaignPlatform, string> = {
  SHOPEE_ADS: "Shopee Ads",
  TIKTOK_ADS: "TikTok Ads",
  OFFLINE_CAMPAIGN: "Offline Campaign",
};

export function orderStatusLabel(status: OrderStatus) {
  return orderLabels[status];
}

export function stockTypeLabel(type: StockMutationType) {
  return stockLabels[type];
}

export function platformLabel(platform: CampaignPlatform) {
  return platformLabels[platform];
}

export function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-700">
      {children}
    </span>
  );
}
