import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireAdminApi, jsonError } from "@/lib/api";
import { writeAuditLog } from "@/lib/auth/audit";

const schema = z.object({
  enabled: z.boolean().optional(),
  frequency: z.enum(["always", "once"]).optional(),
  eyebrow: z.string().min(1).max(80).optional(),
  title: z.string().min(1).max(160).optional(),
  body: z.string().min(1).max(600).optional(),
  ctaLabel: z.string().min(1).max(80).optional(),
  ctaUrl: z.string().max(1000).nullable().optional(),
  imageUrl: z.string().max(1000).nullable().optional(),
  delayMs: z.number().int().min(0).max(10000).optional(),
});

export async function GET() {
  const { response } = await requireAdminApi();
  if (response) return response;
  const settings = await prisma.promoPopupSettings.upsert({
    where: { id: "default" },
    update: {},
    create: { id: "default" },
  });
  return NextResponse.json(settings);
}

export async function PATCH(req: NextRequest) {
  const { user, response } = await requireAdminApi();
  if (response) return response;
  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return jsonError("Μη έγκυρα promo popup settings");

  const data = {
    ...parsed.data,
    ctaUrl: parsed.data.ctaUrl === "" ? null : parsed.data.ctaUrl,
    imageUrl: parsed.data.imageUrl === "" ? null : parsed.data.imageUrl,
  };

  const updated = await prisma.promoPopupSettings.upsert({
    where: { id: "default" },
    update: data,
    create: { id: "default", ...data },
  });

  await writeAuditLog({
    userId: user!.id,
    action: "update",
    entity: "PromoPopupSettings",
    entityId: "default",
    details: data,
  });

  return NextResponse.json(updated);
}
