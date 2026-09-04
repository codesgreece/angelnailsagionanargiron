import type { GalleryImage, LookbookSettings, Service } from "@prisma/client";

export type LookbookPage = {
  id: string;
  imageUrl: string;
  title: string;
  category: string;
  description: string | null;
  featured: boolean;
  order: number;
  altText: string | null;
  serviceName?: string | null;
  servicePrice?: string | null;
  serviceDuration?: string | null;
};

export type LookbookData = {
  settings: LookbookSettings;
  pages: LookbookPage[];
  treatwellUrl: string;
};

export function mapGalleryToLookbookPage(
  img: GalleryImage,
  service?: Service | null,
): LookbookPage {
  return {
    id: img.id,
    imageUrl: img.imageUrl,
    title: img.lookbookTitle || img.title || "Angel Nails Look",
    category: img.lookbookCategory || img.category || "Νύχια",
    description: img.lookbookDescription || img.description,
    featured: img.lookbookFeatured,
    order: img.lookbookOrder,
    altText: img.altText,
    serviceName: service?.name || null,
    servicePrice: service?.price != null ? String(service.price) : null,
    serviceDuration: service?.durationLabel || null,
  };
}
