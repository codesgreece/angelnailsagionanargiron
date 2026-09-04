import Link from "next/link";
import { BrandLogo } from "@/components/public/brand-logo";
import { ButtonLink } from "@/components/ui/button-link";
import type { OpeningHour, SiteSettings, SocialLink } from "@prisma/client";

export function SiteFooter({
  settings,
  hours,
  socials,
}: {
  settings: SiteSettings;
  hours: OpeningHour[];
  socials: SocialLink[];
}) {
  const orderedHours = [...hours].sort((a, b) => {
    const order = [1, 2, 3, 4, 5, 6, 0];
    return order.indexOf(a.dayOfWeek) - order.indexOf(b.dayOfWeek);
  });

  return (
    <footer className="bg-[var(--brand-black)] text-white">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 md:grid-cols-2 md:px-6 lg:grid-cols-4">
        <div className="space-y-4">
          <BrandLogo inverted showTagline />
          <p className="max-w-xs text-sm text-white/65">
            Σύγχρονο nail & beauty studio στους Αγίους Αναργύρους.
          </p>
          <ButtonLink href={settings.treatwellUrl} external size="sm">
            Κλείσε Ραντεβού
          </ButtonLink>
        </div>

        <div>
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.18em] text-white/90">
            Πλοήγηση
          </h3>
          <ul className="space-y-2 text-sm text-white/70">
            {[
              ["/", "Αρχική"],
              ["/services", "Υπηρεσίες"],
              ["/gallery", "Gallery"],
              ["/about", "Σχετικά"],
              ["/contact", "Επικοινωνία"],
            ].map(([href, label]) => (
              <li key={href}>
                <Link href={href} className="hover:text-white">
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.18em] text-white/90">
            Επικοινωνία
          </h3>
          <ul className="space-y-2 text-sm text-white/70">
            <li>{settings.addressLine1}</li>
            <li>
              {settings.city}, {settings.postalCode}
            </li>
            <li>
              <a href={`tel:${settings.phonePrimary}`} className="hover:text-white">
                {settings.phonePrimary}
              </a>
            </li>
            {settings.phoneSecondary && (
              <li>
                <a href={`tel:${settings.phoneSecondary}`} className="hover:text-white">
                  {settings.phoneSecondary}
                </a>
              </li>
            )}
            <li>
              <a href={`mailto:${settings.email}`} className="hover:text-white">
                {settings.email}
              </a>
            </li>
          </ul>
          {socials.length > 0 && (
            <ul className="mt-4 flex flex-wrap gap-3">
              {socials.map((s) => (
                <li key={s.id}>
                  <a
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-[var(--brand-pink-bright)] hover:underline"
                  >
                    {s.label}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div>
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.18em] text-white/90">
            Ωράριο
          </h3>
          <ul className="space-y-2 text-sm text-white/70">
            {orderedHours.map((h) => (
              <li key={h.id} className="flex justify-between gap-4">
                <span>{h.dayNameEl}</span>
                <span>{h.closed ? "Κλειστά" : `${h.openTime} – ${h.closeTime}`}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-5 text-xs text-white/50 md:flex-row md:items-center md:justify-between md:px-6">
          <p>© {new Date().getFullYear()} Angel Nails</p>
          <div className="flex flex-wrap gap-4">
            <Link href="/privacy-policy" className="hover:text-white">
              Απόρρητο
            </Link>
            <Link href="/terms" className="hover:text-white">
              Όροι
            </Link>
            <Link href="/cookies" className="hover:text-white">
              Cookies
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
