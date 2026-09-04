"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export function FadeIn({
  children,
  className,
  delay = 0,
  y = 24,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  y?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Always reveal eventually — never leave content invisible on iOS
    const fallback = window.setTimeout(() => setVisible(true), 80 + delay * 1000);

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      setVisible(true);
      window.clearTimeout(fallback);
      return;
    }

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          window.setTimeout(() => setVisible(true), delay * 1000);
          io.disconnect();
          window.clearTimeout(fallback);
        }
      },
      { threshold: 0.08, rootMargin: "0px 0px -8% 0px" },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      window.clearTimeout(fallback);
    };
  }, [delay]);

  return (
    <div
      ref={ref}
      className={cn("reveal", visible && "reveal-in", className)}
      style={{
        ["--reveal-y" as string]: `${y}px`,
        ["--reveal-delay" as string]: `${delay}s`,
      }}
    >
      {children}
    </div>
  );
}
