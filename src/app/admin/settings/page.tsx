import { requireAdminPage } from "@/lib/auth/guard";
import { prisma } from "@/lib/db";
import { SettingsForm } from "@/components/admin/settings-form";

export default async function Page() {
  await requireAdminPage();
  const settings = await prisma.siteSettings.findUnique({ where: { id: "default" } });
  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-semibold">General Settings</h1>
      <SettingsForm
        section="settings"
        title="General"
        initial={settings || {}}
        fields={[
          { key: "brandName", label: "Brand name" },
          { key: "tagline", label: "Tagline" },
          { key: "analyticsEnabled", label: "Analytics enabled", type: "checkbox" },
          { key: "analyticsId", label: "Analytics ID" },
          { key: "cookieBannerEnabled", label: "Cookie banner", type: "checkbox" },
        ]}
      />
    </div>
  );
}
