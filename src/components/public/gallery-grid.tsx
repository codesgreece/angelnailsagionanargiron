"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { X } from "lucide-react";
import type { GalleryImage } from "@prisma/client";
import { FadeIn } from "@/components/ui/fade-in";

const FILTERS = ["Όλα", "Νύχια", "Manicure", "Pedicure", "Nail Art", "Χώρος"] as const;

export function GalleryGrid({ images }: { images: GalleryImage[] }) {
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("Όλα");
  const [active, setActive] = useState<GalleryImage | null>(null);

  const filtered = useMemo(() => {
    if (filter === "Όλα") return images;
    return images.filter((img) => img.category === filter);
  }, [images, filter]);

  if (images.length === 0) return null;

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className={`rounded-md px-3 py-2 text-sm transition ${
              filter === f
                ? "bg-[var(--brand-black)] text-white"
                : "border border-[var(--brand-warm-grey)] text-black/70 hover:border-[var(--brand-pink)]"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="mt-12 text-center text-black/55">Δεν υπάρχουν εικόνες σε αυτή την κατηγορία.</p>
      ) : (
        <div className="mt-8 columns-1 gap-4 sm:columns-2 lg:columns-3">
          {filtered.map((img, i) => (
            <FadeIn key={img.id} delay={Math.min(i * 0.03, 0.18)} className="mb-4 break-inside-avoid">
              <button
                type="button"
                onClick={() => setActive(img)}
                className="group relative block w-full overflow-hidden bg-[var(--brand-soft-white)]"
              >
                <Image
                  src={img.imageUrl}
                  alt={img.altText || img.title || "Angel Nails gallery"}
                  width={800}
                  height={1000}
                  loading="lazy"
                  className="h-auto w-full object-cover transition duration-500 group-hover:scale-[1.03]"
                />
                <div className="pointer-events-none absolute inset-0 bg-black/0 transition group-hover:bg-black/20" />
              </button>
            </FadeIn>
          ))}
        </div>
      )}

      {active && (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center bg-black/85 p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Προβολή εικόνας"
          onClick={() => setActive(null)}
        >
          <button
            type="button"
            className="absolute right-4 top-4 rounded-full bg-white/10 p-2 text-white"
            aria-label="Κλείσιμο"
            onClick={() => setActive(null)}
          >
            <X />
          </button>
          <div className="relative max-h-[90vh] max-w-5xl" onClick={(e) => e.stopPropagation()}>
            <Image
              src={active.imageUrl}
              alt={active.altText || active.title || "Angel Nails gallery"}
              width={1400}
              height={1000}
              className="max-h-[85vh] w-auto object-contain"
            />
            {(active.title || active.description) && (
              <div className="mt-3 text-center text-white">
                {active.title && <p className="font-medium">{active.title}</p>}
                {active.description && <p className="text-sm text-white/70">{active.description}</p>}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
