import { requireAdminPage } from "@/lib/auth/guard";
import { prisma } from "@/lib/db";
import { LegalEditor } from "@/components/admin/legal-editor";

export default async function Page() {
  await requireAdminPage();
  const page = await prisma.legalPage.findUnique({ where: { slug: "terms" } });
  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-semibold">Legal · terms</h1>
      <LegalEditor
        slug="terms"
        initialTitle={page?.title || "terms"}
        initialContent={page?.content || ""}
      />
    </div>
  );
}
