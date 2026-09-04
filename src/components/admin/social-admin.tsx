"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "@/components/admin/toast";

type Social = { id: string; platform: string; label: string; url: string; active: boolean };

export function SocialAdmin({ initial }: { initial: Social[] }) {
  const router = useRouter();
  const [form, setForm] = useState({ platform: "instagram", label: "Instagram", url: "" });

  async function add(e: FormEvent) {
    e.preventDefault();
    if (!form.url) return;
    const res = await fetch("/api/admin/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ section: "social-create", data: form }),
    });
    if (!res.ok) return toast("Σφάλμα — βάλτε έγκυρο URL", "error");
    toast("Προστέθηκε");
    setForm({ platform: "instagram", label: "Instagram", url: "" });
    router.refresh();
  }

  async function remove(id: string) {
    const res = await fetch("/api/admin/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ section: "social-delete", data: { id } }),
    });
    if (!res.ok) return toast("Σφάλμα", "error");
    toast("Διαγράφηκε");
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <form onSubmit={add} className="grid gap-3 rounded-xl border border-white/10 bg-[#17171A] p-4 md:grid-cols-3">
        <input
          value={form.platform}
          onChange={(e) => setForm({ ...form, platform: e.target.value })}
          placeholder="platform"
          className="rounded-md border border-white/10 bg-black/30 px-3 py-2"
        />
        <input
          value={form.label}
          onChange={(e) => setForm({ ...form, label: e.target.value })}
          placeholder="label"
          className="rounded-md border border-white/10 bg-black/30 px-3 py-2"
        />
        <input
          value={form.url}
          onChange={(e) => setForm({ ...form, url: e.target.value })}
          placeholder="https://..."
          className="rounded-md border border-white/10 bg-black/30 px-3 py-2"
        />
        <button className="rounded-md bg-[#ED2F78] px-4 py-2 text-sm md:col-span-3">Προσθήκη</button>
      </form>
      <ul className="space-y-2">
        {initial.length === 0 && <li className="text-white/50">Δεν υπάρχουν social links (χωρίς fake URLs).</li>}
        {initial.map((s) => (
          <li key={s.id} className="flex items-center justify-between rounded-lg border border-white/10 bg-[#17171A] px-4 py-3">
            <div>
              <p>{s.label}</p>
              <a href={s.url} className="text-xs text-[#FF3F87]" target="_blank" rel="noopener noreferrer">
                {s.url}
              </a>
            </div>
            <button type="button" className="text-red-400" onClick={() => remove(s.id)}>
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
