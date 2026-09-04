"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "@/components/admin/toast";

export function SettingsForm({
  section,
  title,
  initial,
  fields,
}: {
  section: string;
  title: string;
  initial: Record<string, unknown>;
  fields: Array<{
    key: string;
    label: string;
    type?: "text" | "textarea" | "url" | "email" | "color" | "number" | "checkbox";
  }>;
}) {
  const router = useRouter();
  const [data, setData] = useState<Record<string, unknown>>(initial);
  const [saving, setSaving] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    const res = await fetch("/api/admin/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ section, data }),
    });
    setSaving(false);
    if (!res.ok) return toast("Αποτυχία αποθήκευσης", "error");
    toast("Αποθηκεύτηκε");
    router.refresh();
  }

  async function uploadField(key: string, file: File | null) {
    if (!file) return;
    const fd = new FormData();
    fd.append("file", file);
    fd.append("folder", "branding");
    const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
    if (!res.ok) return toast("Upload failed", "error");
    const json = await res.json();
    setData((prev) => ({ ...prev, [key]: json.url }));
    toast("Uploaded");
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4 rounded-xl border border-white/10 bg-[#17171A] p-5">
      <h2 className="text-xl font-medium">{title}</h2>
      <div className="grid gap-4 md:grid-cols-2">
        {fields.map((f) => {
          const value = data[f.key];
          if (f.type === "checkbox") {
            return (
              <label key={f.key} className="inline-flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={Boolean(value)}
                  onChange={(e) => setData({ ...data, [f.key]: e.target.checked })}
                />
                {f.label}
              </label>
            );
          }
          if (f.type === "textarea") {
            return (
              <label key={f.key} className="md:col-span-2 block text-sm text-white/70">
                {f.label}
                <textarea
                  value={String(value ?? "")}
                  onChange={(e) => setData({ ...data, [f.key]: e.target.value })}
                  className="mt-1 min-h-28 w-full rounded-md border border-white/10 bg-black/30 px-3 py-2 text-white"
                />
              </label>
            );
          }
          if (
            (f.key.toLowerCase().includes("url") && f.key.toLowerCase().includes("image")) ||
            f.key === "logoUrl" ||
            f.key === "faviconUrl" ||
            f.key === "heroImageUrl" ||
            f.key === "ogImageUrl"
          ) {
            return (
              <label key={f.key} className="block text-sm text-white/70">
                {f.label}
                <input
                  value={String(value ?? "")}
                  onChange={(e) => setData({ ...data, [f.key]: e.target.value })}
                  className="mt-1 w-full rounded-md border border-white/10 bg-black/30 px-3 py-2 text-white"
                />
                <input
                  type="file"
                  accept="image/*"
                  className="mt-2 block text-xs"
                  onChange={(e) => uploadField(f.key, e.target.files?.[0] || null)}
                />
              </label>
            );
          }
          return (
            <label key={f.key} className="block text-sm text-white/70">
              {f.label}
              <input
                type={f.type || "text"}
                value={String(value ?? "")}
                onChange={(e) =>
                  setData({
                    ...data,
                    [f.key]: f.type === "number" ? Number(e.target.value) : e.target.value,
                  })
                }
                className="mt-1 w-full rounded-md border border-white/10 bg-black/30 px-3 py-2 text-white"
              />
            </label>
          );
        })}
      </div>
      <button disabled={saving} className="rounded-md bg-[#ED2F78] px-4 py-2 text-sm">
        {saving ? "Αποθήκευση..." : "Αποθήκευση"}
      </button>
    </form>
  );
}
