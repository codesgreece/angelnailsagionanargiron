"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { trackTreatwellClick } from "@/lib/analytics/track-treatwell-click";

type Props = {
  href: string;
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "ghost" | "outline" | "outlineLight";
  className?: string;
  external?: boolean;
  size?: "sm" | "md" | "lg";
  /** When set, records a Treatwell CTA click before navigation. */
  trackSource?: string;
};

export function ButtonLink({
  href,
  children,
  variant = "primary",
  className,
  external,
  size = "md",
  trackSource,
}: Props) {
  const base =
    "inline-flex items-center justify-center gap-2 font-medium tracking-wide transition-transform duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ED2F78] active:scale-[0.98]";
  const sizes = {
    sm: "min-h-10 px-4 py-2 text-sm rounded-md",
    md: "min-h-11 px-5 py-2.5 text-sm rounded-md",
    lg: "min-h-12 px-7 py-3.5 text-base rounded-lg",
  };
  const variants = {
    primary:
      "bg-[#ED2F78] hover:bg-[#FF3F87] shadow-[0_10px_28px_rgba(237,47,120,0.28)]",
    secondary: "bg-[#09090B] hover:bg-[#17171A]",
    ghost: "bg-transparent hover:bg-black/5",
    outline: "border border-[#09090B]/25 bg-transparent hover:border-[#ED2F78]",
    outlineLight:
      "border border-[#FFFFFF]/55 bg-[#FFFFFF]/10 backdrop-blur-sm hover:bg-[#FFFFFF]",
  };

  const colorStyle =
    variant === "outline"
      ? { color: "#09090B" }
      : variant === "ghost"
        ? undefined
        : variant === "outlineLight"
          ? { color: "#FFFFFF" }
          : { color: "#FFFFFF" };

  const cls = cn(base, sizes[size], variants[variant], className);
  const onTrack = trackSource
    ? () => {
        trackTreatwellClick(trackSource);
      }
    : undefined;

  if (external) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={cls}
        style={colorStyle}
        onClick={onTrack}
        data-booking-cta={trackSource ? true : undefined}
      >
        {children}
      </a>
    );
  }

  return (
    <Link href={href} className={cls} style={colorStyle} onClick={onTrack}>
      {children}
    </Link>
  );
}
