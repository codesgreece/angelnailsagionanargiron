"use client";

import { useCallback, useEffect, useState } from "react";
import type { TreatwellClickStats } from "@/lib/analytics/treatwell-stats";

const POLL_MS = 5000;

function formatTime(iso: string) {
  try {
    return new Date(iso).toLocaleString("el-GR", {
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  } catch {
    return iso;
  }
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-white/10 bg-[#17171A] p-5">
      <p className="text-sm text-white/50">{label}</p>
      <p className="mt-2 text-3xl font-semibold tabular-nums">{value.toLocaleString("el-GR")}</p>
    </div>
  );
}

export function TreatwellStatsPanel({ initial }: { initial: TreatwellClickStats }) {
  const [stats, setStats] = useState(initial);
  const [live, setLive] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/analytics/treatwell", { cache: "no-store" });
      if (!res.ok) throw new Error("fetch failed");
      const data = (await res.json()) as TreatwellClickStats;
      setStats(data);
      setError(null);
      setLive(true);
    } catch {
      setError("Αδυναμία ενημέρωσης — επανάληψη σε λίγο…");
      setLive(false);
    }
  }, []);

  useEffect(() => {
    const id = window.setInterval(refresh, POLL_MS);
    return () => window.clearInterval(id);
  }, [refresh]);

  const maxSource = Math.max(1, ...stats.bySource.map((s) => s.count));
  const maxHour = Math.max(1, ...stats.last24hHourly.map((h) => h.count));

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-semibold">Treatwell κλικ</h1>
          <p className="mt-1 text-white/50">
            Πραγματικά κλικ στο «Κλείσε Ραντεβού» / Treatwell από το site
          </p>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <span
            className={`inline-flex items-center gap-2 rounded-full px-3 py-1 ${
              live ? "bg-emerald-500/15 text-emerald-300" : "bg-amber-500/15 text-amber-200"
            }`}
          >
            <span
              className={`h-2 w-2 rounded-full ${live ? "bg-emerald-400 animate-pulse" : "bg-amber-300"}`}
            />
            {live ? "Live" : "Offline"}
          </span>
          <button
            type="button"
            onClick={refresh}
            className="rounded-md bg-white/10 px-3 py-1.5 hover:bg-white/15"
          >
            Ανανέωση
          </button>
          <span className="text-xs text-white/40">
            ενημ. {formatTime(stats.generatedAt)}
          </span>
        </div>
      </div>

      {error && <p className="text-sm text-amber-200/90">{error}</p>}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Σήμερα" value={stats.today} />
        <StatCard label="Τελευταίες 7 ημέρες" value={stats.last7} />
        <StatCard label="Τελευταίες 30 ημέρες" value={stats.last30} />
        <StatCard label="Σύνολο" value={stats.total} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-white/10 bg-[#17171A] p-5">
          <h2 className="text-lg font-medium">Ανά σημείο κλικ</h2>
          <p className="mt-1 text-sm text-white/45">Πού πάτησαν για Treatwell</p>
          <ul className="mt-5 space-y-3">
            {stats.bySource.length === 0 && (
              <li className="text-sm text-white/40">Δεν υπάρχουν κλικ ακόμα.</li>
            )}
            {stats.bySource.map((row) => (
              <li key={row.source}>
                <div className="mb-1 flex items-center justify-between gap-3 text-sm">
                  <span className="text-white/80">{row.label}</span>
                  <span className="tabular-nums text-white">{row.count}</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-white/5">
                  <div
                    className="h-full rounded-full bg-[#ED2F78]"
                    style={{ width: `${Math.max(6, (row.count / maxSource) * 100)}%` }}
                  />
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-xl border border-white/10 bg-[#17171A] p-5">
          <h2 className="text-lg font-medium">Τελευταίες 24 ώρες</h2>
          <p className="mt-1 text-sm text-white/45">Κλικ ανά ώρα</p>
          <div className="mt-5 flex h-40 items-end gap-1">
            {stats.last24hHourly.length === 0 && (
              <p className="text-sm text-white/40">Χωρίς δεδομένα ακόμη.</p>
            )}
            {stats.last24hHourly.map((h) => (
              <div key={h.hour} className="flex flex-1 flex-col items-center justify-end gap-1">
                <div
                  className="w-full min-h-[2px] rounded-t bg-[#FF3F87]/85"
                  style={{ height: `${(h.count / maxHour) * 100}%` }}
                  title={`${formatTime(h.hour)}: ${h.count}`}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-white/10 bg-[#17171A] p-5">
        <h2 className="text-lg font-medium">Πρόσφατα κλικ</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[520px] text-left text-sm">
            <thead className="text-white/45">
              <tr className="border-b border-white/10">
                <th className="pb-2 font-medium">Ώρα</th>
                <th className="pb-2 font-medium">Πηγή</th>
                <th className="pb-2 font-medium">Σελίδα</th>
              </tr>
            </thead>
            <tbody>
              {stats.recent.length === 0 && (
                <tr>
                  <td colSpan={3} className="py-4 text-white/40">
                    Κανένα κλικ ακόμα — μόλις κάποιος πατήσει Treatwell θα εμφανιστεί εδώ live.
                  </td>
                </tr>
              )}
              {stats.recent.map((row) => (
                <tr key={row.id} className="border-b border-white/5 text-white/80">
                  <td className="py-2.5 tabular-nums">{formatTime(row.createdAt)}</td>
                  <td className="py-2.5">{row.label}</td>
                  <td className="py-2.5 font-mono text-xs text-white/55">{row.path}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
