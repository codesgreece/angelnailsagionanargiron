import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireAdminApi, jsonError } from "@/lib/api";
import { writeAuditLog } from "@/lib/auth/audit";

const lookbookItemSchema = z.object({
  id: z.string(),
  lookbookEnabled: z.boolean().optional(),
  lookbookOrder: z.number().int().optional(),
  lookbookTitle: z.string().max(200).nullable().optional(),
  lookbookDescription: z.string().max(2000).nullable().optional(),
  lookbookCategory: z.string().max(100).nullable().optional(),
  lookbookFeatured: z.boolean().optional(),
});

const settingsSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  subtitle: z.string().max(300).optional(),
  coverImageUrl: z.string().max(1000).nullable().optional(),
  coverLogoUrl: z.string().max(1000).nullable().optional(),
  coverBackground: z.string().max(30).optional(),
  accentColor: z.string().max(30).optional(),
  homepageEnabled: z.boolean().optional(),
  homepageBlurb: z.string().max(500).optional(),
});

export async function GET() {
  const { response } = await requireAdminApi();
  if (response) return response;

  const [settings, images] = await Promise.all([
    prisma.lookbookSettings.upsert({
      where: { id: "default" },
      update: {},
      create: { id: "default" },
    }),
    prisma.galleryImage.findMany({
      where: { active: true },
      orderBy: [{ lookbookOrder: "asc" }, { displayOrder: "asc" }, { createdAt: "desc" }],
    }),
  ]);

  return NextResponse.json({ settings, images });
}

export async function PATCH(req: NextRequest) {
  const { user, response } = await requireAdminApi();
  if (response) return response;

  const body = await req.json();
  const section = body.section as string;

  if (section === "settings") {
    const parsed = settingsSchema.safeParse(body.data);
    if (!parsed.success) return jsonError("Μη έγκυρα lookbook settings");
    const cleaned = Object.fromEntries(
      Object.entries(parsed.data).map(([k, v]) => [k, v === null ? null : v]),
    );
    const updated = await prisma.lookbookSettings.upsert({
      where: { id: "default" },
      update: cleaned,
      create: { id: "default", ...cleaned },
    });
    await writeAuditLog({
      userId: user!.id,
      action: "update",
      entity: "LookbookSettings",
      entityId: "default",
    });
    return NextResponse.json(updated);
  }

  if (section === "item") {
    const parsed = lookbookItemSchema.safeParse(body.data);
    if (!parsed.success) return jsonError("Μη έγκυρα δεδομένα");
    const { id, ...rest } = parsed.data;
    const updated = await prisma.galleryImage.update({
      where: { id },
      data: rest,
    });
    await writeAuditLog({
      userId: user!.id,
      action: "update",
      entity: "LookbookItem",
      entityId: id,
      details: rest,
    });
    return NextResponse.json(updated);
  }

  if (section === "reorder") {
    const ids = z.array(z.string()).safeParse(body.data?.ids);
    if (!ids.success) return jsonError("Μη έγκυρη σειρά");
    await prisma.$transaction(
      ids.data.map((id, order) =>
        prisma.galleryImage.update({
          where: { id },
          data: { lookbookOrder: order, lookbookEnabled: true },
        }),
      ),
    );
    await writeAuditLog({
      userId: user!.id,
      action: "reorder",
      entity: "Lookbook",
      details: { count: ids.data.length },
    });
    return NextResponse.json({ ok: true });
  }

  return jsonError("Άγνωστο section");
}
