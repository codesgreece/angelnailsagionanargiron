import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/utils";

export default function sitemap(): MetadataRoute.Sitemap {
  const paths = ["/", "/services", "/gallery", "/about", "/contact", "/privacy-policy", "/privacy", "/terms", "/cookies"];
  const now = new Date();
  return paths.map((path) => ({
    url: absoluteUrl(path),
    lastModified: now,
    changeFrequency: path === "/" ? "weekly" : "monthly",
    priority: path === "/" ? 1 : 0.7,
  }));
}
