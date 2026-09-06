"use client";

import { useEffect, useId, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Gift, Sparkles, X } from "lucide-react";
import type { PromoPopupConfig } from "@/lib/promo/types";
import {
  markPromoPopupSeen,
  promoCampaignId,
  shouldShowPromoPopup,
} from "@/lib/promo/should-show";

export function PromoPopupGate({
  config,
  treatwellUrl,
  force = false,
}: {
  config: PromoPopupConfig;
  treatwellUrl: string;
  force?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const titleId = useId();
  const reduce = useReducedMotion();

  useEffect(() => {
    if (!config.enabled && !force) {
      setOpen(false);
      return;
    }

    const campaign = promoCampaignId(config.updatedAt);
    if (!shouldShowPromoPopup(config.frequency, campaign, force)) {
      setOpen(false);
      return;
    }

    const delay = force ? 200 : Math.max(0, config.delayMs ?? 6000);
    const timer = window.setTimeout(() => setOpen(true), delay);
    return () => window.clearTimeout(timer);
  }, [config, force]);

  function close() {
    setOpen(false);
    if (!force) {
      markPromoPopupSeen(promoCampaignId(config.updatedAt));
    }
  }

  const href = config.ctaUrl?.trim() || treatwellUrl;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[120] flex items-center justify-center p-4 sm:p-6"
          initial={reduce ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.28 }}
        >
          <button
            type="button"
            aria-label="Κλείσιμο προσφοράς"
            className="absolute inset-0 bg-[#09090B]/70 backdrop-blur-[6px]"
            onClick={close}
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            className="relative z-10 w-full max-w-[420px] overflow-hidden rounded-2xl border border-white/10 bg-[#0F0F12] text-white shadow-[0_30px_80px_rgba(0,0,0,0.55)]"
            initial={reduce ? false : { opacity: 0, y: 28, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_0%,rgba(237,47,120,0.28),transparent_55%)]" />
            <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-[#FF3F87]/15 blur-3xl" />

            <button
              type="button"
              onClick={close}
              className="absolute right-3 top-3 z-20 rounded-full bg-white/10 p-2 text-white/80 transition hover:bg-white/20 hover:text-white"
              aria-label="Κλείσιμο"
            >
              <X size={16} />
            </button>

            <div className="relative px-6 pb-7 pt-8 sm:px-8">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#FF3F87]/35 bg-[#FF3F87]/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#FF3F87]">
                <Sparkles size={12} />
                {config.eyebrow}
              </div>

              <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#ED2F78] to-[#FF3F87] shadow-[0_12px_30px_rgba(237,47,120,0.35)]">
                <Gift className="text-white" size={26} />
              </div>

              <h2
                id={titleId}
                className="text-3xl leading-tight text-white sm:text-4xl"
                style={{ fontFamily: "var(--font-cormorant), Georgia, serif" }}
              >
                {config.title}
              </h2>

              <p className="mt-3 text-base leading-relaxed text-white/75">{config.body}</p>

              {config.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={config.imageUrl}
                  alt=""
                  className="mt-5 h-36 w-full rounded-xl object-cover"
                />
              ) : null}

              <div className="mt-7 flex flex-col gap-3">
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={close}
                  className="inline-flex min-h-12 items-center justify-center rounded-lg bg-[#ED2F78] px-5 text-sm font-semibold text-white shadow-[0_12px_28px_rgba(237,47,120,0.35)] transition hover:bg-[#FF3F87]"
                >
                  {config.ctaLabel}
                </a>
                <button
                  type="button"
                  onClick={close}
                  className="text-sm text-white/55 transition hover:text-white/85"
                >
                  Όχι τώρα
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
