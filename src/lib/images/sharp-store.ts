/** Normalize legacy/low-res store photo paths to sharp cache-busted assets. */
export function sharpStoreImage(url?: string | null, fallback = "/images/store/venue-1-v4.jpg"): string {
  if (!url) return fallback;
  const clean = url.split("?")[0];
  if (clean.includes("venue-1")) return "/images/store/venue-1-v4.jpg";
  if (clean.includes("venue-2")) return "/images/store/venue-2-v4.jpg";
  if (clean.includes("venue-3")) return "/images/store/venue-3-v4.jpg";
  if (clean.includes("venue-4")) return "/images/store/venue-4-v4.jpg";
  return url;
}

/** True when the URL is a local store photo that should skip Next image re-encoding. */
export function isStorePhoto(url?: string | null): boolean {
  if (!url) return false;
  return url.includes("/images/store/");
}
