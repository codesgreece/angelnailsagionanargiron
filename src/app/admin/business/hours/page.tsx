import { requireAdminPage } from "@/lib/auth/guard";
import { prisma } from "@/lib/db";
import { HoursAdmin } from "@/components/admin/hours-admin";

export default async function Page() {
  await requireAdminPage();
  const hours = await prisma.openingHour.findMany({ orderBy: { dayOfWeek: "asc" } });
  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-semibold">Opening Hours</h1>
      <HoursAdmin initial={hours} />
    </div>
  );
}
