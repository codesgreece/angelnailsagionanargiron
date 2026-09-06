"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "@/components/admin/toast";
import { PromoPopupGate } from "@/components/promo/promo-popup-gate";
import type { PromoPopupConfig } from "@/lib/promo/types";

export function PromoPopupAdmin({
  initial,
  treatwellUrl,
}: {
  initial: PromoPopupConfig;
  treatwellUrl: string;
}) {
  const router = useRouter();
  const [settings, setSettings] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [previewKey, setPreviewKey] = useState(0);

  async function onSave(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    const res = await fetch("/api/admin/promo-popup", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...settings,
        ctaUrl: settings.ctaUrl || null,
        imageUrl: settings.imageUrl || null,
      }),
    });
    setSaving(false);
    if (!res.ok) return toast("Σφάλμα αποθήκευσης", "error");
    toast("Το popup αποθηκεύτηκε");
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-semibold">Promo Popup</h1>
          <p className="mt-1 text-white/50">
            Προσφορά που εμφανίζεται στους επισκέπτες του site
          </p>
        </div>
        <button
          type="button"
          onClick={() => setPreviewKey((k) => k + 1)}
          className="rounded-md bg-[#ED2F78] px-4 py-2 text-sm font-medium"
        >
          Preview
        </button>
      </div>

      <form
        onSubmit={onSave}
        className="grid gap-4 rounded-xl border border-white/10 bg-[#17171A] p-5 md:grid-cols-2"
      >
        <label className="inline-flex items-center gap-2 text-sm md:col-span-2">
          <input
            type="checkbox"
            checked={settings.enabled}
            onChange={(e) => setSettings({ ...settings, enabled: e.target.checked })}
          />
          Ενεργό popup
        </label>

        <label className="block text-sm text-white/70 md:col-span-2">
          Συχνότητα εμφάνισης
          <select
            value={settings.frequency}
            onChange={(e) => setSettings({ ...settings, frequency: e.target.value })}
            className="mt-1 w-full rounded-md border border-white/10 bg-black/30 px-3 py-2 text-white"
          >
            <option value="always">Σε κάθε refresh / φόρτωση σελίδας</option>
            <option value="once">Μία φορά ανά browser</option>
          </select>
          <span className="mt-1 block text-xs text-white/40">
            Στο «μία φορά», αν αλλάξεις τίτλο/κείμενο και αποθηκεύσεις, θα εμφανιστεί ξανά.
          </span>
        </label>

        <label className="block text-sm text-white/70">
          Eyebrow / Badge
          <input
            value={settings.eyebrow}
            onChange={(e) => setSettings({ ...settings, eyebrow: e.target.value })}
            className="mt-1 w-full rounded-md border border-white/10 bg-black/30 px-3 py-2 text-white"
          />
        </label>

        <label className="block text-sm text-white/70">
          Καθυστέρηση εμφάνισης (ms)
          <input
            type="number"
            min={0}
            max={10000}
            value={settings.delayMs}
            onChange={(e) => setSettings({ ...settings, delayMs: Number(e.target.value) })}
            className="mt-1 w-full rounded-md border border-white/10 bg-black/30 px-3 py-2 text-white"
          />
        </label>

        <label className="block text-sm text-white/70 md:col-span-2">
          Τίτλος
          <input
            value={settings.title}
            onChange={(e) => setSettings({ ...settings, title: e.target.value })}
            className="mt-1 w-full rounded-md border border-white/10 bg-black/30 px-3 py-2 text-white"
          />
        </label>

        <label className="block text-sm text-white/70 md:col-span-2">
          Κείμενο
          <textarea
            rows={3}
            value={settings.body}
            onChange={(e) => setSettings({ ...settings, body: e.target.value })}
            className="mt-1 w-full rounded-md border border-white/10 bg-black/30 px-3 py-2 text-white"
          />
        </label>

        <label className="block text-sm text-white/70">
          Κείμενο κουμπιού
          <input
            value={settings.ctaLabel}
            onChange={(e) => setSettings({ ...settings, ctaLabel: e.target.value })}
            className="mt-1 w-full rounded-md border border-white/10 bg-black/30 px-3 py-2 text-white"
          />
        </label>

        <label className="block text-sm text-white/70">
          URL κουμπιού (κενό = Treatwell)
          <input
            value={settings.ctaUrl || ""}
            onChange={(e) => setSettings({ ...settings, ctaUrl: e.target.value || null })}
            placeholder={treatwellUrl}
            className="mt-1 w-full rounded-md border border-white/10 bg-black/30 px-3 py-2 text-white"
          />
        </label>

        <label className="block text-sm text-white/70 md:col-span-2">
          Image URL (προαιρετικό)
          <input
            value={settings.imageUrl || ""}
            onChange={(e) => setSettings({ ...settings, imageUrl: e.target.value || null })}
            className="mt-1 w-full rounded-md border border-white/10 bg-black/30 px-3 py-2 text-white"
          />
        </label>

        <div className="md:col-span-2">
          <button
            type="submit"
            disabled={saving}
            className="rounded-md bg-[#ED2F78] px-5 py-2.5 text-sm font-medium disabled:opacity-60"
          >
            {saving ? "Αποθήκευση…" : "Αποθήκευση"}
          </button>
        </div>
      </form>

      {previewKey > 0 && (
        <PromoPopupGate
          key={previewKey}
          config={settings}
          treatwellUrl={treatwellUrl}
          force
        />
      )}
    </div>
  );
}
