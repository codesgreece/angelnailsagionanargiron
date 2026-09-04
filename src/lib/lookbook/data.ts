import { prisma } from "@/lib/db";
import { cache } from "react";
import { mapGalleryToLookbookPage, type LookbookData } from "@/lib/lookbook/types";
import { FALLBACK_GALLERY } from "@/lib/services/fallbacks";

const defaultLookbookSettings = {
  id: "default",
  title: "THE ANGEL NAILS BOOK",
  subtitle: "NAIL LOOKS • DETAILS • INSPIRATION",
  coverImageUrl: "/images/store/venue-1.png",
  coverLogoUrl: null,
  coverBackground: "#09090B",
  accentColor: "#ED2F78",
  homepageEnabled: true,
  homepageBlurb: "Μια ματιά στα looks που δημιουργούμε.",
  updatedAt: new Date(),
};

export const getLookbookSettings = cache(async () => {
  try {
    return (
      (await prisma.lookbookSettings.findUnique({ where: { id: "default" } })) ||
      (await prisma.lookbookSettings.create({ data: { id: "default" } }))
    );
  } catch {
    return defaultLookbookSettings;
  }
});

export const getLookbookPages = cache(async () => {
  try {
    const rows = await prisma.galleryImage.findMany({
      where: { active: true, lookbookEnabled: true },
      orderBy: [{ lookbookOrder: "asc" }, { createdAt: "asc" }],
    });
    if (rows.length > 0) {
      const serviceIds = [...new Set(rows.map((r) => r.serviceId).filter(Boolean))] as string[];
      const services =
        serviceIds.length > 0
          ? await prisma.service.findMany({ where: { id: { in: serviceIds } } })
          : [];
      const byId = new Map(services.map((s) => [s.id, s]));
      return rows.map((r) =>
        mapGalleryToLookbookPage(r, r.serviceId ? byId.get(r.serviceId) : null),
      );
    }
  } catch {
    // fall through
  }

  return FALLBACK_GALLERY.map((g, i) =>
    mapGalleryToLookbookPage({
      ...g,
      lookbookEnabled: true,
      lookbookOrder: i,
      lookbookTitle: g.title,
      lookbookDescription: "Angel Nails lookbook",
      lookbookCategory: g.category,
      lookbookFeatured: g.featured,
      serviceId: null,
    }),
  );
});

export const getLookbookData = cache(async (): Promise<LookbookData> => {
  const [settings, pages, site] = await Promise.all([
    getLookbookSettings(),
    getLookbookPages(),
    prisma.siteSettings.findUnique({ where: { id: "default" } }).catch(() => null),
  ]);

  return {
    settings,
    pages,
    treatwellUrl:
      site?.treatwellUrl || "https://www.treatwell.gr/katasthma/angel-nails-16/",
  };
});
