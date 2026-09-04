"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { PageFlip } from "page-flip";
import type { LookbookData } from "@/lib/lookbook/types";
import "./lookbook.css";

type Props = {
  data: LookbookData;
  compact?: boolean;
  className?: string;
};

export function FlipBook({ data, compact = false, className }: Props) {
  const { settings, pages } = data;
  const hostRef = useRef<HTMLDivElement>(null);
  const flipRef = useRef<PageFlip | null>(null);
  const [pageIndex, setPageIndex] = useState(0);
  const [ready, setReady] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 768px)");
    const apply = () => setIsMobile(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  const total = pages.length;
  const imageUrls = useMemo(() => pages.map((p) => p.imageUrl), [pages]);

  const pageLabel = useMemo(() => {
    if (total === 0) return "00 / 00";
    if (isMobile) {
      return `${String(pageIndex + 1).padStart(2, "0")} / ${String(total).padStart(2, "0")}`;
    }
    const end = Math.min(pageIndex + (isMobile ? 1 : 2), total);
    // In landscape StPageFlip shows spreads; portrait shows one page.
    return isMobile
      ? `${String(pageIndex + 1).padStart(2, "0")} / ${String(total).padStart(2, "0")}`
      : `${String(pageIndex + 1).padStart(2, "0")}–${String(end).padStart(2, "0")} / ${String(total).padStart(2, "0")}`;
  }, [isMobile, pageIndex, total]);

  const active = pages[pageIndex] || pages[0];

  const dims = useMemo(() => {
    if (compact) {
      return isMobile ? { w: 230, h: 320 } : { w: 260, h: 360 };
    }
    return isMobile ? { w: 250, h: 350 } : { w: 320, h: 440 };
  }, [compact, isMobile]);

  useEffect(() => {
    if (!hostRef.current || imageUrls.length === 0) return;

    const el = hostRef.current;
    el.innerHTML = "";

    const flip = new PageFlip(el, {
      width: dims.w,
      height: dims.h,
      size: "fixed",
      minWidth: dims.w,
      maxWidth: dims.w,
      minHeight: dims.h,
      maxHeight: dims.h,
      drawShadow: true,
      flippingTime: 850,
      usePortrait: true,
      startZIndex: 2,
      autoSize: false,
      maxShadowOpacity: 0.6,
      showCover: false,
      mobileScrollSupport: true,
      swipeDistance: 24,
      clickEventForward: false,
      useMouseEvents: true,
      showPageCorners: true,
      disableFlipByClick: true,
      startPage: 0,
    });

    flip.loadFromImages(imageUrls);
    flip.on("flip", (e) => {
      if (typeof e.data === "number") setPageIndex(e.data);
    });
    flip.on("init", (e) => {
      const d = e.data;
      setPageIndex(typeof d === "object" && d ? d.page : 0);
      setReady(true);
    });
    flipRef.current = flip;

    return () => {
      flipRef.current = null;
      setReady(false);
      try {
        // Avoid PageFlip.destroy() — it removes the React-managed node.
        el.querySelector(".stf__wrapper")?.remove();
        el.classList.remove("stf__parent");
        el.replaceChildren();
      } catch {
        // ignore
      }
    };
  }, [dims.h, dims.w, imageUrls]);

  const goNext = useCallback(() => {
    flipRef.current?.flipNext("top");
  }, []);

  const goPrev = useCallback(() => {
    flipRef.current?.flipPrev("top");
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") goNext();
      if (e.key === "ArrowLeft") goPrev();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [goNext, goPrev]);

  const canPrev = pageIndex > 0;
  const canNext = pageIndex < total - 1;

  if (total === 0) {
    return (
      <div className="rounded-xl border border-white/10 bg-black/40 p-10 text-center text-white/70">
        Δεν υπάρχουν ακόμα looks στο Lookbook.
      </div>
    );
  }

  return (
    <div
      className={`lookbook-stage ${className || ""}`}
      style={{ ["--lb-accent" as string]: settings.accentColor }}
      role="region"
      aria-label="Angel Nails Lookbook"
    >
      <div className="lookbook-ambient" />

      <div className="relative z-10 mx-auto flex flex-col items-center px-4 py-4">
        <div
          className={`lookbook-book-shell ${compact ? "is-compact" : ""} ${isMobile ? "is-mobile" : ""}`}
        >
          <div className="lookbook-floor-shadow" />
          <div
            ref={hostRef}
            className="lookbook-stf"
            style={{
              width: dims.w,
              height: dims.h,
            }}
          />
        </div>

        {active && (
          <div className="mt-6 max-w-sm px-2 text-center">
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
            disabled={!ready || !canPrev}
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
            disabled={!ready || !canNext}
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
