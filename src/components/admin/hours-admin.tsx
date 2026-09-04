"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "@/components/admin/toast";

type Hour = {
  dayOfWeek: number;
  dayNameEl: string;
  openTime: string | null;
  closeTime: string | null;
  closed: boolean;
};

export function HoursAdmin({ initial }: { initial: Hour[] }) {
  const router = useRouter();
  const [hours, setHours] = useState(initial);

  async function save(e: FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/admin/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ section: "hours", data: hours }),
    });
    if (!res.ok) return toast("Σφάλμα", "error");
    toast("Το ωράριο ενημερώθηκε");
    router.refresh();
  }

  return (
    <form onSubmit={save} className="space-y-3 rounded-xl border border-white/10 bg-[#17171A] p-5">
      {hours.map((h, idx) => (
        <div key={h.dayOfWeek} className="grid items-center gap-2 md:grid-cols-5">
          <p className="font-medium">{h.dayNameEl}</p>
          <label className="inline-flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={h.closed}
              onChange={(e) => {
                const next = [...hours];
                next[idx] = { ...h, closed: e.target.checked };
                setHours(next);
              }}
            />
            Κλειστά
          </label>
          <input
            value={h.openTime || ""}
            disabled={h.closed}
            onChange={(e) => {
              const next = [...hours];
              next[idx] = { ...h, openTime: e.target.value };
              setHours(next);
            }}
            placeholder="09:00"
            className="rounded-md border border-white/10 bg-black/30 px-3 py-2 disabled:opacity-40"
          />
          <input
            value={h.closeTime || ""}
            disabled={h.closed}
            onChange={(e) => {
              const next = [...hours];
              next[idx] = { ...h, closeTime: e.target.value };
              setHours(next);
            }}
            placeholder="21:00"
            className="rounded-md border border-white/10 bg-black/30 px-3 py-2 disabled:opacity-40"
          />
        </div>
      ))}
      <button className="rounded-md bg-[#ED2F78] px-4 py-2 text-sm">Αποθήκευση</button>
    </form>
  );
}
