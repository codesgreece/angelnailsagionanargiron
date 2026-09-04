export const dynamic = "force-dynamic";

import { SiteHeader } from "@/components/public/site-header";
import { SiteFooter } from "@/components/public/site-footer";
import { CookieBanner } from "@/components/public/cookie-banner";
import { ViewTracker } from "@/components/public/view-tracker";
import { MobileBookingBar } from "@/components/public/mobile-booking-bar";
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
    ["--brand-black" as string]: settings.primaryColor || "#09090B",
    ["--brand-charcoal" as string]: settings.secondaryColor || "#17171A",
    ["--brand-pink" as string]: settings.accentColor || "#ED2F78",
    ["--brand-pink-bright" as string]: settings.brightPink || "#FF3F87",
    ["--brand-soft-white" as string]: settings.softWhite || "#F7F6F4",
    ["--brand-warm-grey" as string]: settings.warmGrey || "#D8D5D2",
    ["--brand-marble" as string]: settings.marbleGrey || "#BDB9B6",
  };

  return (
    <div style={cssVars} className="pb-20 md:pb-0">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessJsonLd(settings)) }}
      />
      <ViewTracker />
      <SiteHeader treatwellUrl={settings.treatwellUrl} />
      <main>{children}</main>
      <SiteFooter settings={settings} hours={hours} socials={socials} />
      <MobileBookingBar treatwellUrl={settings.treatwellUrl} />
      <CookieBanner enabled={settings.cookieBannerEnabled} />
    </div>
  );
}
