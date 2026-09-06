import { PROMO_STORAGE_KEY, type PromoFrequency } from "@/lib/promo/types";

/** Campaign fingerprint — when admin edits the offer, "once" users see it again. */
export function promoCampaignId(updatedAt: string | Date): string {
  return typeof updatedAt === "string" ? updatedAt : updatedAt.toISOString();
}

export function shouldShowPromoPopup(
  frequency: PromoFrequency | string,
  campaignId: string,
  force = false,
): boolean {
  if (force) return true;
  if (typeof window === "undefined") return false;
  if (frequency === "always") return true;

  try {
    return localStorage.getItem(PROMO_STORAGE_KEY) !== campaignId;
  } catch {
    return true;
  }
}

export function markPromoPopupSeen(campaignId: string) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(PROMO_STORAGE_KEY, campaignId);
  } catch {
    // ignore
  }
}
