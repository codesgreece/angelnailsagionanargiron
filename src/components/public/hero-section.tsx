"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ButtonLink } from "@/components/ui/button-link";
import { StoreImage } from "@/components/ui/store-image";
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
    <section className="relative min-h-[100svh] overflow-hidden bg-[#09090B] text-white">
      <div className="absolute inset-0">
        <StoreImage
          src={photo}
          alt="Angel Nails — χώρος στο κατάστημα"
          fill
          priority
          sizes="100vw"
          className="object-cover object-[center_35%] md:object-center"
        />
        <div className="absolute inset-0 bg-black/55" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/55 to-black/35" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(237,47,120,0.22),transparent_45%)]" />
      </div>

      <div className="relative mx-auto flex min-h-[100svh] max-w-7xl flex-col justify-end px-4 pb-28 pt-28 md:justify-center md:px-6 md:pb-24">
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <motion.p
            className="mb-3 text-[11px] font-medium uppercase tracking-[0.32em] text-white"
            initial={reduce ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12, duration: 0.5 }}
          >
            Άγιοι Ανάργυροι
          </motion.p>
          <motion.h1
            className="max-w-3xl text-[3.4rem] leading-[0.92] text-[#FF3F87] drop-shadow-[0_8px_30px_rgba(0,0,0,0.45)] sm:text-6xl md:text-8xl lg:text-9xl"
            style={{ fontFamily: "var(--font-great-vibes), 'Great Vibes', cursive" }}
            initial={reduce ? false : { opacity: 0, y: 18, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 0.18, duration: 0.65 }}
          >
            {displayTitle}
          </motion.h1>
          <motion.p
            className="mt-5 max-w-xl text-lg font-medium leading-relaxed text-white drop-shadow md:text-2xl"
            initial={reduce ? false : { opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.28, duration: 0.55 }}
          >
            {subtitle}
          </motion.p>
          {body && (
            <motion.p
              className="mt-4 text-[11px] font-medium uppercase tracking-[0.18em] text-white/90"
              initial={reduce ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.38, duration: 0.5 }}
            >
              {body}
            </motion.p>
          )}
          <motion.div
            className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap"
            initial={reduce ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45, duration: 0.55 }}
          >
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
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
