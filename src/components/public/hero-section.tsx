"use client";

import { StoreImage } from "@/components/ui/store-image";
import { motion, useReducedMotion } from "framer-motion";
import { ButtonLink } from "@/components/ui/button-link";
import { sharpStoreImage } from "@/lib/images/sharp-store";

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
  const reduce = useReducedMotion();
  const displayTitle = title === "ANGEL NAILS" ? "Angel Nails" : title;
  const photo = sharpStoreImage(imageUrl);

  return (
    <section className="relative overflow-hidden bg-[#09090B] text-white">
      {/* Mobile: full-bleed photo with lighter veil */}
      <div className="absolute inset-0 md:hidden">
        <StoreImage
          src={photo}
          alt="Angel Nails — nail studio στους Αγίους Αναργύρους"
          fill
          priority
          sizes="100vw"
          className="object-cover object-[center_30%]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/45 to-black/20" />
      </div>

      <div className="relative mx-auto grid min-h-[100svh] max-w-7xl md:grid-cols-2">
        {/* Copy panel — solid, no stretched background photo behind text */}
        <div className="relative z-10 flex flex-col justify-end px-4 pb-24 pt-28 md:justify-center md:px-8 md:pb-20 lg:px-10">
          <div className="pointer-events-none absolute inset-0 hidden bg-[#09090B] md:block" />
          <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-24 bg-gradient-to-r from-[#09090B] to-transparent md:block" />

          <motion.div
            className="relative"
            initial={reduce ? false : { opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
          >
            <p className="mb-3 text-[11px] font-medium uppercase tracking-[0.32em] text-white/85">
              Άγιοι Ανάργυροι
            </p>
            <h1
              className="max-w-xl text-[3.2rem] leading-[0.92] text-[#FF3F87] sm:text-6xl md:text-7xl lg:text-8xl"
              style={{ fontFamily: "var(--font-great-vibes), 'Great Vibes', cursive" }}
            >
              {displayTitle}
            </h1>
            <p className="mt-5 max-w-md text-lg font-medium leading-relaxed text-white md:text-xl">
              {subtitle}
            </p>
            {body && (
              <p className="mt-4 text-[11px] font-medium uppercase tracking-[0.18em] text-white/80">
                {body}
              </p>
            )}
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <span data-booking-cta className="w-full sm:w-auto">
                <ButtonLink href={treatwellUrl} external size="lg" className="w-full sm:w-auto">
                  Κλείσε Ραντεβού
                </ButtonLink>
              </span>
              <ButtonLink
                href="/services"
                variant="outlineLight"
                size="lg"
                className="w-full sm:w-auto"
              >
                Δες τις Υπηρεσίες
              </ButtonLink>
            </div>
          </motion.div>
        </div>

        {/* Desktop photo — natural size, no heavy dark wash */}
        <div className="relative hidden min-h-[100svh] md:block">
          <StoreImage
            src={photo}
            alt="Angel Nails — χώρος στο κατάστημα"
            fill
            priority
              sizes="50vw"
            className="object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-l from-transparent via-transparent to-black/25" />
        </div>
      </div>
    </section>
  );
}
