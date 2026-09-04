"use client";

import Link from "next/link";
import { FlipBook } from "@/components/lookbook/flip-book";
import type { LookbookData } from "@/lib/lookbook/types";
import { FadeIn } from "@/components/ui/fade-in";

export function LookbookHomeSection({ data }: { data: LookbookData }) {
  if (!data.settings.homepageEnabled) return null;

  return (
    <section className="relative overflow-hidden bg-[#050507] py-16 text-white md:py-28">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(237,47,120,0.16),transparent_60%)]" />
      <div className="relative mx-auto max-w-7xl px-4 md:px-6">
        <FadeIn className="mx-auto mb-10 max-w-2xl text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-[#FF3F87]">Lookbook</p>
          <h2
            className="mt-3 text-3xl tracking-[0.06em] md:text-5xl"
            style={{ fontFamily: "var(--font-cormorant), Georgia, serif" }}
          >
            {data.settings.title}
          </h2>
          <p className="mt-3 text-white/70">{data.settings.homepageBlurb}</p>
        </FadeIn>

        <FlipBook data={data} compact />

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            href="/lookbook"
            className="inline-flex min-h-11 items-center rounded-md bg-[#ED2F78] px-5 text-sm font-semibold"
            style={{ color: "#FFFFFF" }}
          >
            EXPLORE THE LOOKBOOK
          </Link>
          <Link
            href="/lookbook"
            className="inline-flex min-h-11 items-center rounded-md border border-white/25 px-5 text-sm font-medium text-white hover:border-[#ED2F78]"
          >
            Άνοιξε το πλήρες Lookbook
          </Link>
        </div>
      </div>
    </section>
  );
}
