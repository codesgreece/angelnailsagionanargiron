import { requireAdminPage } from "@/lib/auth/guard";
import { prisma } from "@/lib/db";
import { CategoriesAdmin } from "@/components/admin/categories-admin";

export default async function Page() {
  await requireAdminPage();
  const categories = await prisma.serviceCategory.findMany({ orderBy: { displayOrder: "asc" } });
  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-semibold">Categories</h1>
      <CategoriesAdmin initial={categories} />
    </div>
  );
}
