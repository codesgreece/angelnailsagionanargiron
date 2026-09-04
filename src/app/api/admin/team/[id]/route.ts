import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdminApi, jsonError } from "@/lib/api";
import { teamSchema } from "@/lib/validations";
import { writeAuditLog } from "@/lib/auth/audit";

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, ctx: Ctx) {
  const { user, response } = await requireAdminApi();
  if (response) return response;
  const { id } = await ctx.params;
  const parsed = teamSchema.partial().safeParse(await req.json());
  if (!parsed.success) return jsonError("Μη έγκυρα δεδομένα");
  const data = parsed.data;
  const updated = await prisma.teamMember.update({
    where: { id },
    data: {
      ...(data.name !== undefined ? { name: data.name } : {}),
      ...(data.role !== undefined ? { role: data.role } : {}),
      ...(data.services !== undefined ? { services: data.services } : {}),
      ...(data.bio !== undefined ? { bio: data.bio } : {}),
      ...(data.photoUrl !== undefined ? { photoUrl: data.photoUrl } : {}),
      ...(data.displayOrder !== undefined ? { displayOrder: data.displayOrder } : {}),
      ...(data.active !== undefined ? { active: data.active } : {}),
    },
  });
  await writeAuditLog({
    userId: user!.id,
    action: "update",
    entity: "TeamMember",
    entityId: id,
  });
  return NextResponse.json(updated);
}

export async function DELETE(_req: NextRequest, ctx: Ctx) {
  const { user, response } = await requireAdminApi();
  if (response) return response;
  const { id } = await ctx.params;
  await prisma.teamMember.delete({ where: { id } });
  await writeAuditLog({
    userId: user!.id,
    action: "delete",
    entity: "TeamMember",
    entityId: id,
  });
  return NextResponse.json({ ok: true });
}
