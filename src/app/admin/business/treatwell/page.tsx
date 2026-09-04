import { requireAdminPage } from "@/lib/auth/guard";
import { prisma } from "@/lib/db";
import { SettingsForm } from "@/components/admin/settings-form";

export default async function Page() {
  await requireAdminPage();
  const settings = await prisma.siteSettings.findUnique({ where: { id: "default" } });
  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-semibold">Treatwell</h1>
      <SettingsForm
        section="settings"
        title="Treatwell booking URL"
        initial={settings || {}}
        fields={[{ key: "treatwellUrl", label: "Treatwell URL", type: "url" }]}
      />
    </div>
  );
}
