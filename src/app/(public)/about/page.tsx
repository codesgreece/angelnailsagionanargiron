export const dynamic = "force-dynamic";

import { StoreImage } from "@/components/ui/store-image";
import type { Metadata } from "next";
import { FadeIn } from "@/components/ui/fade-in";
import { ButtonLink } from "@/components/ui/button-link";
import {
  getPageContentMap,
  getPageSeo,
  getSeoSettings,
  getSiteSettings,
  getTeamMembers,
} from "@/lib/services/content";
import { buildMetadata } from "@/lib/seo/metadata";

export async function generateMetadata(): Promise<Metadata> {
  const [seo, pageSeo] = await Promise.all([getSeoSettings(), getPageSeo("/about")]);
  return buildMetadata({
    title: pageSeo?.title || "Σχετικά | Angel Nails",
    description: pageSeo?.description || seo.metaDescription,
    path: "/about",
    seo,
  });
}

export default async function AboutPage() {
  const [pages, settings, team] = await Promise.all([
    getPageContentMap(),
    getSiteSettings(),
    getTeamMembers(),
  ]);
  const about = pages["about"];

  return (
    <div className="bg-[var(--brand-soft-white)] pt-28 pb-20">
      <div className="mx-auto grid max-w-7xl gap-12 px-4 md:grid-cols-2 md:px-6">
        <FadeIn>
          <p className="text-xs uppercase tracking-[0.28em] text-[var(--brand-pink)]">About</p>
          <h1
            className="mt-3 text-4xl md:text-6xl"
            style={{ fontFamily: "var(--font-cormorant), serif" }}
          >
            {about?.title || "Σχετικά με το Angel Nails"}
          </h1>
          <p className="mt-3 text-lg text-black/55">{about?.subtitle}</p>
          <div className="mt-6 space-y-4 text-base leading-relaxed text-black/70 whitespace-pre-line">
            {about?.body}
          </div>
          <div className="mt-8">
            <ButtonLink href={settings.treatwellUrl} external trackSource="about">
              Κλείσε Ραντεβού
            </ButtonLink>
          </div>
        </FadeIn>
        <FadeIn delay={0.08}>
          <div className="relative aspect-[4/5] overflow-hidden">
            <StoreImage
              src={about?.imageUrl || "/images/store/venue-1-v4.jpg"}
              alt="Angel Nails"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>
        </FadeIn>
      </div>

      {team.length > 0 && (
        <div className="mx-auto mt-20 max-w-7xl px-4 md:px-6">
          <h2 className="mb-8 text-3xl" style={{ fontFamily: "var(--font-cormorant), serif" }}>
            Ομάδα
          </h2>
          <div className="grid gap-4 sm:grid-cols-3">
            {team.map((m) => (
              <article key={m.id} className="border border-[var(--brand-warm-grey)] bg-white p-6">
                <h3 className="text-xl">{m.name}</h3>
                {m.role && <p className="mt-1 text-sm text-[var(--brand-pink)]">{m.role}</p>}
                {m.services && <p className="mt-3 text-sm text-black/60">{m.services}</p>}
                {m.bio && <p className="mt-3 text-sm text-black/60">{m.bio}</p>}
              </article>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
