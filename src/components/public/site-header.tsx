"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { BrandLogo } from "@/components/public/brand-logo";
import { trackTreatwellClick } from "@/lib/analytics/track-treatwell-click";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/", label: "Αρχική" },
  { href: "/services", label: "Υπηρεσίες" },
  { href: "/gallery", label: "Gallery" },
  { href: "/about", label: "Σχετικά" },
  { href: "/contact", label: "Επικοινωνία" },
];

export function SiteHeader({ treatwellUrl }: { treatwellUrl: string }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);
  const isHome = pathname === "/";
  const reduce = useReducedMotion();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const solid = !isHome || scrolled;

  const mobileMenu =
    mounted &&
    createPortal(
      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-[100] flex flex-col bg-[#09090B] lg:hidden"
            style={{ color: "#FFFFFF" }}
            initial={reduce ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
          >
            <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
              <Link href="/" aria-label="Angel Nails αρχική" onClick={() => setOpen(false)}>
                <BrandLogo size="sm" />
              </Link>
              <button
                type="button"
                className="inline-flex h-10 w-10 items-center justify-center text-[#FFFFFF]"
                aria-label="Κλείσιμο μενού"
                onClick={() => setOpen(false)}
              >
                <X size={22} />
              </button>
            </div>

            <nav className="flex flex-1 flex-col px-5 pt-8" aria-label="Mobile" style={{ color: "#FFFFFF" }}>
              {NAV.map((item, i) => {
                const active = pathname === item.href;
                return (
                  <motion.div
                    key={item.href}
                    initial={reduce ? false : { opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 * i, duration: 0.28 }}
                  >
                    <Link
                      href={item.href}
                      onClick={() => setOpen(false)}
                      className={cn(
                        "flex items-center justify-between border-b border-white/10 py-4 text-[1.05rem] tracking-wide",
                        active ? "font-semibold" : "font-normal",
                      )}
                      style={{ color: active ? "#FF3F87" : "#FFFFFF" }}
                    >
                      <span>{item.label}</span>
                      {active && <span className="h-1.5 w-1.5 rounded-full bg-[#FF3F87]" />}
                    </Link>
                  </motion.div>
                );
              })}

              <motion.div
                className="mt-auto pb-8 pt-10"
                initial={reduce ? false : { opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.28 }}
              >
                <a
                  href={treatwellUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex min-h-12 w-full items-center justify-center rounded-md bg-[#ED2F78] px-5 text-base font-semibold"
                  style={{ color: "#FFFFFF" }}
                  onClick={() => {
                    trackTreatwellClick("header-mobile");
                    setOpen(false);
                  }}
                >
                  Κλείσε Ραντεβού
                </a>
              </motion.div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>,
      document.body,
    );

  return (
    <>
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-50 transition-colors duration-300",
          solid || open ? "bg-[#09090B]/95 shadow-lg" : "bg-transparent",
        )}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 md:px-6">
          <Link href="/" aria-label="Angel Nails αρχική">
            <BrandLogo size="sm" />
          </Link>

          <nav className="hidden items-center gap-7 lg:flex" aria-label="Κύρια πλοήγηση">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm font-medium tracking-wide transition hover:opacity-80"
                style={{ color: pathname === item.href ? "#FF3F87" : "#FFFFFF" }}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <a
              href={treatwellUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden min-h-10 items-center justify-center rounded-md bg-[#ED2F78] px-4 text-sm font-medium sm:inline-flex"
              style={{ color: "#FFFFFF" }}
              onClick={() => trackTreatwellClick("header")}
            >
              Κλείσε Ραντεβού
            </a>
            <button
              type="button"
              className="inline-flex h-11 w-11 items-center justify-center rounded-md lg:hidden"
              style={{ color: "#FFFFFF" }}
              aria-label={open ? "Κλείσιμο μενού" : "Άνοιγμα μενού"}
              aria-expanded={open}
              onClick={() => setOpen((v) => !v)}
            >
              {open ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </header>
      {mobileMenu}
    </>
  );
}
