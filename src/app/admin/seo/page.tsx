import { requireAdminPage } from "@/lib/auth/guard";
import { prisma } from "@/lib/db";
import { SettingsForm } from "@/components/admin/settings-form";

export default async function Page() {
  await requireAdminPage();
  const seo = await prisma.seoSettings.findUnique({ where: { id: "default" } });
  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-semibold">SEO</h1>
      <SettingsForm
        section="seo"
        title="Site SEO"
        initial={seo || {}}
        fields={[
          { key: "siteTitle", label: "Site title" },
          { key: "metaDescription", label: "Meta description", type: "textarea" },
          { key: "keywords", label: "Keywords" },
          { key: "ogImageUrl", label: "OG image" },
          { key: "twitterHandle", label: "Twitter handle" },
          { key: "canonicalBase", label: "Canonical base URL", type: "url" },
        ]}
      />
    </div>
  );
}
