import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdminApi, jsonError } from "@/lib/api";
import { categorySchema } from "@/lib/validations";
import { writeAuditLog } from "@/lib/auth/audit";
import { slugify } from "@/lib/utils";

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, ctx: Ctx) {
  const { user, response } = await requireAdminApi();
  if (response) return response;
  const { id } = await ctx.params;
  const parsed = categorySchema.partial().safeParse(await req.json());
  if (!parsed.success) return jsonError("Μη έγκυρα δεδομένα");
  const data = parsed.data;
  const updated = await prisma.serviceCategory.update({
    where: { id },
    data: {
      ...(data.name !== undefined ? { name: data.name } : {}),
      ...(data.slug || data.name
        ? { slug: data.slug || (data.name ? slugify(data.name) : undefined) }
        : {}),
      ...(data.description !== undefined ? { description: data.description } : {}),
      ...(data.filterGroup !== undefined ? { filterGroup: data.filterGroup } : {}),
      ...(data.displayOrder !== undefined ? { displayOrder: data.displayOrder } : {}),
      ...(data.active !== undefined ? { active: data.active } : {}),
    },
  });
  await writeAuditLog({
    userId: user!.id,
    action: "update",
    entity: "ServiceCategory",
    entityId: id,
  });
  return NextResponse.json(updated);
}

export async function DELETE(_req: NextRequest, ctx: Ctx) {
  const { user, response } = await requireAdminApi();
  if (response) return response;
  const { id } = await ctx.params;
  await prisma.serviceCategory.delete({ where: { id } });
  await writeAuditLog({
    userId: user!.id,
    action: "delete",
    entity: "ServiceCategory",
    entityId: id,
  });
  return NextResponse.json({ ok: true });
}
