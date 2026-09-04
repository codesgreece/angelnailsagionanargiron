"use client";

import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { motion, useReducedMotion } from "framer-motion";
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

export function IntroOverlay({ config, onDone }: Props) {
  const reduce = useReducedMotion();
  const [startedAt] = useState(() => performance.now());
  const [progress, setProgress] = useState(0);
  const [skipReady, setSkipReady] = useState(false);
  const [exiting, setExiting] = useState(false);
  const [mounted3d, setMounted3d] = useState(true);
  const [use3d, setUse3d] = useState(false);
  const finished = useRef(false);
  const quality = useMemo(() => detectQuality(config), [config]);
  const duration = Math.min(4000, Math.max(2200, config.durationMs || 3200));

  useEffect(() => {
    setUse3d(supportsWebGL() && !reduce && config.style !== "minimal");
  }, [reduce, config.style]);

  const finish = useCallback(() => {
    if (finished.current) return;
    finished.current = true;
    setExiting(true);
    markIntroPlayed();
    window.setTimeout(() => setMounted3d(false), 280);
    window.setTimeout(() => onDone(), 680);
  }, [onDone]);

  useEffect(() => {
    const skipTimer = window.setTimeout(() => setSkipReady(true), 800);
    const tick = window.setInterval(() => {
      const p = Math.min(1, (performance.now() - startedAt) / duration);
      setProgress(p);
      if (p >= 1) finish();
    }, 40);
    return () => {
      window.clearTimeout(skipTimer);
      window.clearInterval(tick);
    };
  }, [duration, startedAt, finish]);

  const show3d = use3d && config.style !== "minimal" && mounted3d;
  const logoPhase = progress;

  return (
    <motion.div
      className="fixed inset-0 z-[200] overflow-hidden bg-[#050507]"
      initial={{ opacity: 1, clipPath: "circle(140% at 50% 46%)" }}
      animate={
        exiting
          ? {
              opacity: 0,
              clipPath: "circle(0% at 50% 46%)",
              filter: "brightness(1.35)",
            }
          : { opacity: 1, clipPath: "circle(140% at 50% 46%)" }
      }
      transition={{ duration: 0.58, ease: [0.22, 1, 0.36, 1] }}
      role="dialog"
      aria-label="Angel Nails cinematic intro"
    >
      {show3d ? (
        <div className="absolute inset-0">
          <Canvas
            dpr={quality === "high" ? [1, 1.5] : quality === "medium" ? [1, 1.15] : [1, 1]}
            gl={{
              antialias: quality !== "low",
              alpha: false,
              powerPreference: "high-performance",
              stencil: false,
              depth: true,
            }}
            camera={{ position: [0, 0.42, 5.4], fov: 40, near: 0.1, far: 40 }}
            onCreated={({ gl }) => {
              gl.setClearColor("#050507");
              gl.toneMappingExposure = 1.05;
            }}
          >
            <Suspense fallback={null}>
              <IntroScene
                config={config}
                quality={quality}
                reduced={!!reduce}
                startedAt={startedAt}
                exiting={exiting}
              />
            </Suspense>
          </Canvas>
        </div>
      ) : (
        <IntroFallback config={config} progress={progress} />
      )}

      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
        <div className="relative text-center" style={{ perspective: "900px" }}>
          {/* HTML logo for 2D fallback / minimal — 3D scene owns the logo otherwise */}
          {!show3d && (
            <>
              <motion.p
                className="absolute inset-0 text-[clamp(3.2rem,10vw,6.5rem)] leading-none"
                style={{
                  fontFamily: "var(--font-great-vibes), 'Great Vibes', cursive",
                  color: "transparent",
                  WebkitTextStroke: "1px rgba(255,63,135,0.85)",
                }}
                animate={{
                  opacity: logoPhase > 0.28 && logoPhase < 0.55 ? 0.9 : 0,
                  scale: logoPhase > 0.28 ? 1 : 0.94,
                }}
                transition={{ duration: 0.45 }}
              >
                Angel Nails
              </motion.p>
              <motion.p
                className="relative text-[clamp(3.2rem,10vw,6.5rem)] leading-none"
                style={{
                  fontFamily: "var(--font-great-vibes), 'Great Vibes', cursive",
                  background:
                    "linear-gradient(120deg, #ED2F78 0%, #FF3F87 35%, #fff 48%, #FF3F87 62%, #ED2F78 100%)",
                  backgroundSize: "220% 100%",
                  WebkitBackgroundClip: "text",
                  backgroundClip: "text",
                  color: "transparent",
                  filter:
                    logoPhase > 0.4
                      ? "drop-shadow(0 0 28px rgba(237,47,120,0.55))"
                      : "blur(4px)",
                }}
                animate={{
                  opacity: logoPhase > 0.32 ? (exiting ? 0 : 1) : 0,
                  scale: exiting ? 1.35 : logoPhase > 0.32 ? 1 : 0.92,
                  backgroundPosition: logoPhase > 0.5 ? ["0% 50%", "100% 50%"] : "0% 50%",
                }}
                transition={{ duration: exiting ? 0.45 : 0.75, ease: [0.22, 1, 0.36, 1] }}
              >
                Angel Nails
              </motion.p>
            </>
          )}

          {/* Spacer when 3D logo is active so subtitles sit under the mark */}
          {show3d && (
            <div
              className="text-[clamp(3.2rem,10vw,6.5rem)] leading-none opacity-0"
              aria-hidden
            >
              Angel Nails
            </div>
          )}

          {config.showSubtitle && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{
                opacity: logoPhase > 0.58 && !exiting ? 1 : 0,
                y: logoPhase > 0.58 ? 0 : 12,
              }}
              transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
              className="mt-7 space-y-2.5"
            >
              <p className="text-[10px] font-medium uppercase tracking-[0.38em] text-[#F7F6F4]/85 md:text-[11px]">
                MANICURE • PEDICURE • ΤΕΧΝΗΤΑ ΝΥΧΙΑ
              </p>
              <p className="text-[9px] uppercase tracking-[0.46em] text-[#D8D5D2]/45">
                BEAUTY LIVES IN DETAILS
              </p>
            </motion.div>
          )}
        </div>
      </div>

      <motion.div
        className="pointer-events-none absolute inset-0 mix-blend-screen"
        initial={{ opacity: 0, x: "-45%" }}
        animate={
          progress > 0.78 || exiting
            ? { opacity: [0, 0.55, 0], x: ["-45%", "15%", "120%"] }
            : { opacity: 0 }
        }
        transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        style={{
          background:
            "linear-gradient(108deg, transparent 28%, rgba(255,63,135,0.45) 48%, rgba(255,255,255,0.2) 52%, transparent 72%)",
        }}
      />

      {config.showSkip && skipReady && !exiting && (
        <button
          type="button"
          onClick={finish}
          className="absolute right-5 top-5 z-10 text-[11px] font-medium uppercase tracking-[0.28em] text-white/50 transition hover:text-white"
        >
          Skip
        </button>
      )}

      {config.showLoading && !exiting && (
        <div className="absolute bottom-10 left-1/2 z-10 w-[min(220px,60vw)] -translate-x-1/2 text-center">
          <div className="h-px w-full overflow-hidden bg-white/12">
            <div
              className="h-full bg-[#ED2F78] transition-[width] duration-75 ease-linear"
              style={{ width: `${Math.round(progress * 100)}%` }}
            />
          </div>
          <p className="mt-3 text-[9px] uppercase tracking-[0.35em] text-white/40">Loading...</p>
        </div>
      )}
    </motion.div>
  );
}
