import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdminApi, jsonError } from "@/lib/api";
import { categorySchema } from "@/lib/validations";
import { writeAuditLog } from "@/lib/auth/audit";
import { slugify } from "@/lib/utils";

export async function GET() {
  const cats = await prisma.serviceCategory.findMany({ orderBy: { displayOrder: "asc" } });
  return NextResponse.json(cats);
}

export async function POST(req: NextRequest) {
  const { user, response } = await requireAdminApi();
  if (response) return response;
  const parsed = categorySchema.safeParse(await req.json());
  if (!parsed.success) return jsonError("Μη έγκυρα δεδομένα");
  const data = parsed.data;
  const created = await prisma.serviceCategory.create({
    data: {
      name: data.name,
      slug: data.slug || slugify(data.name),
      description: data.description || null,
      filterGroup: data.filterGroup || null,
      displayOrder: data.displayOrder ?? 0,
      active: data.active ?? true,
    },
  });
  await writeAuditLog({
    userId: user!.id,
    action: "create",
    entity: "ServiceCategory",
    entityId: created.id,
  });
  return NextResponse.json(created, { status: 201 });
}
