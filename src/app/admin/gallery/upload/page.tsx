import { requireAdminPage } from "@/lib/auth/guard";
import { GalleryAdmin } from "@/components/admin/gallery-admin";

export default async function Page() {
  await requireAdminPage();
  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-semibold">Upload Images</h1>
      <GalleryAdmin initial={[]} mode="upload" />
    </div>
  );
}
