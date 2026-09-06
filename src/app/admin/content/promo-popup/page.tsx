import { requireAdminPage } from "@/lib/auth/guard";
import { prisma } from "@/lib/db";
import { PromoPopupAdmin } from "@/components/admin/promo-popup-admin";

export default async function AdminPromoPopupPage() {
  await requireAdminPage();

  const [settings, site] = await Promise.all([
    prisma.promoPopupSettings.upsert({
      where: { id: "default" },
      update: {},
      create: {
        id: "default",
        enabled: true,
        frequency: "always",
        eyebrow: "ΠΡΟΣΦΟΡΑ",
        title: "Με κάθε πεντικιούρ",
        body: "Δώρο μια θεραπεία ενυδάτωσης — για απαλά, λαμπερά πόδια.",
        ctaLabel: "Κλείσε Ραντεβού",
        delayMs: 1200,
      },
    }),
    prisma.siteSettings.findUnique({ where: { id: "default" } }),
  ]);

  return (
    <PromoPopupAdmin
      initial={JSON.parse(JSON.stringify(settings))}
      treatwellUrl={site?.treatwellUrl || "https://www.treatwell.gr/katasthma/angel-nails-16/"}
    />
  );
}
