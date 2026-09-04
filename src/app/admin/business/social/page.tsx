import { requireAdminPage } from "@/lib/auth/guard";
import { prisma } from "@/lib/db";
import { SocialAdmin } from "@/components/admin/social-admin";

export default async function Page() {
  await requireAdminPage();
  const socials = await prisma.socialLink.findMany({ orderBy: { displayOrder: "asc" } });
  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-semibold">Social Links</h1>
      <SocialAdmin initial={socials} />
    </div>
  );
}
