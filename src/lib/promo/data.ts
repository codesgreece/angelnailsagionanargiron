import { cache } from "react";
import { prisma } from "@/lib/db";
import { DEFAULT_PROMO_POPUP, type PromoPopupConfig } from "@/lib/promo/types";

const DEFAULT_CREATE = {
  id: "default",
  enabled: true,
  frequency: "always",
  eyebrow: "ΠΡΟΣΦΟΡΑ",
  title: "Με κάθε πεντικιούρ",
  body: "Δώρο μια θεραπεία ενυδάτωσης — για απαλά, λαμπερά πόδια.",
  ctaLabel: "Κλείσε Ραντεβού",
  delayMs: 6000,
} as const;

export async function ensurePromoPopupSettings(): Promise<PromoPopupConfig> {
  return (
    (await prisma.promoPopupSettings.findUnique({ where: { id: "default" } })) ||
    (await prisma.promoPopupSettings.create({ data: { ...DEFAULT_CREATE } }))
  );
}

export const getPromoPopupSettings = cache(async (): Promise<PromoPopupConfig> => {
  try {
    return await ensurePromoPopupSettings();
  } catch {
    return DEFAULT_PROMO_POPUP;
  }
});
