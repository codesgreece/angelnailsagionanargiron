import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdminApi, jsonError } from "@/lib/api";
import { gallerySchema } from "@/lib/validations";
import { writeAuditLog } from "@/lib/auth/audit";
import { saveOptimizedImage, deleteUploadedFile } from "@/lib/storage/uploads";

export async function GET() {
  const images = await prisma.galleryImage.findMany({
    orderBy: [{ displayOrder: "asc" }, { createdAt: "desc" }],
  });
  return NextResponse.json(images);
}

export async function POST(req: NextRequest) {
  const { user, response } = await requireAdminApi();
  if (response) return response;

  const contentType = req.headers.get("content-type") || "";
  if (contentType.includes("multipart/form-data")) {
    const form = await req.formData();
    const files = form.getAll("files").filter((f): f is File => f instanceof File);
    if (files.length === 0) return jsonError("Δεν επιλέχθηκαν αρχεία");
    const category = String(form.get("category") || "Νύχια");
    const created = [];
    for (const file of files) {
      const imageUrl = await saveOptimizedImage(file, "gallery");
      const row = await prisma.galleryImage.create({
        data: {
          imageUrl,
          category,
          title: file.name.replace(/\.[^.]+$/, ""),
          altText: file.name.replace(/\.[^.]+$/, ""),
          active: true,
        },
      });
      created.push(row);
    }
    await writeAuditLog({
      userId: user!.id,
      action: "upload",
      entity: "GalleryImage",
      details: { count: created.length },
    });
    return NextResponse.json(created, { status: 201 });
  }

  const parsed = gallerySchema.safeParse(await req.json());
  if (!parsed.success) return jsonError("Μη έγκυρα δεδομένα");
  const data = parsed.data;
  const row = await prisma.galleryImage.create({
    data: {
      title: data.title || null,
      category: data.category,
      description: data.description || null,
      altText: data.altText || null,
      imageUrl: data.imageUrl,
      featured: data.featured ?? false,
      active: data.active ?? true,
      displayOrder: data.displayOrder ?? 0,
    },
  });
  await writeAuditLog({
    userId: user!.id,
    action: "create",
    entity: "GalleryImage",
    entityId: row.id,
  });
  return NextResponse.json(row, { status: 201 });
}

export async function DELETE(req: NextRequest) {
  const { user, response } = await requireAdminApi();
  if (response) return response;
  const { id } = await req.json();
  if (!id) return jsonError("Missing id");
  const row = await prisma.galleryImage.findUnique({ where: { id } });
  if (!row) return jsonError("Not found", 404);
  await prisma.galleryImage.delete({ where: { id } });
  await deleteUploadedFile(row.imageUrl);
  await writeAuditLog({
    userId: user!.id,
    action: "delete",
    entity: "GalleryImage",
    entityId: id,
  });
  return NextResponse.json({ ok: true });
}
