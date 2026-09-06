import { prisma } from "@/lib/db";
import { cache } from "react";
import type {
  GalleryImage,
  OpeningHour,
  PageContent,
  SeoSettings,
  Service,
  ServiceCategory,
  SiteSettings,
  SocialLink,
  TeamMember,
} from "@prisma/client";
import {
  FALLBACK_FEATURED,
  FALLBACK_GALLERY,
  FALLBACK_PAGES,
  FALLBACK_SERVICES,
  FALLBACK_TEAM,
} from "@/lib/services/fallbacks";
import { sharpStoreImage } from "@/lib/images/sharp-store";

const defaultSettings = {
  id: "default",
  brandName: "Angel Nails",
  tagline: "ΜΑΝΙΚΙΟΥΡ • ΠΕΝΤΙΚΙΟΥΡ • ΤΕΧΝΗΤΑ ΝΥΧΙΑ",
  phonePrimary: "2102625122",
  phoneSecondary: "6948384776",
  email: "angelnails.ag@gmail.com",
  addressLine1: "Ηρώων Πολυτεχνείου 25",
  addressLine2: "Άγιοι Ανάργυροι",
  city: "Άγιοι Ανάργυροι",
  region: "Αττική",
  postalCode: "13561",
  country: "Greece",
  treatwellUrl: "https://www.treatwell.gr/katasthma/angel-nails-16/",
  mapEmbedUrl:
    "https://www.google.com/maps?q=%CE%97%CF%81%CF%8E%CF%89%CE%BD+%CE%A0%CE%BF%CE%BB%CF%85%CF%84%CE%B5%CF%87%CE%BD%CE%B5%CE%AF%CE%BF%CF%85+25,+%CE%86%CE%B3%CE%B9%CE%BF%CE%B9+%CE%91%CE%BD%CE%AC%CF%81%CE%B3%CF%85%CF%81%CE%BF%CE%B9&output=embed",
  latitude: 38.02831846,
  longitude: 23.71743857,
  logoUrl: null,
  faviconUrl: null,
  heroImageUrl: "/images/store/venue-1.jpg",
  primaryColor: "#09090B",
  secondaryColor: "#17171A",
  accentColor: "#ED2F78",
  brightPink: "#FF3F87",
  backgroundColor: "#FFFFFF",
  softWhite: "#F7F6F4",
  warmGrey: "#D8D5D2",
  marbleGrey: "#BDB9B6",
  textColor: "#09090B",
  fontDisplay: "Cormorant Garamond",
  fontSans: "DM Sans",
  analyticsId: null,
  analyticsEnabled: false,
  cookieBannerEnabled: true,
  updatedAt: new Date(),
} as SiteSettings;

const defaultSeo = {
  id: "default",
  siteTitle: "Angel Nails | Μανικιούρ & Πεντικιούρ στους Αγίους Αναργύρους",
  metaDescription:
    "Angel Nails στους Αγίους Αναργύρους. Μανικιούρ, πεντικιούρ, ημιμόνιμο, τεχνητά νύχια, nail care και υπηρεσίες ομορφιάς.",
  keywords: "Angel Nails, μανικιούρ, πεντικιούρ, Άγιοι Ανάργυροι",
  ogImageUrl: "/images/store/venue-1.jpg",
  twitterHandle: null,
  canonicalBase: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
  updatedAt: new Date(),
} as SeoSettings;

async function safe<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await fn();
  } catch {
    return fallback;
  }
}

export const getSiteSettings = cache(async () => {
  const settings = await safe(async () => {
    return (
      (await prisma.siteSettings.findUnique({ where: { id: "default" } })) ||
      (await prisma.siteSettings.create({ data: { id: "default" } }))
    );
  }, defaultSettings);

  return {
    ...settings,
    heroImageUrl: sharpStoreImage(settings.heroImageUrl, "/images/store/venue-1.jpg?v=3"),
  };
});

export const getSeoSettings = cache(async () => {
  return safe(async () => {
    return (
      (await prisma.seoSettings.findUnique({ where: { id: "default" } })) ||
      (await prisma.seoSettings.create({ data: { id: "default" } }))
    );
  }, defaultSeo);
});

export const getPageContentMap = cache(async () => {
  const pages = await safe(async () => {
    const rows = await prisma.pageContent.findMany();
    return Object.fromEntries(rows.map((p) => [p.key, p]));
  }, {} as Record<string, PageContent>);

  const merged = { ...FALLBACK_PAGES, ...pages } as Record<string, PageContent>;
  for (const key of Object.keys(merged)) {
    const page = merged[key];
    if (page?.imageUrl) {
      merged[key] = { ...page, imageUrl: sharpStoreImage(page.imageUrl, page.imageUrl) };
    }
  }
  return merged;
});

export const getOpeningHours = cache(async () => {
  return safe(
    () => prisma.openingHour.findMany({ orderBy: { dayOfWeek: "asc" } }),
    [] as OpeningHour[],
  );
});

export const getSocialLinks = cache(async () => {
  return safe(
    () =>
      prisma.socialLink.findMany({
        where: { active: true },
        orderBy: { displayOrder: "asc" },
      }),
    [] as SocialLink[],
  );
});

export const getActiveServices = cache(async () => {
  const rows = await safe(
    () =>
      prisma.service.findMany({
        where: { active: true, pendingData: false },
        include: { category: true },
        orderBy: [{ displayOrder: "asc" }, { name: "asc" }],
      }),
    [] as (Service & { category: ServiceCategory })[],
  );
  return rows.length > 0 ? rows : FALLBACK_SERVICES;
});

export const getFeaturedServices = cache(async () => {
  const rows = await safe(async () => {
    const featured = await prisma.service.findMany({
      where: { active: true, featured: true, pendingData: false },
      include: { category: true },
      orderBy: [{ displayOrder: "asc" }],
      take: 6,
    });
    if (featured.length > 0) return featured;
    return prisma.service.findMany({
      where: { active: true, pendingData: false },
      include: { category: true },
      orderBy: [{ displayOrder: "asc" }],
      take: 6,
    });
  }, [] as (Service & { category: ServiceCategory })[]);
  return rows.length > 0 ? rows : FALLBACK_FEATURED;
});

export const getCategories = cache(async () => {
  return safe(
    () =>
      prisma.serviceCategory.findMany({
        where: { active: true },
        orderBy: { displayOrder: "asc" },
      }),
    [] as ServiceCategory[],
  );
});

export const getGalleryImages = cache(async (opts?: { featuredOnly?: boolean }) => {
  const rows = await safe(
    () =>
      prisma.galleryImage.findMany({
        where: { active: true, ...(opts?.featuredOnly ? { featured: true } : {}) },
        orderBy: [{ displayOrder: "asc" }, { createdAt: "desc" }],
      }),
    [] as GalleryImage[],
  );
  const source = rows.length > 0 ? rows : opts?.featuredOnly ? FALLBACK_GALLERY.filter((g) => g.featured) : FALLBACK_GALLERY;
  return source.map((img) => ({
    ...img,
    imageUrl: sharpStoreImage(img.imageUrl, img.imageUrl),
  }));
});

export const getTeamMembers = cache(async () => {
  const rows = await safe(
    () =>
      prisma.teamMember.findMany({
        where: { active: true },
        orderBy: { displayOrder: "asc" },
      }),
    [] as TeamMember[],
  );
  return rows.length > 0 ? rows : FALLBACK_TEAM;
});

export const getLegalPage = cache(async (slug: string) => {
  return safe(() => prisma.legalPage.findUnique({ where: { slug } }), null);
});

export const getPageSeo = cache(async (path: string) => {
  return safe(() => prisma.pageSeo.findUnique({ where: { path } }), null);
});
