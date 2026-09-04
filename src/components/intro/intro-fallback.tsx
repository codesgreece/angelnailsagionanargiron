"use client";

import { motion } from "framer-motion";
import type { IntroConfig } from "@/lib/intro/types";

export function IntroFallback({
  config,
  progress,
}: {
  config: IntroConfig;
  progress: number;
}) {
  return (
    <div className="absolute inset-0 overflow-hidden bg-[#050507]">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(237,47,120,0.22),transparent_55%)]" />
      <motion.div
        className="absolute left-1/2 top-[42%] h-[42vmin] w-[42vmin] -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#ED2F78]/35"
        style={{ boxShadow: "0 0 80px rgba(237,47,120,0.25)" }}
        animate={{ rotate: 120, scale: [0.7, 1.05, 1] }}
        transition={{ duration: 2.8, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute left-1/2 top-[42%] h-[28vmin] w-[28vmin] -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          background:
            "conic-gradient(from 120deg, transparent, rgba(255,63,135,0.55), transparent 40%)",
          filter: "blur(1px)",
        }}
        animate={{ rotate: -180 }}
        transition={{ duration: 2.6, ease: "linear" }}
      />
      {config.showPetals &&
        [0, 1, 2, 3].map((i) => (
          <motion.span
            key={i}
            className="absolute h-3 w-5 rounded-[100%] bg-[#FF3F87]/70"
            style={{ left: `${20 + i * 18}%`, top: `${30 + (i % 3) * 12}%` }}
            animate={{ y: [0, 120], opacity: [0, 0.8, 0], rotate: 80 }}
            transition={{ duration: 2.4, delay: 0.3 + i * 0.2, ease: "easeIn" }}
          />
        ))}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/70 to-transparent" />
      <div className="sr-only">{Math.round(progress * 100)}%</div>
    </div>
  );
}
