import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdminApi, jsonError } from "@/lib/api";
import {
  openingHourSchema,
  pageContentSchema,
  seoSettingsSchema,
  siteSettingsSchema,
  socialLinkSchema,
  legalPageSchema,
  adminUserUpdateSchema,
} from "@/lib/validations";
import { writeAuditLog } from "@/lib/auth/audit";
import { hashPassword, verifyPassword } from "@/lib/auth/session";
import { z } from "zod";

export async function GET() {
  const { response } = await requireAdminApi();
  if (response) return response;
  const [settings, seo, hours, socials, pages, legal, audits] = await Promise.all([
    prisma.siteSettings.findUnique({ where: { id: "default" } }),
    prisma.seoSettings.findUnique({ where: { id: "default" } }),
    prisma.openingHour.findMany({ orderBy: { dayOfWeek: "asc" } }),
    prisma.socialLink.findMany({ orderBy: { displayOrder: "asc" } }),
    prisma.pageContent.findMany({ orderBy: { key: "asc" } }),
    prisma.legalPage.findMany({ orderBy: { slug: "asc" } }),
    prisma.auditLog.findMany({ orderBy: { createdAt: "desc" }, take: 20, include: { user: true } }),
  ]);
  return NextResponse.json({ settings, seo, hours, socials, pages, legal, audits });
}

export async function PATCH(req: NextRequest) {
  const { user, response } = await requireAdminApi();
  if (response) return response;
  const body = await req.json();
  const section = body.section as string;

  if (section === "settings") {
    const parsed = siteSettingsSchema.safeParse(body.data);
    if (!parsed.success) return jsonError("Μη έγκυρα settings");
    const cleaned = Object.fromEntries(
      Object.entries(parsed.data).map(([k, v]) => [k, v === null ? undefined : v]),
    );
    const updated = await prisma.siteSettings.upsert({
      where: { id: "default" },
      update: cleaned,
      create: { id: "default", ...cleaned },
    });
    await writeAuditLog({
      userId: user!.id,
      action: "update",
      entity: "SiteSettings",
      entityId: "default",
      details: parsed.data,
    });
    return NextResponse.json(updated);
  }

  if (section === "seo") {
    const parsed = seoSettingsSchema.safeParse(body.data);
    if (!parsed.success) return jsonError("Μη έγκυρα SEO");
    const updated = await prisma.seoSettings.upsert({
      where: { id: "default" },
      update: parsed.data,
      create: { id: "default", ...parsed.data },
    });
    await writeAuditLog({
      userId: user!.id,
      action: "update",
      entity: "SeoSettings",
      entityId: "default",
    });
    return NextResponse.json(updated);
  }

  if (section === "hours") {
    const parsed = z.array(openingHourSchema).safeParse(body.data);
    if (!parsed.success) return jsonError("Μη έγκυρα ωράρια");
    for (const h of parsed.data) {
      await prisma.openingHour.upsert({
        where: { dayOfWeek: h.dayOfWeek },
        update: h,
        create: h,
      });
    }
    await writeAuditLog({
      userId: user!.id,
      action: "update",
      entity: "OpeningHour",
      details: { count: parsed.data.length },
    });
    return NextResponse.json({ ok: true });
  }

  if (section === "page") {
    const parsed = pageContentSchema.safeParse(body.data);
    if (!parsed.success) return jsonError("Μη έγκυρο περιεχόμενο");
    const updated = await prisma.pageContent.upsert({
      where: { key: parsed.data.key },
      update: parsed.data,
      create: parsed.data,
    });
    await writeAuditLog({
      userId: user!.id,
      action: "update",
      entity: "PageContent",
      entityId: updated.id,
      details: { key: updated.key },
    });
    return NextResponse.json(updated);
  }

  if (section === "legal") {
    const parsed = legalPageSchema.safeParse(body.data);
    if (!parsed.success) return jsonError("Μη έγκυρο legal");
    const updated = await prisma.legalPage.upsert({
      where: { slug: parsed.data.slug },
      update: parsed.data,
      create: parsed.data,
    });
    await writeAuditLog({
      userId: user!.id,
      action: "update",
      entity: "LegalPage",
      entityId: updated.id,
    });
    return NextResponse.json(updated);
  }

  if (section === "social-create") {
    const parsed = socialLinkSchema.safeParse(body.data);
    if (!parsed.success) return jsonError("Μη έγκυρο social link");
    const created = await prisma.socialLink.create({
      data: {
        ...parsed.data,
        active: parsed.data.active ?? true,
        displayOrder: parsed.data.displayOrder ?? 0,
      },
    });
    await writeAuditLog({
      userId: user!.id,
      action: "create",
      entity: "SocialLink",
      entityId: created.id,
    });
    return NextResponse.json(created, { status: 201 });
  }

  if (section === "social-delete") {
    const id = body.data?.id as string;
    if (!id) return jsonError("Missing id");
    await prisma.socialLink.delete({ where: { id } });
    await writeAuditLog({
      userId: user!.id,
      action: "delete",
      entity: "SocialLink",
      entityId: id,
    });
    return NextResponse.json({ ok: true });
  }

  if (section === "admin-user") {
    const parsed = adminUserUpdateSchema.safeParse(body.data);
    if (!parsed.success) return jsonError("Μη έγκυρα στοιχεία χρήστη");
    const current = await prisma.adminUser.findUnique({ where: { id: user!.id } });
    if (!current) return jsonError("User not found", 404);
    const update: { name?: string; email?: string; passwordHash?: string } = {};
    if (parsed.data.name) update.name = parsed.data.name;
    if (parsed.data.email) update.email = parsed.data.email.toLowerCase();
    if (parsed.data.newPassword) {
      if (!parsed.data.currentPassword) return jsonError("Απαιτείται τρέχων κωδικός");
      const ok = await verifyPassword(parsed.data.currentPassword, current.passwordHash);
      if (!ok) return jsonError("Λάθος τρέχων κωδικός", 401);
      update.passwordHash = await hashPassword(parsed.data.newPassword);
    }
    const updated = await prisma.adminUser.update({ where: { id: user!.id }, data: update });
    await writeAuditLog({
      userId: user!.id,
      action: "update",
      entity: "AdminUser",
      entityId: user!.id,
    });
    return NextResponse.json({ id: updated.id, email: updated.email, name: updated.name });
  }

  return jsonError("Άγνωστο section");
}
