import { formatDuration, formatPrice } from "@/lib/utils";
import { ButtonLink } from "@/components/ui/button-link";
import { FadeIn } from "@/components/ui/fade-in";
import type { Service, ServiceCategory } from "@prisma/client";

type ServiceWithCategory = Service & { category: ServiceCategory };

export function ServiceCard({
  service,
  treatwellUrl,
  delay = 0,
}: {
  service: ServiceWithCategory;
  treatwellUrl: string;
  delay?: number;
}) {
  return (
    <FadeIn delay={delay} className="h-full">
      <article className="group flex h-full flex-col border border-[var(--brand-warm-grey)]/60 bg-white p-5 transition duration-300 hover:-translate-y-0.5 hover:border-[var(--brand-pink)]/40 hover:shadow-[0_16px_40px_rgba(9,9,11,0.06)]">
        <p className="text-[11px] uppercase tracking-[0.2em] text-[var(--brand-marble)]">
          {service.category.name}
        </p>
        <h3 className="mt-2 text-lg font-medium text-[var(--brand-black)]">{service.name}</h3>
        {service.description && (
          <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-black/60">{service.description}</p>
        )}
        <div className="mt-auto flex items-end justify-between gap-3 pt-5">
          <div>
            {(service.durationLabel || service.durationMin) && (
              <p className="text-xs text-black/45">
                {formatDuration(service.durationMin, service.durationMax, service.durationLabel)}
              </p>
            )}
            <p className="mt-1 text-base font-semibold text-[var(--brand-black)]">
              {service.pendingData
                ? "Τιμή σύντομα"
                : formatPrice(service.price?.toString(), service.priceFrom)}
            </p>
          </div>
          <ButtonLink href={treatwellUrl} external size="sm">
            Κλείσε Ραντεβού
          </ButtonLink>
        </div>
      </article>
    </FadeIn>
  );
}
