"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { LookbookData, LookbookPage } from "@/lib/lookbook/types";
import "./lookbook.css";

type Props = {
  data: LookbookData;
  compact?: boolean;
  className?: string;
};

type Anim = {
  dir: "next" | "prev";
  from: number;
  to: number;
};

/**
 * Custom CSS 3D lookbook — no StPageFlip.
 * Prev/next are driven by React state so pages never vanish mid-flip.
 */
export function FlipBook({ data, compact = false, className }: Props) {
  const { settings, pages } = data;
  const stageRef = useRef<HTMLDivElement>(null);
  const [pageIndex, setPageIndex] = useState(0);
  const [anim, setAnim] = useState<Anim | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const animLock = useRef(false);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 768px)");
    const apply = () => setIsMobile(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  const total = pages.length;

  const dims = useMemo(() => {
    if (compact) {
      return isMobile ? { w: 220, h: 310 } : { w: 260, h: 364 };
    }
    return isMobile ? { w: 250, h: 350 } : { w: 320, h: 448 };
  }, [compact, isMobile]);

  const pageLabel = useMemo(() => {
    if (total === 0) return "00 / 00";
    return `${String(pageIndex + 1).padStart(2, "0")} / ${String(total).padStart(2, "0")}`;
  }, [pageIndex, total]);

  const active = pages[pageIndex] || pages[0];
  const busy = anim !== null;

  const finishAnim = useCallback((next: Anim) => {
    if (!animLock.current) return;
    animLock.current = false;
    setPageIndex(next.to);
    setAnim(null);
  }, []);

  const goNext = useCallback(() => {
    if (animLock.current || busy) return;
    if (pageIndex >= total - 1) return;
    animLock.current = true;
    setAnim({ dir: "next", from: pageIndex, to: pageIndex + 1 });
  }, [busy, pageIndex, total]);

  const goPrev = useCallback(() => {
    if (animLock.current || busy) return;
    if (pageIndex <= 0) return;
    animLock.current = true;
    setAnim({ dir: "prev", from: pageIndex, to: pageIndex - 1 });
  }, [busy, pageIndex]);

  // Swipe on the book surface
  useEffect(() => {
    const host = stageRef.current;
    if (!host) return;
    let startX: number | null = null;
    let startY: number | null = null;
    let startT = 0;

    const onDown = (e: PointerEvent) => {
      startX = e.clientX;
      startY = e.clientY;
      startT = Date.now();
    };
    const onUp = (e: PointerEvent) => {
      if (startX == null || startY == null) return;
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      const dt = Date.now() - startT;
      startX = null;
      startY = null;
      if (dt > 700) return;
      if (Math.abs(dx) < 34 || Math.abs(dx) < Math.abs(dy) * 1.15) return;
      if (dx < 0) goNext();
      else goPrev();
    };

    host.addEventListener("pointerdown", onDown);
    host.addEventListener("pointerup", onUp);
    host.addEventListener("pointercancel", () => {
      startX = null;
      startY = null;
    });
    return () => {
      host.removeEventListener("pointerdown", onDown);
      host.removeEventListener("pointerup", onUp);
    };
  }, [goNext, goPrev]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") goNext();
      if (e.key === "ArrowLeft") goPrev();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [goNext, goPrev]);

  // Prefetch neighbors so flips never flash empty
  useEffect(() => {
    const urls = [pages[pageIndex - 1]?.imageUrl, pages[pageIndex + 1]?.imageUrl].filter(
      Boolean,
    ) as string[];
    urls.forEach((src) => {
      const img = new Image();
      img.src = src;
    });
  }, [pageIndex, pages]);

  // Safety: never leave animation hanging
  useEffect(() => {
    if (!anim) return;
    const t = window.setTimeout(() => finishAnim(anim), 950);
    return () => window.clearTimeout(t);
  }, [anim, finishAnim]);

  const canPrev = pageIndex > 0 && !busy;
  const canNext = pageIndex < total - 1 && !busy;

  if (total === 0) {
    return (
      <div className="rounded-xl border border-white/10 bg-black/40 p-10 text-center text-white/70">
        Δεν υπάρχουν ακόμα looks στο Lookbook.
      </div>
    );
  }

  const underPage: LookbookPage | null = anim
    ? anim.dir === "next"
      ? pages[anim.to]
      : pages[anim.from]
    : null;

  const flipPage: LookbookPage | null = anim
    ? anim.dir === "next"
      ? pages[anim.from]
      : pages[anim.to]
    : null;

  const idlePage = !anim ? pages[pageIndex] : null;

  return (
    <div
      className={`lookbook-stage ${className || ""}`}
      style={{ ["--lb-accent" as string]: settings.accentColor }}
      role="region"
      aria-label="Angel Nails Lookbook"
    >
      <div className="lookbook-ambient" />

      <div className="relative z-10 mx-auto flex flex-col items-center px-4 py-6">
        <div
          className={`lookbook-book-shell ${compact ? "is-compact" : ""} ${isMobile ? "is-mobile" : "is-desktop"}`}
          style={{
            ["--book-w" as string]: `${dims.w}px`,
            ["--book-h" as string]: `${dims.h}px`,
          }}
        >
          <div className="lookbook-floor-shadow" />

          <div ref={stageRef} className="lookbook-frame">
            <span className="lookbook-frame-spine" aria-hidden />
            <span className="lookbook-frame-stack" aria-hidden />
            <span className="lookbook-frame-board" aria-hidden />

            <div className="lookbook-viewport" style={{ width: dims.w, height: dims.h }}>
              {/* Page stack edge (physical feel) */}
              <div className="lookbook-page-stack" aria-hidden />

              {/* Under page during animation */}
              {underPage && (
                <div className="lookbook-leaf is-under">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={underPage.imageUrl} alt={underPage.altText || underPage.title} draggable={false} />
                </div>
              )}

              {/* Idle current page */}
              {idlePage && (
                <div className="lookbook-leaf is-current">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={idlePage.imageUrl} alt={idlePage.altText || idlePage.title} draggable={false} />
                </div>
              )}

              {/* Animated flipping leaf */}
              {flipPage && anim && (
                <div
                  className={`lookbook-leaf is-flip is-flip-${anim.dir}`}
                  onAnimationEnd={() => finishAnim(anim)}
                >
                  <div className="lookbook-leaf-face lookbook-leaf-front">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={flipPage.imageUrl} alt="" draggable={false} />
                    <span className="lookbook-curl-shade" aria-hidden />
                  </div>
                  <div className="lookbook-leaf-face lookbook-leaf-back" aria-hidden>
                    <div className="lookbook-paper-back" />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {active && (
          <div className="mt-7 max-w-sm px-2 text-center">
            <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#FF3F87]">
              {active.category}
            </p>
            <p
              className="mt-1.5 text-lg text-white md:text-xl"
              style={{ fontFamily: "var(--font-cormorant), Georgia, serif" }}
            >
              {active.title}
            </p>
          </div>
        )}

        <div className="mt-5 flex w-full max-w-xs items-center justify-between gap-3">
          <button
            type="button"
            onClick={goPrev}
            disabled={!canPrev}
            className="inline-flex items-center gap-1 rounded-md border border-white/20 px-3 py-2 text-sm text-white disabled:opacity-30"
            aria-label="Previous page"
          >
            <ChevronLeft size={16} />
          </button>
          <p className="text-xs font-medium tracking-[0.18em] text-white/70" aria-live="polite">
            {pageLabel}
          </p>
          <button
            type="button"
            onClick={goNext}
            disabled={!canNext}
            className="inline-flex items-center gap-1 rounded-md border border-white/20 px-3 py-2 text-sm text-white disabled:opacity-30"
            aria-label="Next page"
          >
            <ChevronRight size={16} />
          </button>
        </div>

        <p className="mt-2 text-[11px] tracking-[0.14em] text-white/40">Σύρε για να γυρίσεις σελίδα</p>
      </div>
    </div>
  );
}
