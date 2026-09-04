"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const KEY = "angel_cookie_consent";

export function CookieBanner({ enabled }: { enabled: boolean }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!enabled) return;
    const existing = localStorage.getItem(KEY);
    if (!existing) setVisible(true);
  }, [enabled]);

  if (!enabled || !visible) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-[70] p-4">
      <div className="mx-auto flex max-w-3xl flex-col gap-3 rounded-lg border border-white/10 bg-[var(--brand-black)] p-4 text-white shadow-2xl md:flex-row md:items-center md:justify-between">
        <p className="text-sm text-white/80">
          Χρησιμοποιούμε απαραίτητα cookies για τη λειτουργία του ιστότοπου.{" "}
          <Link href="/cookies" className="underline">
            Μάθετε περισσότερα
          </Link>
          .
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            className="rounded-md bg-white/10 px-3 py-2 text-sm"
            onClick={() => {
              localStorage.setItem(KEY, "essential");
              setVisible(false);
            }}
          >
            Μόνο απαραίτητα
          </button>
          <button
            type="button"
            className="rounded-md bg-[var(--brand-pink)] px-3 py-2 text-sm"
            onClick={() => {
              localStorage.setItem(KEY, "all");
              setVisible(false);
            }}
          >
            Αποδοχή
          </button>
        </div>
      </div>
    </div>
  );
}
