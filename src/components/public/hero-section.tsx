"use client";

import Image from "next/image";
import { FadeIn } from "@/components/ui/fade-in";
import { ButtonLink } from "@/components/ui/button-link";

export function HeroSection({
  title,
  subtitle,
  body,
  imageUrl,
  treatwellUrl,
}: {
  title: string;
  subtitle: string;
  body?: string | null;
  imageUrl: string;
  treatwellUrl: string;
}) {
  return (
    <section className="relative min-h-[100svh] overflow-hidden bg-[var(--brand-black)] text-white">
      <div className="absolute inset-0">
        <Image
          src={imageUrl}
          alt="Angel Nails — χώρος στο κατάστημα"
          fill
          priority
          className="object-cover object-center opacity-55"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/75 to-black/35" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30" />
      </div>

      <div className="relative mx-auto flex min-h-[100svh] max-w-7xl flex-col justify-end px-4 pb-20 pt-32 md:justify-center md:px-6 md:pb-24">
        <FadeIn>
          <p className="mb-4 text-xs uppercase tracking-[0.35em] text-white/70">Άγιοι Ανάργυροι</p>
          <h1
            className="max-w-3xl text-5xl leading-[0.95] text-[var(--brand-pink-bright)] md:text-7xl lg:text-8xl"
            style={{ fontFamily: "var(--font-script), cursive" }}
          >
            {title}
          </h1>
          <p className="mt-6 max-w-xl text-xl font-light leading-relaxed text-white/90 md:text-2xl">
            {subtitle}
          </p>
          {body && (
            <p className="mt-4 text-sm uppercase tracking-[0.22em] text-white/60">{body}</p>
          )}
          <div className="mt-8 flex flex-wrap gap-3">
            <ButtonLink href={treatwellUrl} external size="lg">
              Κλείσε Ραντεβού
            </ButtonLink>
            <ButtonLink href="/services" variant="outline" size="lg" className="border-white/30 text-white">
              Δες τις Υπηρεσίες
            </ButtonLink>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
