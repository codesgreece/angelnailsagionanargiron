import { requireAdminPage } from "@/lib/auth/guard";
import { getTreatwellClickStats } from "@/lib/analytics/treatwell-stats";
import { TreatwellStatsPanel } from "@/components/admin/treatwell-stats-panel";

export default async function AdminTreatwellStatsPage() {
  await requireAdminPage();

  let initial;
  try {
    initial = await getTreatwellClickStats();
  } catch {
    initial = {
      total: 0,
      today: 0,
      last7: 0,
      last30: 0,
      bySource: [],
      recent: [],
      last24hHourly: [],
      generatedAt: new Date().toISOString(),
    };
  }

  return <TreatwellStatsPanel initial={initial} />;
}
