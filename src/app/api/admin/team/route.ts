import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdminApi, jsonError } from "@/lib/api";
import { teamSchema } from "@/lib/validations";
import { writeAuditLog } from "@/lib/auth/audit";

export async function GET() {
  return NextResponse.json(await prisma.teamMember.findMany({ orderBy: { displayOrder: "asc" } }));
}

export async function POST(req: NextRequest) {
  const { user, response } = await requireAdminApi();
  if (response) return response;
  const parsed = teamSchema.safeParse(await req.json());
  if (!parsed.success) return jsonError("Μη έγκυρα δεδομένα");
  const data = parsed.data;
  const created = await prisma.teamMember.create({
    data: {
      name: data.name,
      role: data.role || null,
      services: data.services || null,
      bio: data.bio || null,
      photoUrl: data.photoUrl || null,
      displayOrder: data.displayOrder ?? 0,
      active: data.active ?? true,
    },
  });
  await writeAuditLog({
    userId: user!.id,
    action: "create",
    entity: "TeamMember",
    entityId: created.id,
  });
  return NextResponse.json(created, { status: 201 });
}
