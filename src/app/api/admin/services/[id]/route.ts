import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdminApi, jsonError, parseDecimal } from "@/lib/api";
import { serviceSchema } from "@/lib/validations";
import { writeAuditLog } from "@/lib/auth/audit";
import { slugify } from "@/lib/utils";
import { Prisma } from "@prisma/client";

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, ctx: Ctx) {
  const { user, response } = await requireAdminApi();
  if (response) return response;
  const { id } = await ctx.params;
  const body = await req.json();
  const parsed = serviceSchema.partial().safeParse(body);
  if (!parsed.success) return jsonError("Μη έγκυρα δεδομένα");

  const data = parsed.data;
  const price = data.price !== undefined ? parseDecimal(data.price) : undefined;

  const updated = await prisma.service.update({
    where: { id },
    data: {
      ...(data.name !== undefined ? { name: data.name } : {}),
      ...(data.slug || data.name
        ? { slug: data.slug || (data.name ? slugify(data.name) : undefined) }
        : {}),
      ...(data.categoryId !== undefined ? { categoryId: data.categoryId } : {}),
      ...(data.description !== undefined ? { description: data.description } : {}),
      ...(price !== undefined
        ? { price: price === null ? null : new Prisma.Decimal(price) }
        : {}),
      ...(data.priceFrom !== undefined ? { priceFrom: data.priceFrom } : {}),
      ...(data.durationMin !== undefined ? { durationMin: data.durationMin } : {}),
      ...(data.durationMax !== undefined ? { durationMax: data.durationMax } : {}),
      ...(data.durationLabel !== undefined ? { durationLabel: data.durationLabel } : {}),
      ...(data.featured !== undefined ? { featured: data.featured } : {}),
      ...(data.active !== undefined ? { active: data.active } : {}),
      ...(data.pendingData !== undefined ? { pendingData: data.pendingData } : {}),
      ...(data.displayOrder !== undefined ? { displayOrder: data.displayOrder } : {}),
      ...(data.imageUrl !== undefined ? { imageUrl: data.imageUrl } : {}),
    },
  });

  await writeAuditLog({
    userId: user!.id,
    action: "update",
    entity: "Service",
    entityId: id,
    details: data,
  });

  return NextResponse.json(updated);
}

export async function DELETE(_req: NextRequest, ctx: Ctx) {
  const { user, response } = await requireAdminApi();
  if (response) return response;
  const { id } = await ctx.params;
  await prisma.service.delete({ where: { id } });
  await writeAuditLog({
    userId: user!.id,
    action: "delete",
    entity: "Service",
    entityId: id,
  });
  return NextResponse.json({ ok: true });
}
