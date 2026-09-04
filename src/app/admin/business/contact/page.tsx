import { requireAdminPage } from "@/lib/auth/guard";
import { prisma } from "@/lib/db";
import { SettingsForm } from "@/components/admin/settings-form";

export default async function Page() {
  await requireAdminPage();
  const settings = await prisma.siteSettings.findUnique({ where: { id: "default" } });
  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-semibold">Contact Information</h1>
      <SettingsForm
        section="settings"
        title="Business contact"
        initial={settings || {}}
        fields={[
          { key: "brandName", label: "Brand name" },
          { key: "phonePrimary", label: "Primary phone" },
          { key: "phoneSecondary", label: "Secondary phone" },
          { key: "email", label: "Email", type: "email" },
          { key: "addressLine1", label: "Address line 1" },
          { key: "addressLine2", label: "Address line 2" },
          { key: "city", label: "City" },
          { key: "region", label: "Region" },
          { key: "postalCode", label: "Postal code" },
          { key: "country", label: "Country" },
          { key: "mapEmbedUrl", label: "Map embed URL", type: "textarea" },
        ]}
      />
    </div>
  );
}
