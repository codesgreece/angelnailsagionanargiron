import { requireAdminPage } from "@/lib/auth/guard";
import { prisma } from "@/lib/db";
import { ServicesAdmin } from "@/components/admin/services-admin";

export default async function Page() {
  await requireAdminPage();
  const [services, categories] = await Promise.all([
    prisma.service.findMany({ include: { category: true }, orderBy: [{ displayOrder: "asc" }, { name: "asc" }] }),
    prisma.serviceCategory.findMany({ orderBy: { displayOrder: "asc" } }),
  ]);
  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-semibold">Services</h1>
      <ServicesAdmin initialServices={JSON.parse(JSON.stringify(services))} categories={categories} />
    </div>
  );
}
