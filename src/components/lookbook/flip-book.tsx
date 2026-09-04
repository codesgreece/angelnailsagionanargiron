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
  const busyRef = useRef(false);
  const pageIndexRef = useRef(0);
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

  const pageLabel = useMemo(() => {
    if (total === 0) return "00 / 00";
    if (isMobile) {
      return `${String(pageIndex + 1).padStart(2, "0")} / ${String(total).padStart(2, "0")}`;
    }
    const end = Math.min(pageIndex + 2, total);
    return `${String(pageIndex + 1).padStart(2, "0")}–${String(end).padStart(2, "0")} / ${String(total).padStart(2, "0")}`;
  }, [isMobile, pageIndex, total]);

  const active = pages[pageIndex] || pages[0];

  const dims = useMemo(() => {
    if (compact) {
      return isMobile ? { w: 220, h: 310 } : { w: 250, h: 350 };
    }
    return isMobile ? { w: 240, h: 340 } : { w: 300, h: 420 };
  }, [compact, isMobile]);

  useEffect(() => {
    pageIndexRef.current = pageIndex;
  }, [pageIndex]);

  useEffect(() => {
    const host = hostRef.current;
    if (!host || total === 0) return;

    // PageFlip MUST sit in a flat, non-transformed parent or pages vanish mid-flip.
    const root = document.createElement("div");
    root.className = "lookbook-stf-root";
    host.replaceChildren(root);

    for (const page of pages) {
      const leaf = document.createElement("div");
      leaf.className = "lookbook-stf-page";
      leaf.dataset.density = "soft";
      const img = document.createElement("img");
      img.src = page.imageUrl;
      img.alt = page.altText || page.title;
      img.draggable = false;
      img.decoding = "async";
      leaf.appendChild(img);
      root.appendChild(leaf);
    }

    const flip = new PageFlip(root, {
      width: dims.w,
      height: dims.h,
      size: "fixed",
      minWidth: dims.w,
      maxWidth: dims.w,
      minHeight: dims.h,
      maxHeight: dims.h,
      drawShadow: true,
      flippingTime: 1000,
      usePortrait: true,
      startZIndex: 1,
      autoSize: false,
      maxShadowOpacity: 0.7,
      showCover: false,
      mobileScrollSupport: false,
      swipeDistance: 40,
      clickEventForward: false,
      // Library swipe-prev is buggy in portrait; we handle gestures ourselves.
      useMouseEvents: false,
      showPageCorners: false,
      disableFlipByClick: true,
      startPage: 0,
    });

    flip.loadFromHTML(root.querySelectorAll(".lookbook-stf-page"));

    flip.on("flip", (e) => {
      busyRef.current = false;
      if (typeof e.data === "number") {
        pageIndexRef.current = e.data;
        setPageIndex(e.data);
      }
    });
    flip.on("changeState", (e) => {
      const state = String(e.data);
      busyRef.current = state === "flipping" || state === "user_fold";
    });
    flip.on("init", (e) => {
      const d = e.data;
      const idx = typeof d === "object" && d ? d.page : 0;
      pageIndexRef.current = idx;
      setPageIndex(idx);
      setReady(true);
      busyRef.current = false;
    });

    flipRef.current = flip;

    return () => {
      flipRef.current = null;
      setReady(false);
      busyRef.current = false;
      try {
        flip.destroy();
      } catch {
        // ignore
      }
      host.replaceChildren();
    };
  }, [dims.h, dims.w, pages, total]);

  const goNext = useCallback(() => {
    const flip = flipRef.current;
    if (!flip || !ready || busyRef.current) return;
    if (pageIndexRef.current >= total - 1) return;
    busyRef.current = true;
    flip.flipNext("top");
    window.setTimeout(() => {
      busyRef.current = false;
    }, 1100);
  }, [ready, total]);

  const goPrev = useCallback(() => {
    const flip = flipRef.current;
    if (!flip || !ready || busyRef.current) return;
    if (pageIndexRef.current <= 0) return;
    busyRef.current = true;
    flip.flip(pageIndexRef.current - 1, "top");
    window.setTimeout(() => {
      busyRef.current = false;
    }, 1100);
  }, [ready]);

  // Reliable swipe — avoids broken library flipPrev in portrait mode
  useEffect(() => {
    const host = hostRef.current;
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
      if (dt > 600) return;
      if (Math.abs(dx) < 36 || Math.abs(dx) < Math.abs(dy) * 1.2) return;
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
  }, [goNext, goPrev, ready]);

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

      <div className="relative z-10 mx-auto flex flex-col items-center px-4 py-6">
        <div
          className={`lookbook-book-shell ${compact ? "is-compact" : ""} ${isMobile ? "is-mobile" : "is-desktop"}`}
          style={{
            ["--book-w" as string]: `${dims.w}px`,
            ["--book-h" as string]: `${dims.h}px`,
          }}
        >
          <div className="lookbook-floor-shadow" />

          {/* Decorative hardcover frame — NO transforms on the flip host */}
          <div className="lookbook-frame">
            <span className="lookbook-frame-spine" aria-hidden />
            <span className="lookbook-frame-stack" aria-hidden />
            <span className="lookbook-frame-board" aria-hidden />
            <div ref={hostRef} className="lookbook-stf-host" />
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
