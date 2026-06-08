"use server";

import { CampaignPlatform } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { toNumber } from "@/lib/utils";

export async function createCampaign(formData: FormData) {
  await prisma.campaign.create({
    data: {
      platform: formData.get("platform") as CampaignPlatform,
      campaign: String(formData.get("campaign") || "").trim(),
      tanggal: new Date(String(formData.get("tanggal") || new Date().toISOString())),
      biayaIklan: toNumber(formData.get("biayaIklan")),
      leads: toNumber(formData.get("leads")),
      conversion: toNumber(formData.get("conversion")),
      penjualan: toNumber(formData.get("penjualan")),
    },
  });

  revalidatePath("/iklan");
}

export async function deleteCampaign(id: string) {
  await prisma.campaign.delete({ where: { id } });
  revalidatePath("/iklan");
}
