import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdminApi, jsonError, parseDecimal } from "@/lib/api";
import { serviceSchema } from "@/lib/validations";
import { writeAuditLog } from "@/lib/auth/audit";
import { slugify } from "@/lib/utils";
import { Prisma } from "@prisma/client";

export async function GET() {
  const services = await prisma.service.findMany({
    include: { category: true },
    orderBy: [{ displayOrder: "asc" }, { name: "asc" }],
  });
  return NextResponse.json(services);
}

export async function POST(req: NextRequest) {
  const { user, response } = await requireAdminApi();
  if (response) return response;

  const body = await req.json();
  const parsed = serviceSchema.safeParse(body);
  if (!parsed.success) return jsonError("Μη έγκυρα δεδομένα");

  const data = parsed.data;
  const slug = data.slug || slugify(data.name);
  const price = parseDecimal(data.price);

  const created = await prisma.service.create({
    data: {
      name: data.name,
      slug,
      categoryId: data.categoryId,
      description: data.description || null,
      price: price === null ? null : new Prisma.Decimal(price),
      priceFrom: data.priceFrom ?? false,
      durationMin: data.durationMin ?? null,
      durationMax: data.durationMax ?? null,
      durationLabel: data.durationLabel || null,
      featured: data.featured ?? false,
      active: data.active ?? true,
      pendingData: data.pendingData ?? false,
      displayOrder: data.displayOrder ?? 0,
      imageUrl: data.imageUrl || null,
    },
  });

  await writeAuditLog({
    userId: user!.id,
    action: "create",
    entity: "Service",
    entityId: created.id,
    details: { name: created.name },
  });

  return NextResponse.json(created, { status: 201 });
}
