import { requireAdminPage } from "@/lib/auth/guard";
import { prisma } from "@/lib/db";
import { LegalEditor } from "@/components/admin/legal-editor";

export default async function Page() {
  await requireAdminPage();
  const page = await prisma.legalPage.findUnique({ where: { slug: "privacy-policy" } });
  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-semibold">Legal · privacy-policy</h1>
      <LegalEditor
        slug="privacy-policy"
        initialTitle={page?.title || "privacy-policy"}
        initialContent={page?.content || ""}
      />
    </div>
  );
}
