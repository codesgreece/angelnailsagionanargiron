"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";

const KEY = "angel_cookie_consent";

export function CookieBanner({ enabled }: { enabled: boolean }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!enabled) return;
    const existing = localStorage.getItem(KEY);
    if (!existing) setVisible(true);
  }, [enabled]);

  return (
    <AnimatePresence>
      {enabled && visible && (
        <motion.div
          className="fixed inset-x-0 bottom-[4.75rem] z-[70] p-3 sm:bottom-0 sm:p-4"
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 24, opacity: 0 }}
          transition={{ duration: 0.35 }}
        >
          <div className="mx-auto flex max-w-3xl flex-col gap-3 rounded-xl border border-white/15 bg-[#09090B]/95 p-4 text-white shadow-2xl backdrop-blur-md md:flex-row md:items-center md:justify-between">
            <p className="text-sm leading-relaxed text-white">
              Χρησιμοποιούμε απαραίτητα cookies για τη λειτουργία του ιστότοπου.{" "}
              <Link href="/cookies" className="underline underline-offset-2">
                Μάθετε περισσότερα
              </Link>
              .
            </p>
            <div className="flex shrink-0 gap-2">
              <button
                type="button"
                className="rounded-md border border-white/25 px-3 py-2.5 text-sm text-white"
                onClick={() => {
                  localStorage.setItem(KEY, "essential");
                  setVisible(false);
                }}
              >
                Μόνο απαραίτητα
              </button>
              <button
                type="button"
                className="rounded-md bg-[#ED2F78] px-3 py-2.5 text-sm font-medium text-white"
                onClick={() => {
                  localStorage.setItem(KEY, "all");
                  setVisible(false);
                }}
              >
                Αποδοχή
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
