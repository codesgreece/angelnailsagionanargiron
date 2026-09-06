import { requireAdminPage } from "@/lib/auth/guard";
import { prisma } from "@/lib/db";
import { PromoPopupAdmin } from "@/components/admin/promo-popup-admin";
import { ensurePromoPopupSettings } from "@/lib/promo/data";
import { DEFAULT_PROMO_POPUP } from "@/lib/promo/types";

export default async function AdminPromoPopupPage() {
  await requireAdminPage();

  let settings = DEFAULT_PROMO_POPUP;
  let treatwellUrl = "https://www.treatwell.gr/katasthma/angel-nails-16/";

  try {
    const [promo, site] = await Promise.all([
      ensurePromoPopupSettings(),
      prisma.siteSettings.findUnique({ where: { id: "default" } }),
    ]);
    settings = promo;
    if (site?.treatwellUrl) treatwellUrl = site.treatwellUrl;
  } catch (error) {
    console.error("[admin/promo-popup] failed to load settings", error);
  }

  return (
    <PromoPopupAdmin
      initial={JSON.parse(JSON.stringify(settings))}
      treatwellUrl={treatwellUrl}
    />
  );
}
