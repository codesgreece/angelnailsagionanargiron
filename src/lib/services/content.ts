import { prisma } from "@/lib/db";
import { cache } from "react";

export const getSiteSettings = cache(async () => {
  return (
    (await prisma.siteSettings.findUnique({ where: { id: "default" } })) ||
    (await prisma.siteSettings.create({ data: { id: "default" } }))
  );
});

export const getSeoSettings = cache(async () => {
  return (
    (await prisma.seoSettings.findUnique({ where: { id: "default" } })) ||
    (await prisma.seoSettings.create({ data: { id: "default" } }))
  );
});

export const getPageContentMap = cache(async () => {
  const pages = await prisma.pageContent.findMany();
  return Object.fromEntries(pages.map((p) => [p.key, p]));
});

export const getOpeningHours = cache(async () => {
  return prisma.openingHour.findMany({ orderBy: { dayOfWeek: "asc" } });
});

export const getSocialLinks = cache(async () => {
  return prisma.socialLink.findMany({
    where: { active: true },
    orderBy: { displayOrder: "asc" },
  });
});

export const getActiveServices = cache(async () => {
  return prisma.service.findMany({
    where: { active: true, pendingData: false },
    include: { category: true },
    orderBy: [{ displayOrder: "asc" }, { name: "asc" }],
  });
});

export const getFeaturedServices = cache(async () => {
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
});

export const getCategories = cache(async () => {
  return prisma.serviceCategory.findMany({
    where: { active: true },
    orderBy: { displayOrder: "asc" },
  });
});

export const getGalleryImages = cache(async (opts?: { featuredOnly?: boolean }) => {
  return prisma.galleryImage.findMany({
    where: { active: true, ...(opts?.featuredOnly ? { featured: true } : {}) },
    orderBy: [{ displayOrder: "asc" }, { createdAt: "desc" }],
  });
});

export const getTeamMembers = cache(async () => {
  return prisma.teamMember.findMany({
    where: { active: true },
    orderBy: { displayOrder: "asc" },
  });
});

export const getLegalPage = cache(async (slug: string) => {
  return prisma.legalPage.findUnique({ where: { slug } });
});

export const getPageSeo = cache(async (path: string) => {
  return prisma.pageSeo.findUnique({ where: { path } });
});
