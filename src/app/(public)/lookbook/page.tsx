export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { FlipBook } from "@/components/lookbook/flip-book";
import { getLookbookData } from "@/lib/lookbook/data";
import { buildMetadata } from "@/lib/seo/metadata";
import { getSeoSettings } from "@/lib/services/content";

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getSeoSettings();
  return buildMetadata({
    title: "Lookbook | Angel Nails",
    description: "THE ANGEL NAILS BOOK — nail looks, details & inspiration.",
    path: "/lookbook",
    seo,
  });
}

export default async function LookbookPage() {
  const data = await getLookbookData();

  return (
    <div className="min-h-screen bg-[#050507] pb-36 pt-24 text-white md:pb-24">
      <div className="mx-auto max-w-5xl px-4 text-center md:px-6">
        <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-[#FF3F87]">Lookbook</p>
        <h1
          className="mt-3 text-4xl tracking-[0.08em] md:text-6xl"
          style={{ fontFamily: "var(--font-cormorant), Georgia, serif" }}
        >
          {data.settings.title}
        </h1>
        <p className="mt-3 text-sm uppercase tracking-[0.22em] text-white/65">{data.settings.subtitle}</p>
        <p className="mx-auto mt-4 max-w-xl text-white/70">Find your next nail look.</p>
      </div>

      <div className="mt-10 md:mt-14">
        <FlipBook data={data} autoOpen />
      </div>
    </div>
  );
}
