"use client";

import { useEffect, useState } from "react";

export function StickyBookingBar({
  treatwellUrl,
  brandName,
  address,
}: {
  treatwellUrl: string;
  brandName: string;
  address: string;
}) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const nearBookingCta = () => {
      const nodes = document.querySelectorAll("[data-booking-cta]");
      const vh = window.innerHeight;
      for (const node of nodes) {
        const r = (node as HTMLElement).getBoundingClientRect();
        if (r.top < vh * 0.85 && r.bottom > vh * 0.15) return true;
      }
      return false;
    };

    const onScroll = () => {
      const y = window.scrollY;
      const nearBottom =
        window.innerHeight + y >= document.documentElement.scrollHeight - 320;
      setVisible(y > 380 && !nearBottom && !nearBookingCta());
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  if (!visible) return null;

  return (
    <>
      {/* Desktop */}
      <div className="pointer-events-none fixed inset-x-0 bottom-4 z-40 hidden justify-center px-4 md:flex">
        <div className="pointer-events-auto flex w-full max-w-3xl items-center justify-between gap-4 rounded-xl border border-white/10 bg-[#09090B]/88 px-5 py-3 shadow-2xl backdrop-blur-md">
          <div>
            <p
              className="text-lg text-[#FF3F87]"
              style={{ fontFamily: "var(--font-great-vibes), 'Great Vibes', cursive" }}
            >
              {brandName}
            </p>
            <p className="text-xs text-white/65">{address}</p>
          </div>
          <a
            href={treatwellUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-11 items-center rounded-md bg-[#ED2F78] px-5 text-sm font-semibold"
            style={{ color: "#FFFFFF" }}
          >
            Κλείσε Ραντεβού
          </a>
        </div>
      </div>

      {/* Mobile */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-[#09090B]/92 px-3 py-2.5 backdrop-blur-md md:hidden">
        <div className="flex items-center justify-between gap-3">
          <p className="truncate text-sm font-medium" style={{ color: "#FFFFFF" }}>
            <span aria-hidden>💅 </span>
            {brandName}
          </p>
          <a
            href={treatwellUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 rounded-md bg-[#ED2F78] px-4 py-2.5 text-xs font-semibold"
            style={{ color: "#FFFFFF" }}
          >
            Κλείσε Ραντεβού
          </a>
        </div>
      </div>
    </>
  );
}
