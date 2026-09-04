import { requireAdminPage } from "@/lib/auth/guard";
import { prisma } from "@/lib/db";
import { TeamAdmin } from "@/components/admin/team-admin";

export default async function Page() {
  await requireAdminPage();
  const team = await prisma.teamMember.findMany({ orderBy: { displayOrder: "asc" } });
  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-semibold">Team</h1>
      <TeamAdmin initial={team} />
    </div>
  );
}
