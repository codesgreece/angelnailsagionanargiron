export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { Mail, MapPin, Phone } from "lucide-react";
import { FadeIn } from "@/components/ui/fade-in";
import { ButtonLink } from "@/components/ui/button-link";
import {
  getOpeningHours,
  getPageContentMap,
  getPageSeo,
  getSeoSettings,
  getSiteSettings,
} from "@/lib/services/content";
import { buildMetadata } from "@/lib/seo/metadata";
import { whatsappUrl } from "@/lib/utils";

export async function generateMetadata(): Promise<Metadata> {
  const [seo, pageSeo] = await Promise.all([getSeoSettings(), getPageSeo("/contact")]);
  return buildMetadata({
    title: pageSeo?.title || "Επικοινωνία | Angel Nails",
    description: pageSeo?.description || seo.metaDescription,
    path: "/contact",
    seo,
  });
}

export default async function ContactPage() {
  const [settings, pages, hours] = await Promise.all([
    getSiteSettings(),
    getPageContentMap(),
    getOpeningHours(),
  ]);
  const contact = pages["contact"];
  const orderedHours = [...hours].sort((a, b) => {
    const order = [1, 2, 3, 4, 5, 6, 0];
    return order.indexOf(a.dayOfWeek) - order.indexOf(b.dayOfWeek);
  });

  return (
    <div className="bg-white pt-28 pb-20">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <FadeIn className="mb-10 max-w-2xl">
          <p className="text-xs uppercase tracking-[0.28em] text-[var(--brand-pink)]">Contact</p>
          <h1
            className="mt-3 text-4xl md:text-6xl"
            style={{ fontFamily: "var(--font-cormorant), serif" }}
          >
            {contact?.title || "Επικοινωνία"}
          </h1>
          <p className="mt-4 text-black/60">{contact?.body}</p>
        </FadeIn>

        <div className="grid gap-8 lg:grid-cols-2">
          <FadeIn>
            <div className="space-y-6 border border-[var(--brand-warm-grey)] bg-[var(--brand-soft-white)] p-6 md:p-8">
              <div>
                <h2 className="text-2xl" style={{ fontFamily: "var(--font-cormorant), serif" }}>
                  Angel Nails
                </h2>
                <p className="mt-3 flex items-start gap-2 text-black/70">
                  <MapPin className="mt-0.5 h-4 w-4 text-[var(--brand-pink)]" />
                  <span>
                    {settings.addressLine1}
                    <br />
                    {settings.city}, {settings.region}
                    <br />
                    {settings.postalCode}
                  </span>
                </p>
              </div>
              <div className="space-y-2 text-black/70">
                <p className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-[var(--brand-pink)]" />
                  <a href={`tel:${settings.phonePrimary}`}>{settings.phonePrimary}</a>
                </p>
                {settings.phoneSecondary && (
                  <p className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-[var(--brand-pink)]" />
                    <a href={`tel:${settings.phoneSecondary}`}>{settings.phoneSecondary}</a>
                  </p>
                )}
                <p className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-[var(--brand-pink)]" />
                  <a href={`mailto:${settings.email}`}>{settings.email}</a>
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <ButtonLink href={`tel:${settings.phonePrimary}`} size="sm">
                  Κλήση
                </ButtonLink>
                <ButtonLink href={`mailto:${settings.email}`} variant="secondary" size="sm">
                  Email
                </ButtonLink>
                {settings.phoneSecondary && (
                  <ButtonLink
                    href={whatsappUrl(settings.phoneSecondary, "Γεια σας, θα ήθελα πληροφορίες για ραντεβού στο Angel Nails.")}
                    external
                    variant="outline"
                    size="sm"
                  >
                    WhatsApp
                  </ButtonLink>
                )}
                <ButtonLink href={settings.treatwellUrl} external size="sm">
                  Treatwell
                </ButtonLink>
              </div>
              <div>
                <h3 className="mb-3 text-sm font-semibold uppercase tracking-[0.18em]">Ωράριο</h3>
                <ul className="space-y-2 text-sm text-black/65">
                  {orderedHours.map((h) => (
                    <li key={h.id} className="flex justify-between gap-4">
                      <span>{h.dayNameEl}</span>
                      <span>{h.closed ? "Κλειστά" : `${h.openTime} – ${h.closeTime}`}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </FadeIn>

          <FadeIn delay={0.08}>
            <div>
              <h2 className="mb-4 text-2xl" style={{ fontFamily: "var(--font-cormorant), serif" }}>
                Πώς θα μας βρείτε
              </h2>
              <div className="overflow-hidden border border-[var(--brand-warm-grey)]">
                <iframe
                  title="Angel Nails χάρτης"
                  src={settings.mapEmbedUrl}
                  className="h-[420px] w-full"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
            </div>
          </FadeIn>
        </div>
      </div>
    </div>
  );
}
