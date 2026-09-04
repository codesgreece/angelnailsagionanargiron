"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { ServiceCard } from "@/components/public/service-card";
import type { Service, ServiceCategory } from "@prisma/client";

type ServiceWithCategory = Service & { category: ServiceCategory };

const FILTERS = ["Όλα", "Μανικιούρ", "Πεντικιούρ", "Τεχνητά Νύχια", "Αποτρίχωση", "Nail Extras"] as const;

export function ServicesBrowser({
  services,
  treatwellUrl,
}: {
  services: ServiceWithCategory[];
  treatwellUrl: string;
}) {
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("Όλα");
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    return services.filter((s) => {
      const group = s.category.filterGroup || s.category.name;
      const matchesFilter =
        filter === "Όλα" ||
        group === filter ||
        s.category.name.includes(filter) ||
        (filter === "Αποτρίχωση" && group.includes("Αποτρίχωση"));
      const query = q.trim().toLowerCase();
      const matchesQuery =
        !query ||
        s.name.toLowerCase().includes(query) ||
        (s.description || "").toLowerCase().includes(query) ||
        s.category.name.toLowerCase().includes(query);
      return matchesFilter && matchesQuery;
    });
  }, [services, filter, q]);

  return (
    <div>
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap gap-2">
          {FILTERS.map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={`rounded-md px-3 py-2 text-sm font-medium transition ${
                filter === f
                  ? "bg-[#09090B] text-white"
                  : "border border-[#D8D5D2] text-[#09090B] hover:border-[#ED2F78]"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
        <label className="relative block w-full md:max-w-xs">
          <span className="sr-only">Αναζήτηση υπηρεσιών</span>
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-black/35" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Αναζήτηση..."
            className="w-full rounded-md border border-[var(--brand-warm-grey)] bg-white py-2.5 pl-9 pr-3 text-sm outline-none focus:border-[var(--brand-pink)]"
          />
        </label>
      </div>

      {filtered.length === 0 ? (
        <p className="mt-12 text-center text-black/55">Δεν βρέθηκαν υπηρεσίες.</p>
      ) : (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((s, i) => (
            <ServiceCard key={s.id} service={s} treatwellUrl={treatwellUrl} delay={Math.min(i * 0.04, 0.2)} />
          ))}
        </div>
      )}
    </div>
  );
}
