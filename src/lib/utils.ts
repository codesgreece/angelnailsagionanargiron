import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import slugifyLib from "slugify";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function slugify(text: string) {
  return slugifyLib(text, { lower: true, strict: true, locale: "el" });
}

export function formatPrice(price: number | string | null | undefined, priceFrom = false) {
  if (price === null || price === undefined || price === "") return "Κατόπιν συνεννόησης";
  const n = typeof price === "string" ? Number(price) : price;
  if (Number.isNaN(n)) return "Κατόπιν συνεννόησης";
  const formatted = new Intl.NumberFormat("el-GR", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: n % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(n);
  return priceFrom ? `από ${formatted}` : formatted;
}

export function formatDuration(min?: number | null, max?: number | null, label?: string | null) {
  if (label) return label;
  if (!min && !max) return null;
  const fmt = (m: number) => {
    if (m < 60) return `${m} λεπτά`;
    const h = Math.floor(m / 60);
    const r = m % 60;
    if (r === 0) return h === 1 ? "1 ώρα" : `${h} ώρες`;
    return h === 1 ? `1 ώρα ${r} λεπτά` : `${h} ώρες ${r} λεπτά`;
  };
  if (min && max && min !== max) return `${fmt(min)} – ${fmt(max)}`;
  return fmt(min || max || 0);
}

export function absoluteUrl(path = "/") {
  const envBase = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  const vercelProd = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim();
  const vercelUrl = process.env.VERCEL_URL?.trim();
  const base =
    envBase ||
    (vercelProd ? `https://${vercelProd}` : null) ||
    (vercelUrl ? `https://${vercelUrl}` : null) ||
    "http://localhost:3000";
  return `${base.replace(/\/$/, "")}${path.startsWith("/") ? path : `/${path}`}`;
}

export function whatsappUrl(phone: string, text?: string) {
  const digits = phone.replace(/\D/g, "");
  const intl = digits.startsWith("30") ? digits : `30${digits}`;
  const q = text ? `?text=${encodeURIComponent(text)}` : "";
  return `https://wa.me/${intl}${q}`;
}
