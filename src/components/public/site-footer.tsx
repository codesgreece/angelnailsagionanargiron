import Link from "next/link";
import { BrandLogo } from "@/components/public/brand-logo";
import { ButtonLink } from "@/components/ui/button-link";
import type { OpeningHour, SiteSettings, SocialLink } from "@prisma/client";

const DEFAULT_HOURS: OpeningHour[] = [
  { id: "1", dayOfWeek: 1, dayNameEl: "Δευτέρα", openTime: null, closeTime: null, closed: true, updatedAt: new Date() },
  { id: "2", dayOfWeek: 2, dayNameEl: "Τρίτη", openTime: "09:00", closeTime: "21:00", closed: false, updatedAt: new Date() },
  { id: "3", dayOfWeek: 3, dayNameEl: "Τετάρτη", openTime: "09:00", closeTime: "21:00", closed: false, updatedAt: new Date() },
  { id: "4", dayOfWeek: 4, dayNameEl: "Πέμπτη", openTime: "09:00", closeTime: "21:00", closed: false, updatedAt: new Date() },
  { id: "5", dayOfWeek: 5, dayNameEl: "Παρασκευή", openTime: "09:00", closeTime: "21:00", closed: false, updatedAt: new Date() },
  { id: "6", dayOfWeek: 6, dayNameEl: "Σάββατο", openTime: "09:00", closeTime: "17:00", closed: false, updatedAt: new Date() },
  { id: "0", dayOfWeek: 0, dayNameEl: "Κυριακή", openTime: null, closeTime: null, closed: true, updatedAt: new Date() },
];

export function SiteFooter({
  settings,
  hours,
  socials,
}: {
  settings: SiteSettings;
  hours: OpeningHour[];
  socials: SocialLink[];
}) {
  const source = hours.length > 0 ? hours : DEFAULT_HOURS;
  const orderedHours = [...source].sort((a, b) => {
    const order = [1, 2, 3, 4, 5, 6, 0];
    return order.indexOf(a.dayOfWeek) - order.indexOf(b.dayOfWeek);
  });

  return (
    <footer className="bg-[#09090B] text-white">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 md:grid-cols-2 md:px-6 lg:grid-cols-4">
        <div className="space-y-4">
          <BrandLogo showTagline />
          <p className="max-w-xs text-sm text-white/80">
            Σύγχρονο nail & beauty studio στους Αγίους Αναργύρους.
          </p>
          <span data-booking-cta>
            <ButtonLink href={settings.treatwellUrl} external size="sm">
              Κλείσε Ραντεβού
            </ButtonLink>
          </span>
        </div>

        <div>
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.18em] text-white">
            Πλοήγηση
          </h3>
          <ul className="space-y-2 text-sm text-white/85">
            {[
              ["/", "Αρχική"],
              ["/services", "Υπηρεσίες"],
              ["/gallery", "Gallery"],
              ["/lookbook", "Lookbook"],
              ["/about", "Σχετικά"],
              ["/contact", "Επικοινωνία"],
            ].map(([href, label]) => (
              <li key={href}>
                <Link href={href} className="transition hover:text-[#FF3F87]">
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.18em] text-white">
            Επικοινωνία
          </h3>
          <ul className="space-y-2 text-sm text-white/85">
            <li>{settings.addressLine1}</li>
            <li>
              {settings.city}, {settings.postalCode}
            </li>
            <li>
              <a href={`tel:${settings.phonePrimary}`} className="hover:text-[#FF3F87]">
                {settings.phonePrimary}
              </a>
            </li>
            {settings.phoneSecondary && (
              <li>
                <a href={`tel:${settings.phoneSecondary}`} className="hover:text-[#FF3F87]">
                  {settings.phoneSecondary}
                </a>
              </li>
            )}
            <li>
              <a href={`mailto:${settings.email}`} className="hover:text-[#FF3F87]">
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
                    className="text-sm text-[#FF3F87] hover:underline"
                  >
                    {s.label}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div>
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.18em] text-white">
            Ωράριο
          </h3>
          <ul className="space-y-2 text-sm text-white/85">
            {orderedHours.map((h) => (
              <li key={h.id} className="flex justify-between gap-4">
                <span>{h.dayNameEl}</span>
                <span>{h.closed ? "Κλειστά" : `${h.openTime} – ${h.closeTime}`}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-t border-white/15">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-5 text-xs text-white/70 md:flex-row md:items-center md:justify-between md:px-6">
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
