"use client";

import Image from "next/image";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { useReducedMotion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { LookbookData, LookbookPage } from "@/lib/lookbook/types";
import "./lookbook.css";

type Props = {
  data: LookbookData;
  compact?: boolean;
  className?: string;
};

function PhotoPage({
  page,
  priority,
  gutter,
}: {
  page: LookbookPage;
  priority?: boolean;
  gutter?: "left" | "right" | "none";
}) {
  return (
    <div className="lb-face relative h-full w-full" aria-label={page.title}>
      <Image
        src={page.imageUrl}
        alt={page.altText || page.title}
        fill
        className="lb-photo pointer-events-none object-cover select-none"
        sizes="(max-width: 768px) 90vw, 46vw"
        loading={priority ? "eager" : "lazy"}
        priority={priority}
        draggable={false}
      />
      {gutter === "left" && <span className="lb-gutter left-gutter" />}
      {gutter === "right" && <span className="lb-gutter right-gutter" />}
    </div>
  );
}

export function FlipBook({ data, compact = false, className }: Props) {
  const { settings, pages } = data;
  const reduce = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [flipping, setFlipping] = useState<"next" | "prev" | null>(null);
  const [flipProgress, setFlipProgress] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const stageRef = useRef<HTMLDivElement>(null);
  const dragStartX = useRef<number | null>(null);
  const dragging = useRef(false);
  const animRef = useRef<number | null>(null);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 768px)");
    const apply = () => setIsMobile(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  const total = pages.length;
  const step = isMobile ? 1 : 2;
  const pageLabel =
    total === 0
      ? "00 / 00"
      : isMobile
        ? `${String(index + 1).padStart(2, "0")} / ${String(total).padStart(2, "0")}`
        : `${String(index + 1).padStart(2, "0")}–${String(Math.min(index + 2, total)).padStart(2, "0")} / ${String(total).padStart(2, "0")}`;

  const canPrev = index > 0 && !flipping;
  const canNext = index + step < total && !flipping;

  const leftPage = pages[index] || null;
  const rightPage = pages[index + 1] || null;
  const singlePage = pages[index] || null;
  const activeCaption = leftPage || singlePage;

  const completeNext = useCallback(() => {
    setIndex((i) => Math.min(i + step, Math.max(0, total - 1)));
    setFlipping(null);
    setFlipProgress(0);
  }, [step, total]);

  const completePrev = useCallback(() => {
    setIndex((i) => Math.max(i - step, 0));
    setFlipping(null);
    setFlipProgress(0);
  }, [step]);

  const animateTo = useCallback((from: number, to: number, onDone: () => void) => {
    if (animRef.current) cancelAnimationFrame(animRef.current);
    const t0 = performance.now();
    const dur = 480;
    const tick = (t: number) => {
      const p = Math.min(1, (t - t0) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      setFlipProgress(from + (to - from) * eased);
      if (p < 1) animRef.current = requestAnimationFrame(tick);
      else onDone();
    };
    animRef.current = requestAnimationFrame(tick);
  }, []);

  const goNext = useCallback(() => {
    if (flipping || index + step >= total) return;
    if (reduce) {
      completeNext();
      return;
    }
    setFlipping("next");
    setFlipProgress(0);
    animateTo(0, 1, completeNext);
  }, [flipping, index, step, total, reduce, completeNext, animateTo]);

  const goPrev = useCallback(() => {
    if (flipping || index <= 0) return;
    if (reduce) {
      completePrev();
      return;
    }
    setFlipping("prev");
    setFlipProgress(0);
    animateTo(0, 1, completePrev);
  }, [flipping, index, reduce, completePrev, animateTo]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") goNext();
      if (e.key === "ArrowLeft") goPrev();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [goNext, goPrev]);

  const onPointerDown = (e: ReactPointerEvent) => {
    if (flipping) return;
    if ((e.target as HTMLElement).closest("a,button")) return;
    dragStartX.current = e.clientX;
    dragging.current = true;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: ReactPointerEvent) => {
    if (!dragging.current || dragStartX.current == null || reduce) return;
    const dx = e.clientX - dragStartX.current;
    const width = stageRef.current?.clientWidth || 400;
    const p = Math.max(-1, Math.min(1, dx / (width * 0.38)));
    if (p < 0 && (canNext || flipping === "next")) {
      setFlipping("next");
      setFlipProgress(Math.abs(p));
    } else if (p > 0 && (canPrev || flipping === "prev")) {
      setFlipping("prev");
      setFlipProgress(Math.abs(p));
    }
  };

  const onPointerUp = () => {
    if (!dragging.current) return;
    dragging.current = false;
    dragStartX.current = null;
    if (!flipping) return;
    if (flipProgress > 0.25) {
      animateTo(flipProgress, 1, flipping === "next" ? completeNext : completePrev);
    } else {
      animateTo(flipProgress, 0, () => {
        setFlipping(null);
        setFlipProgress(0);
      });
    }
  };

  const flipAngle = flipProgress * 180;
  const shade = 0.18 + flipProgress * 0.5;
  const openAngle = isMobile ? 0 : 16;
  const leftRest = openAngle;
  const rightRest = -openAngle;
  const rightFlip = flipping === "next" ? rightRest - flipProgress * (180 - openAngle) : rightRest;
  const leftFlip = flipping === "prev" ? leftRest + flipProgress * (180 - openAngle) : leftRest;

  const preloadUrls = useMemo(() => {
    const set = new Set<string>();
    for (let i = Math.max(0, index - 2); i <= Math.min(total - 1, index + 4); i++) {
      if (pages[i]) set.add(pages[i].imageUrl);
    }
    return [...set];
  }, [index, pages, total]);

  const bookClass = [
    "lookbook-book",
    "is-open",
    "is-stable",
    compact ? "compact" : "",
    isMobile ? "mobile" : "",
  ]
    .filter(Boolean)
    .join(" ");

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
      <div className="lookbook-particles" aria-hidden />

      <div className="hidden" aria-hidden>
        {preloadUrls.map((url) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img key={url} src={url} alt="" />
        ))}
      </div>

      <div
        ref={stageRef}
        className="lookbook-scene relative z-10 mx-auto flex flex-col items-center py-6"
      >
        <div className="lookbook-table" aria-hidden />

        <div
          className={bookClass}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          style={{ touchAction: "pan-y" }}
        >
          <div className="lookbook-floor-shadow" />

          {isMobile ? (
            <div className="lb-open-stage">
              <div className="lb-stack right" />
              <div
                className="lb-leaf single"
                style={{
                  zIndex: 5,
                  transform:
                    flipping === "next"
                      ? `rotateY(${-flipAngle}deg)`
                      : flipping === "prev"
                        ? `rotateY(${flipAngle - 180}deg)`
                        : "rotateY(0deg)",
                  filter: flipping ? `brightness(${1 - flipProgress * 0.12})` : undefined,
                }}
              >
                <div className="lb-face">
                  {singlePage && <PhotoPage page={singlePage} priority gutter="right" />}
                  {flipping && (
                    <div
                      className="lb-flip-shade"
                      style={{
                        background: `linear-gradient(${flipping === "next" ? "90deg" : "270deg"}, rgba(0,0,0,${shade}), transparent 60%)`,
                      }}
                    />
                  )}
                </div>
                <div className="lb-face back paper-back" />
              </div>
              <div className="lb-leaf single" style={{ zIndex: 1 }}>
                <div className="lb-face">
                  {pages[flipping === "next" ? index + 1 : flipping === "prev" ? index - 1 : index] && (
                    <PhotoPage
                      page={
                        pages[
                          flipping === "next" ? index + 1 : flipping === "prev" ? index - 1 : index
                        ]
                      }
                      gutter="right"
                    />
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="lb-open-stage">
              <div className="lb-board left" />
              <div className="lb-board right" />
              <div className="lb-open-spine" />
              <div className="lb-stack left" />
              <div className="lb-stack right" />

              <div
                className="lb-leaf left"
                style={{
                  zIndex: flipping === "prev" ? 8 : 3,
                  transform: `rotateY(${leftFlip}deg)`,
                }}
              >
                <div className="lb-face">
                  {leftPage && <PhotoPage page={leftPage} priority gutter="left" />}
                  {flipping === "prev" && (
                    <div
                      className="lb-flip-shade"
                      style={{
                        background: `linear-gradient(270deg, rgba(0,0,0,${shade}), transparent 55%)`,
                      }}
                    />
                  )}
                </div>
                <div className="lb-face back paper-back" />
              </div>

              <div
                className="lb-leaf right"
                style={{
                  zIndex: flipping === "next" ? 9 : 4,
                  transform: `rotateY(${rightFlip}deg)`,
                  filter:
                    flipping === "next" ? `brightness(${1 - flipProgress * 0.18})` : undefined,
                }}
              >
                <div className="lb-face">
                  {rightPage ? (
                    <PhotoPage page={rightPage} priority gutter="right" />
                  ) : (
                    <div className="absolute inset-0 bg-[#ebe4da]" />
                  )}
                  {flipping === "next" && (
                    <div
                      className="lb-flip-shade"
                      style={{
                        background: `linear-gradient(90deg, rgba(0,0,0,${shade}), transparent 55%)`,
                      }}
                    />
                  )}
                </div>
                <div className="lb-face back">
                  {pages[index + 2] ? (
                    <PhotoPage page={pages[index + 2]} gutter="left" />
                  ) : (
                    <div className="absolute inset-0 bg-[#ebe4da]" />
                  )}
                </div>
              </div>

              {flipping === "next" && pages[index + 3] && (
                <div
                  className="lb-leaf right"
                  style={{ zIndex: 1, transform: `rotateY(${rightRest}deg)` }}
                >
                  <div className="lb-face">
                    <PhotoPage page={pages[index + 3]} gutter="right" />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {activeCaption && (
          <div className="relative z-[80] mt-8 max-w-lg px-4 text-center">
            <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#FF3F87]">
              {activeCaption.category}
            </p>
            <p
              className="mt-2 text-xl text-white md:text-2xl"
              style={{ fontFamily: "var(--font-cormorant), Georgia, serif" }}
            >
              {activeCaption.title}
            </p>
          </div>
        )}

        <div className="relative z-[80] mt-6 flex w-full max-w-md items-center justify-between gap-3 px-2">
          <button
            type="button"
            onClick={goPrev}
            disabled={!canPrev}
            className="inline-flex items-center gap-1 rounded-md border border-white/20 px-3 py-2 text-sm text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#ED2F78] disabled:opacity-30"
            aria-label="Previous page"
          >
            <ChevronLeft size={16} /> Previous
          </button>
          <p className="text-xs font-medium tracking-[0.18em] text-white/70" aria-live="polite">
            {pageLabel}
          </p>
          <button
            type="button"
            onClick={goNext}
            disabled={!canNext}
            className="inline-flex items-center gap-1 rounded-md border border-white/20 px-3 py-2 text-sm text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#ED2F78] disabled:opacity-30"
            aria-label="Next page"
          >
            Next <ChevronRight size={16} />
          </button>
        </div>

        <p className="relative z-[80] mt-3 text-[11px] tracking-[0.16em] text-white/40">
          Σύρε αριστερά / δεξιά
        </p>
      </div>
    </div>
  );
}
