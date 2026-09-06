"use client";

import { trackTreatwellClick } from "@/lib/analytics/track-treatwell-click";

export function MobileBookingBar({ treatwellUrl }: { treatwellUrl: string }) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-[#09090B]/95 p-3 backdrop-blur-md md:hidden">
      <a
        href={treatwellUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex min-h-12 w-full items-center justify-center rounded-md bg-[#ED2F78] px-5 text-base font-semibold"
        style={{ color: "#FFFFFF" }}
        onClick={() => trackTreatwellClick("mobile-bar")}
      >
        Κλείσε Ραντεβού
      </a>
    </div>
  );
}
