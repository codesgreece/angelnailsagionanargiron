import { requireAdminPage } from "@/lib/auth/guard";
import { prisma } from "@/lib/db";
import { LegalEditor } from "@/components/admin/legal-editor";

export default async function Page() {
  await requireAdminPage();
  const page = await prisma.legalPage.findUnique({ where: { slug: "cookies" } });
  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-semibold">Legal · cookies</h1>
      <LegalEditor
        slug="cookies"
        initialTitle={page?.title || "cookies"}
        initialContent={page?.content || ""}
      />
    </div>
  );
}
