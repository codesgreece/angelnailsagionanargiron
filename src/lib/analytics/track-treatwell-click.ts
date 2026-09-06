"use client";

/** Fire-and-forget Treatwell CTA click → first-party analytics. */
export function trackTreatwellClick(source: string) {
  if (typeof window === "undefined") return;
  const path = window.location.pathname.slice(0, 200) || "/";
  const payload = JSON.stringify({
    source: String(source || "unknown").slice(0, 80),
    path,
  });

  try {
    if (typeof navigator !== "undefined" && typeof navigator.sendBeacon === "function") {
      const blob = new Blob([payload], { type: "application/json" });
      if (navigator.sendBeacon("/api/analytics/treatwell-click", blob)) return;
    }
  } catch {
    // fall through to fetch
  }

  fetch("/api/analytics/treatwell-click", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: payload,
    keepalive: true,
  }).catch(() => {});
}
