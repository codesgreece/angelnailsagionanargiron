import { requireAdminPage } from "@/lib/auth/guard";
import { prisma } from "@/lib/db";
import { GalleryAdmin } from "@/components/admin/gallery-admin";

export default async function Page() {
  await requireAdminPage();
  const images = await prisma.galleryImage.findMany({ orderBy: [{ displayOrder: "asc" }, { createdAt: "desc" }] });
  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-semibold">Gallery</h1>
      <GalleryAdmin initial={images} />
    </div>
  );
}
