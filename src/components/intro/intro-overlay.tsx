"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import type { IntroConfig } from "@/lib/intro/types";
import { markIntroPlayed } from "@/lib/intro/should-play";
import { IntroFallback } from "@/components/intro/intro-fallback";
import { IntroScene } from "@/components/intro/intro-scene";

type Props = {
  config: IntroConfig;
  force?: boolean;
  onDone: () => void;
};

function detectQuality(config: IntroConfig): "high" | "medium" | "low" {
  if (typeof window === "undefined") return "medium";
  const mobile = window.matchMedia("(max-width: 768px)").matches;
  if (mobile) {
    return config.mobileQuality === "high"
      ? "medium"
      : config.mobileQuality === "medium"
        ? "low"
        : "low";
  }
  if (config.qualityMode === "high") return "high";
  if (config.qualityMode === "medium") return "medium";
  if (config.qualityMode === "low") return "low";
  const cores = navigator.hardwareConcurrency || 4;
  const mem = (navigator as Navigator & { deviceMemory?: number }).deviceMemory || 4;
  if (cores <= 4 || mem <= 4) return "medium";
  return "high";
}

function supportsWebGL() {
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl") || c.getContext("experimental-webgl"));
  } catch {
    return false;
  }
}

export function IntroOverlay({ config, force, onDone }: Props) {
  const reduce = useReducedMotion();
  const [startedAt] = useState(() => performance.now());
  const [progress, setProgress] = useState(0);
  const [skipReady, setSkipReady] = useState(false);
  const [exiting, setExiting] = useState(false);
  const [use3d, setUse3d] = useState(false);
  const quality = useMemo(() => detectQuality(config), [config]);
  const duration = Math.min(4000, Math.max(2200, config.durationMs || 3200));

  useEffect(() => {
    setUse3d(supportsWebGL() && !reduce && config.style !== "minimal");
  }, [reduce, config.style]);

  useEffect(() => {
    const skipTimer = window.setTimeout(() => setSkipReady(true), 800);
    const tick = window.setInterval(() => {
      const p = Math.min(1, (performance.now() - startedAt) / duration);
      setProgress(p);
      if (p >= 1) finish();
    }, 50);
    return () => {
      window.clearTimeout(skipTimer);
      window.clearInterval(tick);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [duration, startedAt]);

  const finish = () => {
    if (exiting) return;
    setExiting(true);
    markIntroPlayed();
    window.setTimeout(() => onDone(), 480);
  };

  const show3d = use3d && config.style !== "minimal";

  return (
    <AnimatePresence>
      {!exiting ? (
        <motion.div
          className="fixed inset-0 z-[200] overflow-hidden bg-[#050507]"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, filter: "blur(12px)" }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          role="dialog"
          aria-label="Angel Nails cinematic intro"
        >
          {show3d ? (
            <div className="absolute inset-0">
              <Canvas
                dpr={quality === "high" ? [1, 1.5] : [1, 1.1]}
                gl={{ antialias: quality !== "low", alpha: false, powerPreference: "high-performance" }}
                camera={{ position: [0, 0.35, 5.2], fov: 42, near: 0.1, far: 40 }}
                onCreated={({ gl }) => {
                  gl.setClearColor("#050507");
                }}
              >
                <Suspense fallback={null}>
                  <IntroScene
                    config={config}
                    quality={quality}
                    reduced={!!reduce}
                    startedAt={startedAt}
                  />
                </Suspense>
              </Canvas>
            </div>
          ) : (
            <IntroFallback config={config} progress={progress} />
          )}

          {/* Logo HTML overlay — brand-accurate script */}
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <motion.div
              className="text-center"
              initial={{ opacity: 0, scale: 0.92, filter: "blur(8px)" }}
              animate={{
                opacity: progress > 0.28 ? 1 : 0,
                scale: progress > 0.28 ? 1 : 0.92,
                filter: progress > 0.4 ? "blur(0px)" : "blur(6px)",
              }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            >
              <p
                className="text-[clamp(3.2rem,10vw,6.5rem)] leading-none text-[#FF3F87]"
                style={{
                  fontFamily: "var(--font-great-vibes), 'Great Vibes', cursive",
                  textShadow:
                    "0 0 40px rgba(237,47,120,0.55), 0 10px 40px rgba(0,0,0,0.65)",
                }}
              >
                Angel Nails
              </p>

              {config.showSubtitle && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: progress > 0.55 ? 1 : 0, y: progress > 0.55 ? 0 : 10 }}
                  transition={{ duration: 0.5 }}
                  className="mt-6 space-y-2"
                >
                  <p className="text-[10px] font-medium uppercase tracking-[0.35em] text-white/80 md:text-[11px]">
                    MANICURE • PEDICURE • ΤΕΧΝΗΤΑ ΝΥΧΙΑ
                  </p>
                  <p className="text-[9px] uppercase tracking-[0.42em] text-white/45">
                    BEAUTY LIVES IN DETAILS
                  </p>
                </motion.div>
              )}
            </motion.div>
          </div>

          {/* Cinematic light sweep near end */}
          <motion.div
            className="pointer-events-none absolute inset-0"
            initial={{ opacity: 0, x: "-40%" }}
            animate={
              progress > 0.78
                ? { opacity: [0, 0.45, 0], x: ["-40%", "20%", "110%"] }
                : { opacity: 0 }
            }
            transition={{ duration: 0.85, ease: "easeInOut" }}
            style={{
              background:
                "linear-gradient(105deg, transparent 30%, rgba(255,63,135,0.35) 50%, transparent 70%)",
            }}
          />

          {config.showSkip && skipReady && (
            <button
              type="button"
              onClick={finish}
              className="absolute right-5 top-5 z-10 text-[11px] font-medium uppercase tracking-[0.28em] text-white/55 transition hover:text-white"
            >
              Skip
            </button>
          )}

          {config.showLoading && (
            <div className="absolute bottom-10 left-1/2 z-10 w-[min(220px,60vw)] -translate-x-1/2 text-center">
              <div className="h-px w-full overflow-hidden bg-white/15">
                <motion.div
                  className="h-full bg-[#ED2F78]"
                  style={{ width: `${Math.round(progress * 100)}%` }}
                />
              </div>
              <p className="mt-3 text-[9px] uppercase tracking-[0.35em] text-white/40">Loading...</p>
            </div>
          )}
        </motion.div>
      ) : (
        <motion.div
          key="exit-sweep"
          className="fixed inset-0 z-[200] bg-[#050507]"
          initial={{ opacity: 1, clipPath: "circle(120% at 50% 45%)" }}
          animate={{ opacity: 0, clipPath: "circle(0% at 50% 45%)" }}
          transition={{ duration: 0.48, ease: [0.22, 1, 0.36, 1] }}
        />
      )}
    </AnimatePresence>
  );
}
