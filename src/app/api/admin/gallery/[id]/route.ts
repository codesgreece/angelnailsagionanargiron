import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdminApi, jsonError } from "@/lib/api";
import { gallerySchema } from "@/lib/validations";
import { writeAuditLog } from "@/lib/auth/audit";

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, ctx: Ctx) {
  const { user, response } = await requireAdminApi();
  if (response) return response;
  const { id } = await ctx.params;
  const parsed = gallerySchema.partial().safeParse(await req.json());
  if (!parsed.success) return jsonError("Μη έγκυρα δεδομένα");
  const data = parsed.data;
  const updated = await prisma.galleryImage.update({
    where: { id },
    data: {
      ...(data.title !== undefined ? { title: data.title } : {}),
      ...(data.category !== undefined ? { category: data.category } : {}),
      ...(data.description !== undefined ? { description: data.description } : {}),
      ...(data.altText !== undefined ? { altText: data.altText } : {}),
      ...(data.imageUrl !== undefined ? { imageUrl: data.imageUrl } : {}),
      ...(data.featured !== undefined ? { featured: data.featured } : {}),
      ...(data.active !== undefined ? { active: data.active } : {}),
      ...(data.displayOrder !== undefined ? { displayOrder: data.displayOrder } : {}),
    },
  });
  await writeAuditLog({
    userId: user!.id,
    action: "update",
    entity: "GalleryImage",
    entityId: id,
  });
  return NextResponse.json(updated);
}
