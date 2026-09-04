import { requireAdminPage } from "@/lib/auth/guard";
import { prisma } from "@/lib/db";
import { LookbookAdmin } from "@/components/admin/lookbook-admin";

export default async function AdminLookbookPage() {
  await requireAdminPage();
  const [settings, images] = await Promise.all([
    prisma.lookbookSettings.upsert({
      where: { id: "default" },
      update: {},
      create: { id: "default" },
    }),
    prisma.galleryImage.findMany({
      where: { active: true },
      orderBy: [{ lookbookOrder: "asc" }, { displayOrder: "asc" }, { createdAt: "desc" }],
    }),
  ]);

  return (
    <LookbookAdmin
      initialImages={JSON.parse(JSON.stringify(images))}
      initialSettings={JSON.parse(JSON.stringify(settings))}
    />
  );
}
