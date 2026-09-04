import { requireAdminPage } from "@/lib/auth/guard";
import { prisma } from "@/lib/db";
import { SettingsForm } from "@/components/admin/settings-form";
import { BrandLogo } from "@/components/public/brand-logo";

export default async function Page() {
  await requireAdminPage();
  const settings = await prisma.siteSettings.findUnique({ where: { id: "default" } });
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-semibold">Appearance</h1>
      <div className="rounded-xl border border-white/10 bg-[#09090B] p-6">
        <p className="mb-3 text-sm text-white/50">Branding preview</p>
        <BrandLogo inverted showTagline size="lg" />
      </div>
      <SettingsForm
        section="settings"
        title="Colors & typography"
        initial={settings || {}}
        fields={[
          { key: "primaryColor", label: "Primary / black", type: "color" },
          { key: "secondaryColor", label: "Secondary / charcoal", type: "color" },
          { key: "accentColor", label: "Brand pink", type: "color" },
          { key: "brightPink", label: "Bright pink", type: "color" },
          { key: "backgroundColor", label: "Background", type: "color" },
          { key: "softWhite", label: "Soft white", type: "color" },
          { key: "warmGrey", label: "Warm grey", type: "color" },
          { key: "marbleGrey", label: "Marble grey", type: "color" },
          { key: "textColor", label: "Text color", type: "color" },
          { key: "fontDisplay", label: "Display font" },
          { key: "fontSans", label: "Sans font" },
        ]}
      />
    </div>
  );
}
