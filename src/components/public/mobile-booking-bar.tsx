"use client";

import { ButtonLink } from "@/components/ui/button-link";

export function MobileBookingBar({ treatwellUrl }: { treatwellUrl: string }) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-[#09090B]/95 p-3 backdrop-blur-md md:hidden">
      <ButtonLink href={treatwellUrl} external className="w-full" size="lg">
        Κλείσε Ραντεβού
      </ButtonLink>
    </div>
  );
}
