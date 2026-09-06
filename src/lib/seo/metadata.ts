import type { SeoSettings, SiteSettings } from "@prisma/client";
import { absoluteUrl } from "@/lib/utils";

export function buildMetadata(params: {
  title?: string | null;
  description?: string | null;
  path?: string;
  ogImage?: string | null;
  seo?: SeoSettings | null;
  noIndex?: boolean;
}) {
  const title = params.title || params.seo?.siteTitle || "Angel Nails";
  const description =
    params.description ||
    params.seo?.metaDescription ||
    "Angel Nails στους Αγίους Αναργύρους.";
  const url = absoluteUrl(params.path || "/");
  const og = params.ogImage || params.seo?.ogImageUrl || "/images/store/venue-1.jpg";

  return {
    title,
    description,
    keywords: params.seo?.keywords?.split(",").map((k) => k.trim()),
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      siteName: "Angel Nails",
      locale: "el_GR",
      type: "website",
      images: [{ url: og.startsWith("http") ? og : absoluteUrl(og) }],
    },
    twitter: {
      card: "summary_large_image" as const,
      title,
      description,
      images: [og.startsWith("http") ? og : absoluteUrl(og)],
    },
    robots: params.noIndex ? { index: false, follow: false } : { index: true, follow: true },
  };
}

export function localBusinessJsonLd(settings: SiteSettings) {
  return {
    "@context": "https://schema.org",
    "@type": "BeautySalon",
    name: settings.brandName,
    image: settings.heroImageUrl
      ? absoluteUrl(settings.heroImageUrl)
      : absoluteUrl("/images/store/venue-1.jpg"),
    url: absoluteUrl("/"),
    telephone: settings.phonePrimary,
    email: settings.email,
    address: {
      "@type": "PostalAddress",
      streetAddress: settings.addressLine1,
      addressLocality: settings.city,
      addressRegion: settings.region,
      postalCode: settings.postalCode,
      addressCountry: "GR",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: settings.latitude,
      longitude: settings.longitude,
    },
    sameAs: [settings.treatwellUrl].filter(Boolean),
    priceRange: "€€",
  };
}
