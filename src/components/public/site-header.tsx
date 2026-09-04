"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
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

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-300",
        scrolled || open ? "bg-[var(--brand-black)]/95 backdrop-blur-md shadow-lg" : "bg-transparent",
      )}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 md:px-6">
        <Link href="/" aria-label="Angel Nails αρχική">
          <BrandLogo size="sm" inverted />
        </Link>

        <nav className="hidden items-center gap-7 lg:flex" aria-label="Κύρια πλοήγηση">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "text-sm tracking-wide text-white/75 transition hover:text-white",
                pathname === item.href && "text-white",
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
            className="inline-flex h-10 w-10 items-center justify-center rounded-md text-white lg:hidden"
            aria-label={open ? "Κλείσιμο μενού" : "Άνοιγμα μενού"}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-white/10 bg-[var(--brand-black)] px-4 py-4 lg:hidden">
          <nav className="flex flex-col gap-1" aria-label="Mobile">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "rounded-md px-3 py-3 text-base text-white/80",
                  pathname === item.href && "bg-white/5 text-white",
                )}
              >
                {item.label}
              </Link>
            ))}
            <ButtonLink href={treatwellUrl} external className="mt-3 w-full">
              Κλείσε Ραντεβού
            </ButtonLink>
          </nav>
        </div>
      )}
    </header>
  );
}
