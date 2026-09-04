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
import { AnimatePresence, motion, useMotionValue, useReducedMotion, useSpring } from "framer-motion";
import { ChevronLeft, ChevronRight, Maximize2, Minimize2, X } from "lucide-react";
import type { LookbookData, LookbookPage } from "@/lib/lookbook/types";
import "./lookbook.css";

type Props = {
  data: LookbookData;
  autoOpen?: boolean;
  compact?: boolean;
  className?: string;
};

function PhotoPage({
  page,
  priority,
  onZoom,
  gutter,
}: {
  page: LookbookPage;
  priority?: boolean;
  onZoom?: () => void;
  gutter?: "left" | "right" | "none";
}) {
  return (
    <button
      type="button"
      className="lb-face relative block h-full w-full cursor-zoom-in border-0 p-0"
      onClick={(e) => {
        e.stopPropagation();
        onZoom?.();
      }}
      aria-label={page.title}
    >
      <Image
        src={page.imageUrl}
        alt={page.altText || page.title}
        fill
        className="lb-photo object-cover"
        sizes="(max-width: 768px) 90vw, 46vw"
        loading={priority ? "eager" : "lazy"}
        priority={priority}
        draggable={false}
      />
      {gutter === "left" && <span className="lb-gutter left-gutter" />}
      {gutter === "right" && <span className="lb-gutter right-gutter" />}
    </button>
  );
}

function CoverFront({
  title,
  subtitle,
  coverImageUrl,
  accent,
}: {
  title: string;
  subtitle: string;
  coverImageUrl?: string | null;
  accent: string;
}) {
  return (
    <div className="lb-cover-front">
      {coverImageUrl && (
        <Image
          src={coverImageUrl}
          alt=""
          fill
          className="lb-cover-art"
          sizes="280px"
          priority
        />
      )}
      <div className="lb-cover-content">
        <div>
          <p className="text-[9px] font-semibold uppercase tracking-[0.32em] text-white/55">
            Angel Nails
          </p>
          <div className="mx-auto mt-3 h-px w-10" style={{ background: accent }} />
        </div>
        <div>
          <p
            className="text-[2.35rem] leading-none text-[#FF3F87] md:text-[2.6rem]"
            style={{ fontFamily: "var(--font-great-vibes), 'Great Vibes', cursive" }}
          >
            Angel Nails
          </p>
          <h2
            className="mt-5 text-[1.05rem] font-semibold uppercase tracking-[0.18em] text-white md:text-lg"
            style={{ fontFamily: "var(--font-cormorant), Georgia, serif" }}
          >
            {title}
          </h2>
          <p className="mt-3 text-[9px] font-medium uppercase tracking-[0.28em] text-white/60">
            {subtitle}
          </p>
        </div>
        <p className="text-[9px] uppercase tracking-[0.24em] text-white/40">Nail Lookbook</p>
      </div>
    </div>
  );
}

export function FlipBook({ data, autoOpen = false, compact = false, className }: Props) {
  const { settings, pages, treatwellUrl } = data;
  const reduce = useReducedMotion();
  const [opened, setOpened] = useState(false);
  const [opening, setOpening] = useState(false);
  const [index, setIndex] = useState(0);
  const [flipping, setFlipping] = useState<"next" | "prev" | null>(null);
  const [flipProgress, setFlipProgress] = useState(0);
  const [fullscreen, setFullscreen] = useState(false);
  const [zoomIdx, setZoomIdx] = useState<number | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const stageRef = useRef<HTMLDivElement>(null);
  const dragStartX = useRef<number | null>(null);
  const dragging = useRef(false);
  const animRef = useRef<number | null>(null);

  const tiltX = useMotionValue(0);
  const tiltY = useMotionValue(0);
  const springX = useSpring(tiltX, { stiffness: 120, damping: 22 });
  const springY = useSpring(tiltY, { stiffness: 120, damping: 22 });

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 768px)");
    const apply = () => setIsMobile(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  const openBook = useCallback(() => {
    if (opened || opening) return;
    if (reduce) {
      setOpened(true);
      return;
    }
    setOpening(true);
    window.setTimeout(() => {
      setOpened(true);
      setOpening(false);
    }, 1050);
  }, [opened, opening, reduce]);

  useEffect(() => {
    if (autoOpen) openBook();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoOpen]);

  const total = pages.length;
  const step = isMobile ? 1 : 2;
  const pageLabel =
    total === 0
      ? "00 / 00"
      : isMobile
        ? `${String(index + 1).padStart(2, "0")} / ${String(total).padStart(2, "0")}`
        : `${String(index + 1).padStart(2, "0")}–${String(Math.min(index + 2, total)).padStart(2, "0")} / ${String(total).padStart(2, "0")}`;

  const canPrev = opened && !opening && index > 0 && !flipping;
  const canNext = opened && !opening && index + step < total && !flipping;

  const leftPage = pages[index] || null;
  const rightPage = pages[index + 1] || null;
  const nextUnder = pages[index + 2] || null;
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
    const dur = 520;
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
    if (!opened || opening || flipping || index + step >= total) return;
    if (reduce) {
      completeNext();
      return;
    }
    setFlipping("next");
    setFlipProgress(0);
    animateTo(0, 1, completeNext);
  }, [opened, opening, flipping, index, step, total, reduce, completeNext, animateTo]);

  const goPrev = useCallback(() => {
    if (!opened || opening || flipping || index <= 0) return;
    if (reduce) {
      completePrev();
      return;
    }
    setFlipping("prev");
    setFlipProgress(0);
    animateTo(0, 1, completePrev);
  }, [opened, opening, flipping, index, reduce, completePrev, animateTo]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") {
        if (zoomIdx != null) setZoomIdx((z) => (z == null ? z : Math.min(total - 1, z + 1)));
        else goNext();
      }
      if (e.key === "ArrowLeft") {
        if (zoomIdx != null) setZoomIdx((z) => (z == null ? z : Math.max(0, z - 1)));
        else goPrev();
      }
      if (e.key === "Escape") {
        if (zoomIdx != null) setZoomIdx(null);
        else if (fullscreen) setFullscreen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [goNext, goPrev, zoomIdx, fullscreen, total]);

  const onPointerDown = (e: ReactPointerEvent) => {
    if (!opened || opening || flipping) return;
    if ((e.target as HTMLElement).closest("a,button")) return;
    dragStartX.current = e.clientX;
    dragging.current = true;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: ReactPointerEvent) => {
    if (!dragging.current || dragStartX.current == null || opening || reduce) return;
    const dx = e.clientX - dragStartX.current;
    const width = stageRef.current?.clientWidth || 400;
    const p = Math.max(-1, Math.min(1, dx / (width * 0.4)));
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
    if (flipProgress > 0.28) {
      animateTo(flipProgress, 1, flipping === "next" ? completeNext : completePrev);
    } else {
      animateTo(flipProgress, 0, () => {
        setFlipping(null);
        setFlipProgress(0);
      });
    }
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (isMobile || reduce || !opened || compact || opening) return;
    const rect = stageRef.current?.getBoundingClientRect();
    if (!rect) return;
    const nx = (e.clientX - rect.left) / rect.width - 0.5;
    const ny = (e.clientY - rect.top) / rect.height - 0.5;
    tiltY.set(nx * 4);
    tiltX.set(-ny * 3);
  };

  const onMouseLeave = () => {
    tiltX.set(0);
    tiltY.set(0);
  };

  const flipAngle = flipProgress * 180;
  const shade = 0.15 + flipProgress * 0.45;

  const preloadUrls = useMemo(() => {
    const set = new Set<string>();
    for (let i = Math.max(0, index - 2); i <= Math.min(total - 1, index + 4); i++) {
      if (pages[i]) set.add(pages[i].imageUrl);
    }
    if (settings.coverImageUrl) set.add(settings.coverImageUrl);
    return [...set];
  }, [index, pages, total, settings.coverImageUrl]);

  const zoomPage = zoomIdx != null ? pages[zoomIdx] : null;

  const bookClass = [
    "lookbook-book",
    opened ? "is-open" : "is-closed",
    opening ? "is-opening" : "",
    compact ? "compact" : "",
    isMobile && opened ? "mobile" : "",
    fullscreen ? "fullscreen-book" : "",
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
      className={`lookbook-stage ${fullscreen ? "fixed inset-0 z-[90] flex flex-col justify-center bg-[#050507] px-4 py-8" : ""} ${className || ""}`}
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
        className="lookbook-scene relative z-10 mx-auto flex flex-col items-center py-8"
        onMouseMove={onMouseMove}
        onMouseLeave={onMouseLeave}
      >
        <motion.div
          className={bookClass}
          style={
            opened && !opening && !isMobile
              ? { rotateX: springX, rotateY: springY }
              : undefined
          }
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
        >
          <div className="lookbook-floor-shadow" />

          {!opened ? (
            <button
              type="button"
              className="lb-cover-wrap absolute inset-0 border-0 bg-transparent p-0"
              onClick={openBook}
              aria-label="Explore the Lookbook"
              style={{
                transformStyle: "preserve-3d",
                transform: opening && !reduce ? "rotateY(-145deg)" : undefined,
                transformOrigin: "left center",
                transition: reduce ? "none" : "transform 1.05s cubic-bezier(0.22, 1, 0.36, 1)",
              }}
            >
              <div className="lb-spine-3d" />
              <div className="lb-page-block" />
              <div className="lb-top-edge" />
              <CoverFront
                title={settings.title}
                subtitle={settings.subtitle}
                coverImageUrl={settings.coverImageUrl}
                accent={settings.accentColor}
              />
              <div className="lb-cover-back" />
            </button>
          ) : isMobile ? (
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
                  filter: flipping ? `brightness(${1 - flipProgress * 0.15})` : undefined,
                }}
              >
                <div className="lb-face">
                  {singlePage && (
                    <PhotoPage
                      page={singlePage}
                      priority
                      onZoom={() => setZoomIdx(index)}
                      gutter="right"
                    />
                  )}
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
              <div className="lb-open-spine" />
              <div className="lb-stack left" />
              <div className="lb-stack right" />

              {/* Left page */}
              <div
                className="lb-leaf left"
                style={{
                  zIndex: flipping === "prev" ? 8 : 3,
                  transform: flipping === "prev" ? `rotateY(${flipAngle}deg)` : "rotateY(0deg)",
                }}
              >
                <div className="lb-face">
                  {leftPage && (
                    <PhotoPage
                      page={leftPage}
                      priority
                      onZoom={() => setZoomIdx(index)}
                      gutter="left"
                    />
                  )}
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

              {/* Right flipping leaf */}
              <div
                className="lb-leaf right"
                style={{
                  zIndex: flipping === "next" ? 9 : 4,
                  transform: flipping === "next" ? `rotateY(${-flipAngle}deg)` : "rotateY(0deg)",
                  filter:
                    flipping === "next"
                      ? `brightness(${1 - flipProgress * 0.18})`
                      : undefined,
                }}
              >
                <div className="lb-face">
                  {rightPage ? (
                    <PhotoPage
                      page={rightPage}
                      priority
                      onZoom={() => setZoomIdx(index + 1)}
                      gutter="right"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center bg-[#ebe4da] text-sm text-black/35">
                      —
                    </div>
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

              {/* Sheet under right leaf */}
              {flipping === "next" && pages[index + 3] && (
                <div className="lb-leaf right" style={{ zIndex: 1 }}>
                  <div className="lb-face">
                    <PhotoPage page={pages[index + 3]} gutter="right" />
                  </div>
                </div>
              )}
              {flipping === "next" && !pages[index + 3] && pages[index + 2] && (
                <div className="lb-leaf right" style={{ zIndex: 1 }}>
                  <div className="lb-face">
                    <div className="absolute inset-0 bg-[#ebe4da]" />
                  </div>
                </div>
              )}
            </div>
          )}
        </motion.div>

        {/* Caption outside the book — never on the page */}
        {opened && !opening && activeCaption && (
          <div className="relative z-[80] mt-10 max-w-lg px-4 text-center">
            <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#FF3F87]">
              {activeCaption.category}
            </p>
            <p
              className="mt-2 text-2xl text-white"
              style={{ fontFamily: "var(--font-cormorant), Georgia, serif" }}
            >
              {activeCaption.title}
            </p>
            {activeCaption.description && (
              <p className="mt-2 text-sm text-white/55">{activeCaption.description}</p>
            )}
            <a
              href={treatwellUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex min-h-10 items-center rounded-md bg-[#ED2F78] px-4 text-xs font-semibold"
              style={{ color: "#FFFFFF" }}
            >
              Κλείσε Ραντεβού
            </a>
          </div>
        )}

        {!opened && !opening && (
          <button
            type="button"
            onClick={openBook}
            className="relative z-[80] mt-12 inline-flex min-h-12 items-center justify-center rounded-md bg-[#ED2F78] px-6 text-sm font-semibold tracking-wide"
            style={{ color: "#FFFFFF" }}
          >
            EXPLORE THE LOOKBOOK
          </button>
        )}

        {opened && !opening && (
          <div className="relative z-[80] mt-8 flex w-full max-w-md items-center justify-between gap-3 px-2">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                goPrev();
              }}
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
              onClick={(e) => {
                e.stopPropagation();
                goNext();
              }}
              disabled={!canNext}
              className="inline-flex items-center gap-1 rounded-md border border-white/20 px-3 py-2 text-sm text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#ED2F78] disabled:opacity-30"
              aria-label="Next page"
            >
              Next <ChevronRight size={16} />
            </button>
          </div>
        )}

        {opened && !opening && !compact && (
          <div className="relative z-[80] mt-4 flex gap-2">
            <button
              type="button"
              onClick={() => setFullscreen((v) => !v)}
              className="inline-flex items-center gap-2 rounded-md border border-white/15 px-3 py-2 text-xs text-white/80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#ED2F78]"
            >
              {fullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
              {fullscreen ? "Exit fullscreen" : "Open fullscreen"}
            </button>
          </div>
        )}
      </div>

      <AnimatePresence>
        {zoomPage && zoomIdx != null && (
          <motion.div
            className="fixed inset-0 z-[110] flex items-center justify-center bg-black/94 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setZoomIdx(null)}
            role="dialog"
            aria-modal="true"
            aria-label={zoomPage.title}
          >
            <button
              type="button"
              className="absolute right-4 top-4 rounded-full bg-white/10 p-2 text-white"
              aria-label="Close"
              onClick={() => setZoomIdx(null)}
            >
              <X />
            </button>
            <button
              type="button"
              className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-2 text-white disabled:opacity-30 md:left-6"
              aria-label="Previous photo"
              disabled={zoomIdx <= 0}
              onClick={(e) => {
                e.stopPropagation();
                setZoomIdx((z) => (z == null ? z : Math.max(0, z - 1)));
              }}
            >
              <ChevronLeft />
            </button>
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-2 text-white disabled:opacity-30 md:right-6"
              aria-label="Next photo"
              disabled={zoomIdx >= total - 1}
              onClick={(e) => {
                e.stopPropagation();
                setZoomIdx((z) => (z == null ? z : Math.min(total - 1, z + 1)));
              }}
            >
              <ChevronRight />
            </button>
            <div className="relative h-[82vh] w-full max-w-5xl" onClick={(e) => e.stopPropagation()}>
              <Image
                src={zoomPage.imageUrl}
                alt={zoomPage.altText || zoomPage.title}
                fill
                className="object-contain"
                sizes="100vw"
                priority
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
