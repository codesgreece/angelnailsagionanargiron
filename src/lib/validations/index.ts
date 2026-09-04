import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(128),
});

export const serviceSchema = z.object({
  name: z.string().min(1).max(200),
  slug: z.string().min(1).max(200).optional(),
  categoryId: z.string().min(1),
  description: z.string().max(5000).optional().nullable(),
  price: z.union([z.number(), z.string(), z.null()]).optional().nullable(),
  priceFrom: z.boolean().optional(),
  durationMin: z.number().int().min(0).optional().nullable(),
  durationMax: z.number().int().min(0).optional().nullable(),
  durationLabel: z.string().max(100).optional().nullable(),
  featured: z.boolean().optional(),
  active: z.boolean().optional(),
  pendingData: z.boolean().optional(),
  displayOrder: z.number().int().optional(),
  imageUrl: z.string().max(1000).optional().nullable(),
});

export const categorySchema = z.object({
  name: z.string().min(1).max(200),
  slug: z.string().min(1).max(200).optional(),
  description: z.string().max(2000).optional().nullable(),
  filterGroup: z.string().max(100).optional().nullable(),
  displayOrder: z.number().int().optional(),
  active: z.boolean().optional(),
});

export const gallerySchema = z.object({
  title: z.string().max(200).optional().nullable(),
  category: z.string().min(1).max(100),
  description: z.string().max(2000).optional().nullable(),
  altText: z.string().max(300).optional().nullable(),
  imageUrl: z.string().min(1).max(1000),
  featured: z.boolean().optional(),
  active: z.boolean().optional(),
  displayOrder: z.number().int().optional(),
});

export const teamSchema = z.object({
  name: z.string().min(1).max(120),
  role: z.string().max(200).optional().nullable(),
  services: z.string().max(500).optional().nullable(),
  bio: z.string().max(3000).optional().nullable(),
  photoUrl: z.string().max(1000).optional().nullable(),
  displayOrder: z.number().int().optional(),
  active: z.boolean().optional(),
});

export const openingHourSchema = z.object({
  dayOfWeek: z.number().int().min(0).max(6),
  dayNameEl: z.string().min(1),
  openTime: z.string().nullable().optional(),
  closeTime: z.string().nullable().optional(),
  closed: z.boolean(),
});

export const socialLinkSchema = z.object({
  platform: z.string().min(1).max(50),
  label: z.string().min(1).max(100),
  url: z.string().url().max(500),
  active: z.boolean().optional(),
  displayOrder: z.number().int().optional(),
});

export const siteSettingsSchema = z.object({
  brandName: z.string().min(1).max(100).optional(),
  tagline: z.string().max(300).optional(),
  phonePrimary: z.string().max(40).optional(),
  phoneSecondary: z.string().max(40).optional().nullable(),
  email: z.string().email().optional(),
  addressLine1: z.string().max(200).optional(),
  addressLine2: z.string().max(200).optional().nullable(),
  city: z.string().max(100).optional(),
  region: z.string().max(100).optional(),
  postalCode: z.string().max(20).optional(),
  country: z.string().max(100).optional(),
  treatwellUrl: z.string().url().optional(),
  mapEmbedUrl: z.string().max(2000).optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  logoUrl: z.string().max(1000).optional().nullable(),
  faviconUrl: z.string().max(1000).optional().nullable(),
  heroImageUrl: z.string().max(1000).optional().nullable(),
  primaryColor: z.string().max(20).optional(),
  secondaryColor: z.string().max(20).optional(),
  accentColor: z.string().max(20).optional(),
  brightPink: z.string().max(20).optional(),
  backgroundColor: z.string().max(20).optional(),
  softWhite: z.string().max(20).optional(),
  warmGrey: z.string().max(20).optional(),
  marbleGrey: z.string().max(20).optional(),
  textColor: z.string().max(20).optional(),
  fontDisplay: z.string().max(100).optional(),
  fontSans: z.string().max(100).optional(),
  analyticsId: z.string().max(100).optional().nullable(),
  analyticsEnabled: z.boolean().optional(),
  cookieBannerEnabled: z.boolean().optional(),
});

export const pageContentSchema = z.object({
  key: z.string().min(1).max(100),
  title: z.string().max(300).optional().nullable(),
  subtitle: z.string().max(500).optional().nullable(),
  body: z.string().max(20000).optional().nullable(),
  ctaLabel: z.string().max(100).optional().nullable(),
  ctaHref: z.string().max(1000).optional().nullable(),
  imageUrl: z.string().max(1000).optional().nullable(),
  extraJson: z.string().max(20000).optional().nullable(),
});

export const seoSettingsSchema = z.object({
  siteTitle: z.string().min(1).max(200).optional(),
  metaDescription: z.string().max(500).optional(),
  keywords: z.string().max(500).optional(),
  ogImageUrl: z.string().max(1000).optional().nullable(),
  twitterHandle: z.string().max(100).optional().nullable(),
  canonicalBase: z.string().url().optional(),
});

export const legalPageSchema = z.object({
  slug: z.string().min(1).max(100),
  title: z.string().min(1).max(200),
  content: z.string().min(1).max(100000),
});

export const adminUserUpdateSchema = z.object({
  name: z.string().min(1).max(120).optional(),
  email: z.string().email().optional(),
  currentPassword: z.string().min(8).max(128).optional(),
  newPassword: z.string().min(8).max(128).optional(),
});
