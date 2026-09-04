"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { BrandLogo } from "@/components/public/brand-logo";
import { ButtonLink } from "@/components/ui/button-link";
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
            initial={reduce ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
          >
            <div className="flex items-center justify-between px-4 py-3">
              <Link href="/" aria-label="Angel Nails αρχική" onClick={() => setOpen(false)}>
                <BrandLogo size="sm" />
              </Link>
              <button
                type="button"
                className="inline-flex h-11 w-11 items-center justify-center rounded-md text-white"
                aria-label="Κλείσιμο μενού"
                onClick={() => setOpen(false)}
              >
                <X size={24} />
              </button>
            </div>

            <nav className="flex flex-1 flex-col gap-2 overflow-y-auto px-4 pb-6 pt-4" aria-label="Mobile">
              {NAV.map((item, i) => (
                <motion.div
                  key={item.href}
                  initial={reduce ? false : { opacity: 0, x: -18 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.04 * i, duration: 0.28 }}
                >
                  <Link
                    href={item.href}
                    className={cn(
                      "block rounded-lg px-4 py-4 text-xl font-semibold text-white",
                      pathname === item.href ? "bg-[#ED2F78]" : "bg-white/5 hover:bg-white/10",
                    )}
                    onClick={() => setOpen(false)}
                  >
                    {item.label}
                  </Link>
                </motion.div>
              ))}
              <motion.div
                className="mt-auto pt-8"
                initial={reduce ? false : { opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.24 }}
              >
                <ButtonLink href={treatwellUrl} external className="w-full" size="lg">
                  Κλείσε Ραντεβού
                </ButtonLink>
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
                className={cn(
                  "text-sm font-medium tracking-wide text-white transition hover:text-[#FF3F87]",
                  pathname === item.href && "text-[#FF3F87]",
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <ButtonLink href={treatwellUrl} external size="sm" className="hidden sm:inline-flex">
              Κλείσε Ραντεβού
            </ButtonLink>
            <button
              type="button"
              className="inline-flex h-11 w-11 items-center justify-center rounded-md text-white lg:hidden"
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
