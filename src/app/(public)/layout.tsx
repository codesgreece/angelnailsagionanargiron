export const dynamic = "force-dynamic";

import { SiteHeader } from "@/components/public/site-header";
import { SiteFooter } from "@/components/public/site-footer";
import { CookieBanner } from "@/components/public/cookie-banner";
import { ViewTracker } from "@/components/public/view-tracker";
import {
  getOpeningHours,
  getSiteSettings,
  getSocialLinks,
} from "@/lib/services/content";
import { localBusinessJsonLd } from "@/lib/seo/metadata";

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const [settings, hours, socials] = await Promise.all([
    getSiteSettings(),
    getOpeningHours(),
    getSocialLinks(),
  ]);

  const cssVars = {
    ["--brand-black" as string]: settings.primaryColor,
    ["--brand-charcoal" as string]: settings.secondaryColor,
    ["--brand-pink" as string]: settings.accentColor,
    ["--brand-pink-bright" as string]: settings.brightPink,
    ["--brand-soft-white" as string]: settings.softWhite,
    ["--brand-warm-grey" as string]: settings.warmGrey,
    ["--brand-marble" as string]: settings.marbleGrey,
  };

  return (
    <div style={cssVars}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessJsonLd(settings)) }}
      />
      <ViewTracker />
      <SiteHeader treatwellUrl={settings.treatwellUrl} />
      <main>{children}</main>
      <SiteFooter settings={settings} hours={hours} socials={socials} />
      <CookieBanner enabled={settings.cookieBannerEnabled} />
    </div>
  );
}
