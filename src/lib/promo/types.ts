import type { PromoPopupSettings } from "@prisma/client";

export type PromoFrequency = "always" | "once";
export type PromoPopupConfig = PromoPopupSettings;

export const DEFAULT_PROMO_POPUP: PromoPopupConfig = {
  id: "default",
  enabled: true,
  frequency: "always",
  eyebrow: "ΠΡΟΣΦΟΡΑ",
  title: "Με κάθε πεντικιούρ",
  body: "Δώρο μια θεραπεία ενυδάτωσης — για απαλά, λαμπερά πόδια.",
  ctaLabel: "Κλείσε Ραντεβού",
  ctaUrl: null,
  imageUrl: null,
  delayMs: 6000,
  updatedAt: new Date(),
};

export const PROMO_STORAGE_KEY = "angel_nails_promo_popup_v1";
