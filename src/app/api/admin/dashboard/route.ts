import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdminApi } from "@/lib/api";

export async function GET() {
  const { response } = await requireAdminApi();
  if (response) return response;

  const [
    totalServices,
    activeServices,
    featuredServices,
    galleryImages,
    teamMembers,
    recentAudits,
    siteViews,
  ] = await Promise.all([
    prisma.service.count(),
    prisma.service.count({ where: { active: true } }),
    prisma.service.count({ where: { featured: true, active: true } }),
    prisma.galleryImage.count({ where: { active: true } }),
    prisma.teamMember.count({ where: { active: true } }),
    prisma.auditLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 8,
      include: { user: true },
    }),
    prisma.siteView.count(),
  ]);

  return NextResponse.json({
    totalServices,
    activeServices,
    featuredServices,
    galleryImages,
    teamMembers,
    siteViews,
    recentAudits,
  });
}
