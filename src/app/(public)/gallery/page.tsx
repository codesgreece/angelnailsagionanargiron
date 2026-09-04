export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { GalleryGrid } from "@/components/public/gallery-grid";
import { FadeIn } from "@/components/ui/fade-in";
import { getGalleryImages, getPageSeo, getSeoSettings } from "@/lib/services/content";
import { buildMetadata } from "@/lib/seo/metadata";

export async function generateMetadata(): Promise<Metadata> {
  const [seo, pageSeo] = await Promise.all([getSeoSettings(), getPageSeo("/gallery")]);
  return buildMetadata({
    title: pageSeo?.title || "Gallery | Angel Nails",
    description: pageSeo?.description || seo.metaDescription,
    path: "/gallery",
    seo,
  });
}

export default async function GalleryPage() {
  const images = await getGalleryImages();

  return (
    <div className="bg-white pt-28 pb-20">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <FadeIn className="mb-10 max-w-2xl">
          <p className="text-xs uppercase tracking-[0.28em] text-[var(--brand-pink)]">Gallery</p>
          <h1
            className="mt-3 text-4xl md:text-6xl"
            style={{ fontFamily: "var(--font-cormorant), serif" }}
          >
            Gallery
          </h1>
          <p className="mt-4 text-black/60">Ο χώρος και οι δημιουργίες του Angel Nails.</p>
        </FadeIn>
        <GalleryGrid images={images} />
      </div>
    </div>
  );
}
