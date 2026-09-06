"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard,
  FileText,
  Scissors,
  Images,
  Users,
  Briefcase,
  Palette,
  Search,
  Scale,
  Settings,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  {
    label: "Content",
    icon: FileText,
    children: [
      { href: "/admin/content/homepage", label: "Homepage" },
      { href: "/admin/content/about", label: "About" },
      { href: "/admin/content/contact", label: "Contact" },
      { href: "/admin/content/footer", label: "Footer" },
      { href: "/admin/content/promo-popup", label: "Promo Popup" },
    ],
  },
  {
    label: "Services",
    icon: Scissors,
    children: [
      { href: "/admin/services", label: "All Services" },
      { href: "/admin/categories", label: "Categories" },
      { href: "/admin/services/featured", label: "Featured" },
    ],
  },
  {
    label: "Gallery",
    icon: Images,
    children: [
      { href: "/admin/gallery", label: "All Images" },
      { href: "/admin/gallery/upload", label: "Upload" },
    ],
  },
  { href: "/admin/team", label: "Team", icon: Users },
  {
    label: "Business",
    icon: Briefcase,
    children: [
      { href: "/admin/business/hours", label: "Opening Hours" },
      { href: "/admin/business/contact", label: "Contact Info" },
      { href: "/admin/business/social", label: "Social Links" },
      { href: "/admin/business/treatwell", label: "Treatwell URL" },
    ],
  },
  {
    label: "Appearance",
    icon: Palette,
    children: [
      { href: "/admin/appearance", label: "Brand & Colors" },
      { href: "/admin/appearance/logo", label: "Logo / Hero" },
      { href: "/admin/appearance/intro", label: "Intro Animation" },
    ],
  },
  { href: "/admin/seo", label: "SEO", icon: Search },
  {
    label: "Legal",
    icon: Scale,
    children: [
      { href: "/admin/legal/privacy-policy", label: "Privacy Policy" },
      { href: "/admin/legal/terms", label: "Terms" },
      { href: "/admin/legal/cookies", label: "Cookies" },
    ],
  },
  {
    label: "Settings",
    icon: Settings,
    children: [
      { href: "/admin/settings", label: "General" },
      { href: "/admin/settings/account", label: "Admin user" },
    ],
  },
];

export function AdminSidebar({ userName }: { userName: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  const NavBody = (
    <div className="flex h-full flex-col">
      <div className="border-b border-white/10 px-4 py-5">
        <p
          className="text-2xl text-[#FF3F87]"
          style={{ fontFamily: "var(--font-script), cursive" }}
        >
          Angel Nails
        </p>
        <p className="mt-1 text-xs text-white/50">Admin Panel</p>
      </div>
      <nav className="flex-1 space-y-4 overflow-y-auto px-3 py-4 text-sm">
        {NAV.map((item) => {
          if ("children" in item && item.children) {
            return (
              <div key={item.label}>
                <p className="mb-1 flex items-center gap-2 px-2 text-[11px] uppercase tracking-[0.16em] text-white/40">
                  <item.icon size={14} /> {item.label}
                </p>
                <div className="space-y-0.5">
                  {item.children.map((child) => (
                    <Link
                      key={child.href}
                      href={child.href}
                      onClick={() => setOpen(false)}
                      className={cn(
                        "block rounded-md px-3 py-2 text-white/70 hover:bg-white/5 hover:text-white",
                        pathname === child.href && "bg-white/10 text-white",
                      )}
                    >
                      {child.label}
                    </Link>
                  ))}
                </div>
              </div>
            );
          }
          return (
            <Link
              key={item.href}
              href={item.href!}
              onClick={() => setOpen(false)}
              className={cn(
                "flex items-center gap-2 rounded-md px-3 py-2 text-white/70 hover:bg-white/5 hover:text-white",
                pathname === item.href && "bg-white/10 text-white",
              )}
            >
              <item.icon size={16} />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-white/10 p-4">
        <p className="truncate text-xs text-white/50">{userName}</p>
        <button
          type="button"
          onClick={logout}
          className="mt-2 inline-flex items-center gap-2 text-sm text-white/70 hover:text-white"
        >
          <LogOut size={14} /> Αποσύνδεση
        </button>
      </div>
    </div>
  );

  return (
    <>
      <button
        type="button"
        className="fixed left-3 top-3 z-50 rounded-md bg-[#17171A] p-2 text-white lg:hidden"
        onClick={() => setOpen(true)}
        aria-label="Άνοιγμα μενού"
      >
        <Menu size={18} />
      </button>
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 bg-[#0B0B0D] text-white lg:block">
        {NavBody}
      </aside>
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-72 bg-[#0B0B0D]">
            <button
              type="button"
              className="absolute right-3 top-3 text-white"
              onClick={() => setOpen(false)}
              aria-label="Κλείσιμο"
            >
              <X size={18} />
            </button>
            {NavBody}
          </aside>
        </div>
      )}
    </>
  );
}
