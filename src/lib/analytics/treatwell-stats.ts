import { prisma } from "@/lib/db";
import { ensureTreatwellClickTable } from "@/lib/analytics/ensure-treatwell-table";

const SOURCE_LABELS: Record<string, string> = {
  hero: "Hero (αρχική)",
  header: "Header",
  "header-mobile": "Header (mobile menu)",
  footer: "Footer",
  sticky: "Sticky bar",
  "mobile-bar": "Mobile bar",
  "service-card": "Κάρτα υπηρεσίας",
  homepage: "Homepage CTA",
  about: "Σχετικά",
  contact: "Επικοινωνία",
  "promo-popup": "Promo popup",
};

export function labelTreatwellSource(source: string) {
  return SOURCE_LABELS[source] || source;
}

function startOfToday() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

function daysAgo(n: number) {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - n);
  return d;
}

export async function getTreatwellClickStats() {
  await ensureTreatwellClickTable();

  const today = startOfToday();
  const last7 = daysAgo(6);
  const last30 = daysAgo(29);

  const [total, todayCount, last7Count, last30Count, bySource, recent, hourly] =
    await Promise.all([
      prisma.treatwellClick.count(),
      prisma.treatwellClick.count({ where: { createdAt: { gte: today } } }),
      prisma.treatwellClick.count({ where: { createdAt: { gte: last7 } } }),
      prisma.treatwellClick.count({ where: { createdAt: { gte: last30 } } }),
      prisma.treatwellClick.groupBy({
        by: ["source"],
        _count: { _all: true },
        orderBy: { _count: { source: "desc" } },
      }),
      prisma.treatwellClick.findMany({
        orderBy: { createdAt: "desc" },
        take: 25,
        select: { id: true, source: true, path: true, createdAt: true },
      }),
      prisma.$queryRaw<{ hour: Date; count: bigint }[]>`
        SELECT date_trunc('hour', "createdAt") AS hour, COUNT(*)::bigint AS count
        FROM "TreatwellClick"
        WHERE "createdAt" >= ${daysAgo(1)}
        GROUP BY 1
        ORDER BY 1 ASC
      `,
    ]);

  return {
    total,
    today: todayCount,
    last7: last7Count,
    last30: last30Count,
    bySource: bySource.map((row) => ({
      source: row.source,
      label: labelTreatwellSource(row.source),
      count: row._count._all,
    })),
    recent: recent.map((r) => ({
      id: r.id,
      source: r.source,
      label: labelTreatwellSource(r.source),
      path: r.path,
      createdAt: r.createdAt.toISOString(),
    })),
    last24hHourly: hourly.map((h) => ({
      hour: new Date(h.hour).toISOString(),
      count: Number(h.count),
    })),
    generatedAt: new Date().toISOString(),
  };
}

export type TreatwellClickStats = Awaited<ReturnType<typeof getTreatwellClickStats>>;
