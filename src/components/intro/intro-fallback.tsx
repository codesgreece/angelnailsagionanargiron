"use client";

import { motion } from "framer-motion";
import type { IntroConfig } from "@/lib/intro/types";

/** Premium 2D cinematic fallback for reduced-motion / no-WebGL / minimal style */
export function IntroFallback({
  config,
  progress,
}: {
  config: IntroConfig;
  progress: number;
}) {
  return (
    <div className="absolute inset-0 overflow-hidden bg-[#050507]">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(237,47,120,0.2),transparent_52%)]" />

      {/* Soft marble wash */}
      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage:
            "repeating-linear-gradient(115deg, transparent 0 18px, rgba(255,255,255,0.015) 18px 19px)",
        }}
      />

      {/* Reflective floor suggestion */}
      <div className="absolute inset-x-0 bottom-0 h-[42%] bg-gradient-to-t from-black via-[#0a0a0c]/90 to-transparent" />
      <motion.div
        className="absolute left-1/2 top-[58%] h-px w-[55%] -translate-x-1/2"
        style={{
          background: "linear-gradient(90deg, transparent, rgba(255,63,135,0.45), transparent)",
        }}
        animate={{ opacity: [0.2, 0.7, 0.35], scaleX: [0.7, 1, 0.95] }}
        transition={{ duration: 2.4, ease: "easeInOut" }}
      />

      {/* Liquid chrome ring */}
      {config.style !== "logo-reveal" && (
        <motion.div
          className="absolute left-1/2 top-[42%] h-[46vmin] w-[46vmin] -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{
            border: "1.5px solid transparent",
            background:
              "conic-gradient(from 90deg, transparent 0%, #FF3F87 18%, #fff 22%, #ED2F78 32%, transparent 48%) border-box",
            WebkitMask:
              "linear-gradient(#000 0 0) padding-box, linear-gradient(#000 0 0)",
            mask: "linear-gradient(#000 0 0) padding-box, linear-gradient(#000 0 0)",
            boxShadow: "0 0 60px rgba(237,47,120,0.22)",
          }}
          initial={{ opacity: 0, scale: 0.55, rotate: -30 }}
          animate={{ opacity: 1, scale: 1, rotate: 140 }}
          transition={{ duration: 2.6, ease: [0.22, 1, 0.36, 1] }}
        />
      )}

      {/* Halo */}
      {(config.style === "angel-reveal" || config.style === "logo-reveal") && (
        <motion.div
          className="absolute left-1/2 top-[42%] h-[58vmin] w-[58vmin] -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#ED2F78]/30"
          style={{ boxShadow: "0 0 90px rgba(237,47,120,0.2)" }}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: progress > 0.55 ? 0.85 : 0, scale: progress > 0.55 ? 1 : 0.8 }}
          transition={{ duration: 0.7 }}
        />
      )}

      {config.showPetals &&
        [0, 1, 2, 3].map((i) => (
          <motion.span
            key={i}
            className="absolute h-2.5 w-4 rounded-[100%] bg-[#FF3F87]/65"
            style={{ left: `${18 + i * 17}%`, top: `${28 + (i % 3) * 10}%` }}
            animate={{ y: [0, 140], opacity: [0, 0.75, 0], rotate: 90 }}
            transition={{ duration: 2.5, delay: 0.35 + i * 0.18, ease: "easeIn" }}
          />
        ))}

      <div className="sr-only">{Math.round(progress * 100)}%</div>
    </div>
  );
}
