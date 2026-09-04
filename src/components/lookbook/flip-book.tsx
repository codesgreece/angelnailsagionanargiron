"use client";

import Image from "next/image";
import Link from "next/link";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { AnimatePresence, motion, useMotionValue, useReducedMotion, useSpring } from "framer-motion";
import { ChevronLeft, ChevronRight, Maximize2, Minimize2, X, ZoomIn } from "lucide-react";
import type { LookbookData, LookbookPage } from "@/lib/lookbook/types";
import { formatPrice } from "@/lib/utils";
import "./lookbook.css";

type Props = {
  data: LookbookData;
  autoOpen?: boolean;
  compact?: boolean;
  className?: string;
};

function PageContent({
  page,
  treatwellUrl,
  onZoom,
  priority,
}: {
  page: LookbookPage;
  treatwellUrl: string;
  onZoom: () => void;
  priority?: boolean;
}) {
  return (
    <div className="relative flex h-full flex-col">
      <button
        type="button"
        className="relative block min-h-0 w-full flex-[1.35] overflow-hidden bg-[#ddd6ce]"
        onClick={(e) => {
          e.stopPropagation();
          onZoom();
        }}
        aria-label={`Μεγέθυνση: ${page.title}`}
      >
        <Image
          src={page.imageUrl}
          alt={page.altText || page.title}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 92vw, 42vw"
          loading={priority ? "eager" : "lazy"}
          priority={priority}
        />
        <span className="absolute bottom-3 right-3 inline-flex h-8 w-8 items-center justify-center rounded-full bg-black/45 text-white backdrop-blur-sm">
          <ZoomIn size={14} />
        </span>
      </button>
      <div className="space-y-1.5 p-4 md:p-5">
        <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#ED2F78]">
          {page.category}
        </p>
        <h3
          className="text-xl leading-tight text-[#141218] md:text-2xl"
          style={{ fontFamily: "var(--font-cormorant), Georgia, serif" }}
        >
          {page.title}
        </h3>
        {page.description && (
          <p className="line-clamp-2 text-sm text-[#141218]/65">{page.description}</p>
        )}
        {(page.serviceName || page.servicePrice) && (
          <p className="pt-1 text-xs text-[#141218]/55">
            {[
              page.serviceName,
              page.serviceDuration,
              page.servicePrice ? formatPrice(page.servicePrice) : null,
            ]
              .filter(Boolean)
              .join(" · ")}
          </p>
        )}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <a
            href={treatwellUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="inline-flex min-h-9 items-center rounded-md bg-[#ED2F78] px-3 text-xs font-semibold"
            style={{ color: "#FFFFFF" }}
          >
            Κλείσε Ραντεβού
          </a>
          <Link
            href={`/gallery#${page.id}`}
            onClick={(e) => e.stopPropagation()}
            className="text-xs text-[#141218]/55 underline-offset-2 hover:underline"
          >
            View full photo
          </Link>
        </div>
      </div>
    </div>
  );
}

function CoverFace({
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
    <div className="lookbook-page-face lookbook-cover-face relative flex h-full flex-col justify-between p-6 md:p-8">
      {coverImageUrl && (
        <Image
          src={coverImageUrl}
          alt=""
          fill
          className="object-cover opacity-30"
          sizes="40vw"
          priority
        />
      )}
      <div className="relative z-10">
        <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-white/70">Angel Nails</p>
        <div className="mt-3 h-px w-12" style={{ background: accent }} />
      </div>
      <div className="relative z-10 text-center">
        <p
          className="text-4xl text-[#FF3F87] md:text-5xl"
          style={{ fontFamily: "var(--font-great-vibes), 'Great Vibes', cursive" }}
        >
          Angel Nails
        </p>
        <h2
          className="mt-4 text-2xl font-semibold tracking-[0.12em] text-white md:text-3xl"
          style={{ fontFamily: "var(--font-cormorant), Georgia, serif" }}
        >
          {title}
        </h2>
        <p className="mt-3 text-[11px] font-medium uppercase tracking-[0.24em] text-white/75">{subtitle}</p>
      </div>
      <p className="relative z-10 text-[10px] uppercase tracking-[0.2em] text-white/50">Nail Lookbook</p>
    </div>
  );
}

function PaperBack() {
  return (
    <div className="flex h-full items-center justify-center">
      <div className="h-[70%] w-px bg-black/10" />
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
  const [supports3d, setSupports3d] = useState(true);
  const stageRef = useRef<HTMLDivElement>(null);
  const dragStartX = useRef<number | null>(null);
  const dragging = useRef(false);
  const animRef = useRef<number | null>(null);

  const tiltX = useMotionValue(0);
  const tiltY = useMotionValue(0);
  const springX = useSpring(tiltX, { stiffness: 140, damping: 20 });
  const springY = useSpring(tiltY, { stiffness: 140, damping: 20 });

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 768px)");
    const apply = () => setIsMobile(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    const el = document.createElement("div");
    el.style.cssText = "transform:rotateY(1deg);transform-style:preserve-3d";
    setSupports3d(Boolean(el.style.transform) && !/Android [1-4]\./.test(navigator.userAgent));
    return () => mq.removeEventListener("change", apply);
  }, []);

  useEffect(() => {
    if (autoOpen) openBook();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoOpen]);

  const total = pages.length;
  const step = isMobile ? 1 : 2;
  const pageLabel = total === 0 ? "0 / 0" : `${Math.min(index + 1, total)} / ${total}`;
  const canPrev = opened && !opening && index > 0 && !flipping;
  const canNext = opened && !opening && index < total - step && !flipping;

  const leftPage = pages[index] || null;
  const rightPage = pages[index + 1] || null;
  const nextRight = pages[index + 2] || null;
  const prevLeft = pages[index - 2] || null;
  const singlePage = pages[index] || null;

  const cancelAnim = () => {
    if (animRef.current != null) cancelAnimationFrame(animRef.current);
    animRef.current = null;
  };

  const animateFlipTo = useCallback(
    (target: number, onDone: () => void) => {
      cancelAnim();
      const start = flipProgress;
      const t0 = performance.now();
      const dur = 420;
      const tick = (t: number) => {
        const p = Math.min(1, (t - t0) / dur);
        const eased = 1 - Math.pow(1 - p, 3);
        setFlipProgress(start + (target - start) * eased);
        if (p < 1) animRef.current = requestAnimationFrame(tick);
        else onDone();
      };
      animRef.current = requestAnimationFrame(tick);
    },
    [flipProgress],
  );

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

  const goNext = useCallback(() => {
    if (!opened || opening || flipping || index >= total - step) return;
    if (reduce || !supports3d) {
      completeNext();
      return;
    }
    setFlipping("next");
    setFlipProgress(0);
    const start = performance.now();
    const dur = 680;
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / dur);
      setFlipProgress(1 - Math.pow(1 - p, 3));
      if (p < 1) animRef.current = requestAnimationFrame(tick);
      else completeNext();
    };
    animRef.current = requestAnimationFrame(tick);
  }, [opened, opening, flipping, index, total, step, reduce, supports3d, completeNext]);

  const goPrev = useCallback(() => {
    if (!opened || opening || flipping || index <= 0) return;
    if (reduce || !supports3d) {
      completePrev();
      return;
    }
    setFlipping("prev");
    setFlipProgress(0);
    const start = performance.now();
    const dur = 680;
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / dur);
      setFlipProgress(1 - Math.pow(1 - p, 3));
      if (p < 1) animRef.current = requestAnimationFrame(tick);
      else completePrev();
    };
    animRef.current = requestAnimationFrame(tick);
  }, [opened, opening, flipping, index, reduce, supports3d, completePrev]);

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
    }, 1100);
  }, [opened, opening, reduce]);

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
    if (!dragging.current || dragStartX.current == null || opening) return;
    const dx = e.clientX - dragStartX.current;
    const width = stageRef.current?.clientWidth || 400;
    const p = Math.max(-1, Math.min(1, dx / (width * 0.42)));
    if (reduce || !supports3d) return;
    if (p < 0 && (canNext || flipping === "next")) {
      setFlipping("next");
      setFlipProgress(Math.abs(p));
    } else if (p > 0 && (canPrev || flipping === "prev")) {
      setFlipping("prev");
      setFlipProgress(Math.abs(p));
    } else if (!dragging.current) {
      setFlipping(null);
      setFlipProgress(0);
    }
  };

  const onPointerUp = () => {
    if (!dragging.current) return;
    dragging.current = false;
    dragStartX.current = null;
    if (!flipping) return;
    if (flipProgress > 0.32) {
      animateFlipTo(1, flipping === "next" ? completeNext : completePrev);
    } else {
      animateFlipTo(0, () => {
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
    tiltY.set(nx * 5);
    tiltX.set(-ny * 3.5);
  };

  const onMouseLeave = () => {
    tiltX.set(0);
    tiltY.set(0);
  };

  const bookW = compact
    ? "min(420px, 88vw)"
    : fullscreen
      ? "min(1000px, 94vw)"
      : "min(880px, 92vw)";
  const bookH = compact
    ? "min(300px, 56vw)"
    : fullscreen
      ? "min(640px, 74vh)"
      : isMobile
        ? "min(540px, 78vh)"
        : "min(540px, 64vh)";

  const flipAngle = flipProgress * 180;
  const shade = flipProgress * 0.35;

  const preloadUrls = useMemo(() => {
    const set = new Set<string>();
    for (let i = Math.max(0, index - 2); i <= Math.min(total - 1, index + 4); i++) {
      if (pages[i]) set.add(pages[i].imageUrl);
    }
    if (settings.coverImageUrl) set.add(settings.coverImageUrl);
    return [...set];
  }, [index, pages, total, settings.coverImageUrl]);

  const zoomPage = zoomIdx != null ? pages[zoomIdx] : null;

  if (total === 0) {
    return (
      <div className="rounded-xl border border-white/10 bg-black/40 p-10 text-center text-white/70">
        Δεν υπάρχουν ακόμα looks στο Lookbook.
      </div>
    );
  }

  return (
    <div
      className={`lookbook-stage ${fullscreen ? "fixed inset-0 z-[90] flex flex-col bg-[#050507] px-4 py-6" : ""} ${className || ""}`}
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
        className="lookbook-scene relative z-10 mx-auto flex flex-col items-center"
        onMouseMove={onMouseMove}
        onMouseLeave={onMouseLeave}
      >
        <motion.div
          className="lookbook-book"
          style={{
            width: bookW,
            height: bookH,
            rotateX: isMobile || !opened || opening ? 0 : springX,
            rotateY: isMobile || !opened || opening ? 0 : springY,
          }}
          animate={
            opening
              ? { y: [0, -18, -8], rotateX: [8, 2, 0], scale: [1, 1.03, 1] }
              : opened
                ? { y: 0, rotateX: 0, scale: 1 }
                : { y: 0, rotateX: 6, scale: 1 }
          }
          transition={{ duration: opening ? 1.1 : 0.45, ease: [0.22, 1, 0.36, 1] }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
        >
          <div className="lookbook-shadow" style={{ opacity: opened ? 0.9 : 0.7 }} />

          {!opened ? (
            <motion.button
              type="button"
              className="absolute inset-0 z-20 cursor-pointer"
              style={{ transformStyle: "preserve-3d" }}
              animate={
                opening
                  ? { rotateY: -155, x: "-18%" }
                  : { rotateY: 0, x: 0 }
              }
              transition={{ duration: 1.05, ease: [0.22, 1, 0.36, 1] }}
              onClick={openBook}
              aria-label="Explore the Lookbook"
            >
              <div className="lookbook-cover-thickness" />
              <div className="lookbook-stack-edge right" />
              <CoverFace
                title={settings.title}
                subtitle={settings.subtitle}
                coverImageUrl={settings.coverImageUrl}
                accent={settings.accentColor}
              />
            </motion.button>
          ) : isMobile || !supports3d ? (
            <div className="absolute inset-0 overflow-hidden rounded-sm">
              <div className="lookbook-stack-edge right" />
              <div
                className="lookbook-page-face absolute inset-0"
                style={{
                  transformOrigin: "left center",
                  transform:
                    supports3d && flipping === "next"
                      ? `rotateY(${-flipAngle}deg)`
                      : supports3d && flipping === "prev"
                        ? `rotateY(${flipAngle - 180}deg)`
                        : "none",
                  opacity: !supports3d && flipping ? 1 - flipProgress * 0.35 : 1,
                  zIndex: 4,
                  boxShadow: flipping
                    ? `${flipping === "next" ? -18 : 18}px 0 36px rgba(0,0,0,${0.22 + flipProgress * 0.28})`
                    : undefined,
                  transition: reduce ? "none" : undefined,
                }}
              >
                {singlePage && (
                  <PageContent
                    page={singlePage}
                    treatwellUrl={treatwellUrl}
                    onZoom={() => setZoomIdx(index)}
                    priority
                  />
                )}
                {flipping && (
                  <div
                    className="lookbook-flip-shade"
                    style={{
                      background: `linear-gradient(${flipping === "next" ? "90deg" : "270deg"}, rgba(0,0,0,${shade}), transparent 55%)`,
                    }}
                  />
                )}
              </div>
              <div className="lookbook-page-face absolute inset-0" style={{ zIndex: 1 }}>
                {pages[
                  flipping === "next" ? index + 1 : flipping === "prev" ? index - 1 : index
                ] && (
                  <PageContent
                    page={
                      pages[
                        flipping === "next" ? index + 1 : flipping === "prev" ? index - 1 : index
                      ]
                    }
                    treatwellUrl={treatwellUrl}
                    onZoom={() => {}}
                  />
                )}
              </div>
            </div>
          ) : (
            <div className="absolute inset-0" style={{ transformStyle: "preserve-3d" }}>
              <div className="lookbook-spine" />
              <div className="lookbook-stack-edge left" />
              <div className="lookbook-stack-edge right" />

              {/* Stable left page */}
              <div
                className="lookbook-leaf left"
                style={{
                  zIndex: flipping === "prev" ? 2 : 3,
                  transform: flipping === "prev" ? `rotateY(${flipAngle}deg)` : "rotateY(0deg)",
                }}
              >
                <div className="lookbook-leaf-face front border-r border-black/5">
                  {flipping === "prev" && prevLeft ? (
                    <PageContent
                      page={prevLeft}
                      treatwellUrl={treatwellUrl}
                      onZoom={() => setZoomIdx(index - 2)}
                    />
                  ) : (
                    leftPage && (
                      <PageContent
                        page={leftPage}
                        treatwellUrl={treatwellUrl}
                        onZoom={() => setZoomIdx(index)}
                        priority
                      />
                    )
                  )}
                  {flipping === "prev" && (
                    <div
                      className="lookbook-flip-shade"
                      style={{
                        background: `linear-gradient(270deg, rgba(0,0,0,${shade}), transparent 60%)`,
                      }}
                    />
                  )}
                </div>
                <div className="lookbook-leaf-face back">
                  <PaperBack />
                </div>
              </div>

              {/* Right page — primary flip leaf */}
              <div
                className="lookbook-leaf right"
                style={{
                  zIndex: flipping === "next" ? 7 : 4,
                  transform: flipping === "next" ? `rotateY(${-flipAngle}deg)` : "rotateY(0deg)",
                  filter:
                    flipping === "next"
                      ? `brightness(${1 - flipProgress * 0.12})`
                      : undefined,
                }}
              >
                <div className="lookbook-leaf-face front border-l border-black/5">
                  {rightPage ? (
                    <PageContent
                      page={rightPage}
                      treatwellUrl={treatwellUrl}
                      onZoom={() => setZoomIdx(index + 1)}
                      priority
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-sm text-black/40">
                      Τέλος lookbook
                    </div>
                  )}
                  {flipping === "next" && (
                    <div
                      className="lookbook-flip-shade"
                      style={{
                        background: `linear-gradient(90deg, rgba(0,0,0,${shade}), transparent 55%)`,
                      }}
                    />
                  )}
                </div>
                <div className="lookbook-leaf-face back">
                  {nextRight ? (
                    <PageContent
                      page={nextRight}
                      treatwellUrl={treatwellUrl}
                      onZoom={() => {}}
                    />
                  ) : (
                    <PaperBack />
                  )}
                </div>
              </div>

              {/* Under-sheet revealed during next flip */}
              {flipping === "next" && nextRight && (
                <div className="lookbook-leaf right" style={{ zIndex: 1 }}>
                  <div className="lookbook-leaf-face front">
                    <PageContent
                      page={nextRight}
                      treatwellUrl={treatwellUrl}
                      onZoom={() => {}}
                    />
                  </div>
                </div>
              )}

              {/* Under left when flipping prev */}
              {flipping === "prev" && leftPage && (
                <div className="lookbook-leaf left" style={{ zIndex: 1 }}>
                  <div className="lookbook-leaf-face front">
                    <PageContent
                      page={pages[index - 2] ? leftPage : leftPage}
                      treatwellUrl={treatwellUrl}
                      onZoom={() => {}}
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </motion.div>

        {!opened && !opening && (
          <button
            type="button"
            onClick={openBook}
            className="relative z-20 mt-8 inline-flex min-h-12 items-center justify-center rounded-md bg-[#ED2F78] px-6 text-sm font-semibold tracking-wide"
            style={{ color: "#FFFFFF" }}
          >
            EXPLORE THE LOOKBOOK
          </button>
        )}

        {opened && !opening && (
          <div className="relative z-20 mt-8 flex w-full max-w-md items-center justify-between gap-3 px-2">
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
              Page {pageLabel}
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
        )}

        {opened && !opening && (
          <div className="relative z-20 mt-4 flex gap-2">
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
            className="fixed inset-0 z-[110] flex items-center justify-center bg-black/92 p-4"
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
            <div
              className="relative h-[80vh] w-full max-w-4xl"
              onClick={(e) => e.stopPropagation()}
            >
              <Image
                src={zoomPage.imageUrl}
                alt={zoomPage.altText || zoomPage.title}
                fill
                className="object-contain"
                sizes="100vw"
                priority
              />
            </div>
            <p className="absolute bottom-6 left-0 right-0 text-center text-sm text-white/70">
              {zoomPage.title}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
