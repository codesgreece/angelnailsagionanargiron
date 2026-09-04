"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "@/components/admin/toast";
import { IntroGate } from "@/components/intro/intro-gate";
import type { IntroConfig } from "@/lib/intro/types";

export function IntroAdmin({ initial }: { initial: IntroConfig }) {
  const router = useRouter();
  const [settings, setSettings] = useState(initial);
  const [preview, setPreview] = useState(false);
  const [saving, setSaving] = useState(false);

  async function onSave(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    const res = await fetch("/api/admin/intro", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(settings),
    });
    setSaving(false);
    if (!res.ok) return toast("Σφάλμα αποθήκευσης", "error");
    toast("Intro settings αποθηκεύτηκαν");
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-semibold">Intro Animation</h1>
          <p className="mt-1 text-white/50">Cinematic Angel Nails 3D reveal</p>
        </div>
        <button
          type="button"
          onClick={() => setPreview(true)}
          className="rounded-md bg-[#ED2F78] px-4 py-2 text-sm font-medium"
        >
          Preview Intro
        </button>
      </div>

      <form onSubmit={onSave} className="grid gap-4 rounded-xl border border-white/10 bg-[#17171A] p-5 md:grid-cols-2">
        <label className="inline-flex items-center gap-2 text-sm md:col-span-2">
          <input
            type="checkbox"
            checked={settings.enabled}
            onChange={(e) => setSettings({ ...settings, enabled: e.target.checked })}
          />
          Intro Enabled
        </label>

        <label className="block text-sm text-white/70">
          Animation Style
          <select
            value={settings.style}
            onChange={(e) => setSettings({ ...settings, style: e.target.value })}
            className="mt-1 w-full rounded-md border border-white/10 bg-black/30 px-3 py-2 text-white"
          >
            <option value="angel-reveal">Angel Reveal</option>
            <option value="logo-reveal">Logo Reveal</option>
            <option value="liquid-chrome">Liquid Chrome</option>
            <option value="minimal">Minimal</option>
          </select>
        </label>

        <label className="block text-sm text-white/70">
          Play Frequency
          <select
            value={settings.playFrequency}
            onChange={(e) => setSettings({ ...settings, playFrequency: e.target.value })}
            className="mt-1 w-full rounded-md border border-white/10 bg-black/30 px-3 py-2 text-white"
          >
            <option value="session">Once per session</option>
            <option value="first">First visit only</option>
            <option value="daily">Once per day</option>
            <option value="always">Always</option>
          </select>
        </label>

        <label className="block text-sm text-white/70">
          Duration (ms)
          <input
            type="number"
            min={2000}
            max={4000}
            value={settings.durationMs}
            onChange={(e) => setSettings({ ...settings, durationMs: Number(e.target.value) })}
            className="mt-1 w-full rounded-md border border-white/10 bg-black/30 px-3 py-2 text-white"
          />
        </label>

        <label className="block text-sm text-white/70">
          Quality Mode
          <select
            value={settings.qualityMode}
            onChange={(e) => setSettings({ ...settings, qualityMode: e.target.value })}
            className="mt-1 w-full rounded-md border border-white/10 bg-black/30 px-3 py-2 text-white"
          >
            <option value="auto">Auto</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </label>

        <label className="block text-sm text-white/70">
          Mobile Quality
          <select
            value={settings.mobileQuality}
            onChange={(e) => setSettings({ ...settings, mobileQuality: e.target.value })}
            className="mt-1 w-full rounded-md border border-white/10 bg-black/30 px-3 py-2 text-white"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </label>

        {(
          [
            ["showSkip", "Show Skip Button"],
            ["showSubtitle", "Show Subtitle"],
            ["showLoading", "Show Loading Indicator"],
            ["showPetals", "Show Petals"],
            ["showParticles", "Show Particles"],
          ] as const
        ).map(([key, label]) => (
          <label key={key} className="inline-flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={Boolean(settings[key])}
              onChange={(e) => setSettings({ ...settings, [key]: e.target.checked })}
            />
            {label}
          </label>
        ))}

        <button
          disabled={saving}
          className="rounded-md bg-[#ED2F78] px-4 py-2 text-sm md:col-span-2 md:w-fit disabled:opacity-50"
        >
          {saving ? "Αποθήκευση..." : "Αποθήκευση"}
        </button>
      </form>

      {preview && (
        <IntroGate config={settings} force onComplete={() => setPreview(false)} />
      )}
    </div>
  );
}
