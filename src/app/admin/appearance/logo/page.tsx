import { requireAdminPage } from "@/lib/auth/guard";
import { prisma } from "@/lib/db";
import { SettingsForm } from "@/components/admin/settings-form";
import { BrandLogo } from "@/components/public/brand-logo";

export default async function Page() {
  await requireAdminPage();
  const settings = await prisma.siteSettings.findUnique({ where: { id: "default" } });
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-semibold">Logo / Hero</h1>
      <div className="rounded-xl border border-white/10 bg-black p-6">
        <BrandLogo inverted showTagline />
      </div>
      <SettingsForm
        section="settings"
        title="Logo, favicon, hero"
        initial={settings || {}}
        fields={[
          { key: "logoUrl", label: "Logo URL (optional SVG/PNG)" },
          { key: "faviconUrl", label: "Favicon URL" },
          { key: "heroImageUrl", label: "Hero image URL" },
          { key: "tagline", label: "Tagline" },
        ]}
      />
    </div>
  );
}
