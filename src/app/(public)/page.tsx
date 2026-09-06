export const dynamic = "force-dynamic";

import { StoreImage } from "@/components/ui/store-image";
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
        title={hero?.title || "Angel Nails"}
        subtitle={hero?.subtitle || "Η περιποίηση των άκρων, στη δική μας αισθητική."}
        body={hero?.body || "Μανικιούρ • Πεντικιούρ • Τεχνητά Νύχια • Nail Care"}
        imageUrl={hero?.imageUrl || settings.heroImageUrl || "/images/store/venue-1-v4.jpg"}
        treatwellUrl={settings.treatwellUrl}
      />

      <section className="overflow-hidden bg-[#F7F6F4] py-16 md:py-28">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 md:grid-cols-2 md:gap-12 md:px-6">
          <FadeIn>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#ED2F78]">Angel Nails</p>
            <div className="mt-3 h-[2px] w-16 bg-[#ED2F78] anim-line" />
            <h2
              className="mt-5 text-3xl leading-tight text-[#09090B] md:text-5xl"
              style={{ fontFamily: "var(--font-cormorant), Georgia, serif" }}
            >
              {intro?.title || "Σύγχρονο nail studio στους Αγίους Αναργύρους"}
            </h2>
            <p className="mt-5 text-base leading-relaxed text-[#09090B]/75 md:text-lg">
              {intro?.body}
            </p>
            <ul className="mt-6 grid grid-cols-2 gap-3 text-sm text-[#09090B]/80">
              {[
                "Manicure",
                "Pedicure",
                "Semi-permanent",
                "Nail extensions",
                "Nail care",
                "Nail design",
                "Thread / waxing",
              ].map((item) => (
                <li key={item} className="border-l-2 border-[#ED2F78] pl-3">
                  {item}
                </li>
              ))}
            </ul>
          </FadeIn>
          <FadeIn delay={0.12} className="md:justify-self-end">
            <div className="relative mx-auto aspect-[4/5] w-full max-w-md overflow-hidden bg-[#D8D5D2] shadow-[0_24px_60px_rgba(9,9,11,0.12)] md:mx-0 md:max-w-[360px] lg:max-w-[400px]">
              <StoreImage
                src="/images/store/venue-2-v4.jpg"
                alt="Angel Nails — λεπτομέρεια νυχιών"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 400px"
              />
            </div>
          </FadeIn>
        </div>
      </section>

      <section className="bg-white py-16 md:py-28">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <FadeIn className="mb-8 max-w-2xl md:mb-10">
            <h2
              className="text-3xl text-[#09090B] md:text-5xl"
              style={{ fontFamily: "var(--font-cormorant), Georgia, serif" }}
            >
              {servicesBlock?.title || "Οι υπηρεσίες μας"}
            </h2>
            <p className="mt-3 text-[#09090B]/65">
              {servicesBlock?.subtitle || "Επιλεγμένες θεραπείες για χέρια, πόδια και nail design."}
            </p>
          </FadeIn>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((s, i) => (
              <ServiceCard key={s.id} service={s} treatwellUrl={settings.treatwellUrl} delay={i * 0.05} />
            ))}
          </div>
          <FadeIn delay={0.1} className="mt-8 md:mt-10">
            <ButtonLink href="/services" variant="secondary">
              Όλες οι υπηρεσίες
            </ButtonLink>
          </FadeIn>
        </div>
      </section>

      {gallery.length > 0 && (
        <section className="bg-[#F7F6F4] py-16 md:py-28">
          <div className="mx-auto max-w-7xl px-4 md:px-6">
            <FadeIn className="mb-8 flex items-end justify-between gap-4 md:mb-10">
              <div>
                <h2
                  className="text-3xl md:text-5xl"
                  style={{ fontFamily: "var(--font-cormorant), Georgia, serif" }}
                >
                  Gallery
                </h2>
                <p className="mt-2 text-[#09090B]/65">Στιγμές από τον χώρο του Angel Nails.</p>
              </div>
              <ButtonLink href="/gallery" variant="outline" className="hidden sm:inline-flex">
                Δες περισσότερα
              </ButtonLink>
            </FadeIn>
            <div className="grid grid-cols-2 gap-2 md:gap-3 lg:grid-cols-3">
              {gallery.slice(0, 6).map((img, i) => (
                <FadeIn key={img.id} delay={i * 0.04} className={i === 0 ? "col-span-2 lg:col-span-1" : ""}>
                  <div className="relative aspect-[4/5] overflow-hidden bg-black/5">
                    <StoreImage
                      src={img.imageUrl}
                      alt={img.altText || img.title || "Angel Nails"}
                      fill
                      className="object-cover transition duration-700 hover:scale-[1.02]"
                      sizes="(max-width: 768px) 50vw, 33vw"
                    />
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>
        </section>
      )}

      {team.length > 0 && (
        <section className="bg-white py-16 md:py-28">
          <div className="mx-auto max-w-7xl px-4 md:px-6">
            <FadeIn className="mb-8 md:mb-10">
              <h2
                className="text-3xl md:text-5xl"
                style={{ fontFamily: "var(--font-cormorant), Georgia, serif" }}
              >
                Η ομάδα μας
              </h2>
            </FadeIn>
            <div className="grid gap-4 sm:grid-cols-3">
              {team.map((m, i) => (
                <FadeIn key={m.id} delay={i * 0.06}>
                  <article className="border border-[#D8D5D2] bg-[#F7F6F4] p-6 transition hover:-translate-y-1 hover:border-[#ED2F78]/40">
                    <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#09090B] text-xl text-[#FF3F87]">
                      {m.name.charAt(0)}
                    </div>
                    <h3 className="text-xl" style={{ fontFamily: "var(--font-cormorant), Georgia, serif" }}>
                      {m.name}
                    </h3>
                    {m.role && <p className="mt-1 text-sm font-medium text-[#ED2F78]">{m.role}</p>}
                    {m.services && <p className="mt-3 text-sm text-[#09090B]/65">{m.services}</p>}
                  </article>
                </FadeIn>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="bg-[#09090B] py-16 text-white md:py-24">
        <div className="mx-auto max-w-7xl px-4 text-center md:px-6">
          <FadeIn>
            <h2
              className="text-4xl text-[#FF3F87] md:text-5xl"
              style={{ fontFamily: "var(--font-great-vibes), 'Great Vibes', cursive" }}
            >
              Angel Nails
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-white/85">
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
