import { requireAdminPage } from "@/lib/auth/guard";
import { prisma } from "@/lib/db";
import { PageContentEditor } from "@/components/admin/page-content-editor";

export default async function Page() {
  await requireAdminPage();
  const page = await prisma.pageContent.findUnique({ where: { key: "contact" } });
  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-semibold">Contact Content</h1>
      <PageContentEditor pageKey="contact" title="Contact Content" initial={page || {}} />
    </div>
  );
}
