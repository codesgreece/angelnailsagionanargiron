export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { ServicesBrowser } from "@/components/public/services-browser";
import { FadeIn } from "@/components/ui/fade-in";
import {
  getActiveServices,
  getPageSeo,
  getSeoSettings,
  getSiteSettings,
} from "@/lib/services/content";
import { buildMetadata } from "@/lib/seo/metadata";

export async function generateMetadata(): Promise<Metadata> {
  const [seo, pageSeo] = await Promise.all([getSeoSettings(), getPageSeo("/services")]);
  return buildMetadata({
    title: pageSeo?.title || "Υπηρεσίες | Angel Nails",
    description: pageSeo?.description || seo.metaDescription,
    path: "/services",
    seo,
  });
}

export default async function ServicesPage() {
  const [services, settings] = await Promise.all([getActiveServices(), getSiteSettings()]);

  return (
    <div className="bg-[var(--brand-soft-white)] pt-28 pb-20">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <FadeIn className="mb-10 max-w-2xl">
          <p className="text-xs uppercase tracking-[0.28em] text-[var(--brand-pink)]">Services</p>
          <h1
            className="mt-3 text-4xl md:text-6xl"
            style={{ fontFamily: "var(--font-cormorant), serif" }}
          >
            Υπηρεσίες
          </h1>
          <p className="mt-4 text-black/60">
            Όλες οι τιμές και οι διάρκειες ενημερώνονται από το Angel Nails. Το ραντεβού κλείνει μέσω
            Treatwell.
          </p>
        </FadeIn>
        <ServicesBrowser services={services} treatwellUrl={settings.treatwellUrl} />
      </div>
    </div>
  );
}
