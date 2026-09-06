/** Normalize legacy/low-res store photo paths to sharp cache-busted assets. */
export function sharpStoreImage(url?: string | null, fallback = "/images/store/venue-1-v3.jpg"): string {
  if (!url) return fallback;
  const clean = url.split("?")[0];
  if (clean.includes("venue-1")) return "/images/store/venue-1-v3.jpg";
  if (clean.includes("venue-2")) return "/images/store/venue-2-v3.jpg";
  if (clean.includes("venue-3")) return "/images/store/venue-3-v3.jpg";
  if (clean.includes("venue-4")) return "/images/store/venue-4-v3.jpg";
  return url;
}
