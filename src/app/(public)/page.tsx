export const dynamic = "force-dynamic";

import Image from "next/image";
import type { Metadata } from "next";
import { HeroSection } from "@/components/public/hero-section";
import { ServiceCard } from "@/components/public/service-card";
import { FadeIn } from "@/components/ui/fade-in";
import { ButtonLink } from "@/components/ui/button-link";
import {
  getFeaturedServices,
  getGalleryImages,
  getPageContentMap,
  getPageSeo,
  getSeoSettings,
  getSiteSettings,
  getTeamMembers,
} from "@/lib/services/content";
import { buildMetadata } from "@/lib/seo/metadata";

export async function generateMetadata(): Promise<Metadata> {
  const [seo, pageSeo, settings] = await Promise.all([
    getSeoSettings(),
    getPageSeo("/"),
    getSiteSettings(),
  ]);
  return buildMetadata({
    title: pageSeo?.title || seo.siteTitle,
    description: pageSeo?.description || seo.metaDescription,
    path: "/",
    ogImage: pageSeo?.ogImageUrl || settings.heroImageUrl || seo.ogImageUrl,
    seo,
  });
}

export default async function HomePage() {
  const [settings, pages, featured, gallery, team] = await Promise.all([
    getSiteSettings(),
    getPageContentMap(),
    getFeaturedServices(),
    getGalleryImages({ featuredOnly: true }),
    getTeamMembers(),
  ]);

  const hero = pages["home.hero"];
  const intro = pages["home.intro"];
  const servicesBlock = pages["home.services"];

  return (
    <>
      <HeroSection
        title={hero?.title || "ANGEL NAILS"}
        subtitle={hero?.subtitle || "Η περιποίηση των άκρων, στη δική μας αισθητική."}
        body={hero?.body}
        imageUrl={hero?.imageUrl || settings.heroImageUrl || "/images/store/venue-1.png"}
        treatwellUrl={settings.treatwellUrl}
      />

      <section className="bg-[var(--brand-soft-white)] py-20 md:py-28">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 md:grid-cols-2 md:px-6">
          <FadeIn>
            <p className="text-xs uppercase tracking-[0.28em] text-[var(--brand-pink)]">Angel Nails</p>
            <h2
              className="mt-3 text-4xl leading-tight text-[var(--brand-black)] md:text-5xl"
              style={{ fontFamily: "var(--font-cormorant), serif" }}
            >
              {intro?.title || "Σύγχρονο nail studio στους Αγίους Αναργύρους"}
            </h2>
            <p className="mt-5 text-base leading-relaxed text-black/65 md:text-lg">
              {intro?.body}
            </p>
            <ul className="mt-6 grid grid-cols-2 gap-2 text-sm text-black/70">
              {[
                "Manicure",
                "Pedicure",
                "Semi-permanent",
                "Nail extensions",
                "Nail care",
                "Nail design",
                "Thread / waxing",
              ].map((item) => (
                <li key={item} className="border-l border-[var(--brand-pink)]/50 pl-3">
                  {item}
                </li>
              ))}
            </ul>
          </FadeIn>
          <FadeIn delay={0.1}>
            <div className="relative aspect-[4/5] overflow-hidden bg-[var(--brand-warm-grey)]">
              <Image
                src="/images/store/venue-1.png"
                alt="Angel Nails storefront"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
          </FadeIn>
        </div>
      </section>

      <section className="bg-white py-20 md:py-28">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <FadeIn className="mb-10 max-w-2xl">
            <h2
              className="text-4xl text-[var(--brand-black)] md:text-5xl"
              style={{ fontFamily: "var(--font-cormorant), serif" }}
            >
              {servicesBlock?.title || "Οι υπηρεσίες μας"}
            </h2>
            <p className="mt-3 text-black/60">{servicesBlock?.subtitle}</p>
          </FadeIn>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((s, i) => (
              <ServiceCard key={s.id} service={s} treatwellUrl={settings.treatwellUrl} delay={i * 0.05} />
            ))}
          </div>
          <div className="mt-10">
            <ButtonLink href="/services" variant="secondary">
              Όλες οι υπηρεσίες
            </ButtonLink>
          </div>
        </div>
      </section>

      {gallery.length > 0 && (
        <section className="bg-[var(--brand-soft-white)] py-20 md:py-28">
          <div className="mx-auto max-w-7xl px-4 md:px-6">
            <FadeIn className="mb-10 flex items-end justify-between gap-4">
              <div>
                <h2
                  className="text-4xl md:text-5xl"
                  style={{ fontFamily: "var(--font-cormorant), serif" }}
                >
                  Gallery
                </h2>
                <p className="mt-2 text-black/60">Στιγμές από τον χώρο του Angel Nails.</p>
              </div>
              <ButtonLink href="/gallery" variant="outline" className="hidden sm:inline-flex">
                Δες περισσότερα
              </ButtonLink>
            </FadeIn>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {gallery.slice(0, 6).map((img) => (
                <div key={img.id} className="relative aspect-[4/5] overflow-hidden bg-black/5">
                  <Image
                    src={img.imageUrl}
                    alt={img.altText || img.title || "Angel Nails"}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {team.length > 0 && (
        <section className="bg-white py-20 md:py-28">
          <div className="mx-auto max-w-7xl px-4 md:px-6">
            <FadeIn className="mb-10">
              <h2
                className="text-4xl md:text-5xl"
                style={{ fontFamily: "var(--font-cormorant), serif" }}
              >
                Η ομάδα μας
              </h2>
            </FadeIn>
            <div className="grid gap-6 sm:grid-cols-3">
              {team.map((m, i) => (
                <FadeIn key={m.id} delay={i * 0.06}>
                  <article className="border border-[var(--brand-warm-grey)]/70 bg-[var(--brand-soft-white)] p-6">
                    <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[var(--brand-black)] text-xl text-[var(--brand-pink-bright)]">
                      {m.name.charAt(0)}
                    </div>
                    <h3 className="text-xl" style={{ fontFamily: "var(--font-cormorant), serif" }}>
                      {m.name}
                    </h3>
                    {m.role && <p className="mt-1 text-sm text-[var(--brand-pink)]">{m.role}</p>}
                    {m.services && <p className="mt-3 text-sm text-black/60">{m.services}</p>}
                  </article>
                </FadeIn>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="bg-[var(--brand-black)] py-20 text-white md:py-24">
        <div className="mx-auto max-w-7xl px-4 text-center md:px-6">
          <FadeIn>
            <h2
              className="text-4xl text-[var(--brand-pink-bright)] md:text-5xl"
              style={{ fontFamily: "var(--font-script), cursive" }}
            >
              Angel Nails
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-white/70">
              Κλείστε το ραντεβού σας online μέσω Treatwell.
            </p>
            <div className="mt-8 flex justify-center">
              <ButtonLink href={settings.treatwellUrl} external size="lg">
                Κλείσε Ραντεβού
              </ButtonLink>
            </div>
          </FadeIn>
        </div>
      </section>
    </>
  );
}
