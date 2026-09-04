"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "@/components/admin/toast";

type Img = {
  id: string;
  title: string | null;
  category: string;
  description: string | null;
  imageUrl: string;
  lookbookEnabled: boolean;
  lookbookOrder: number;
  lookbookTitle: string | null;
  lookbookDescription: string | null;
  lookbookCategory: string | null;
  lookbookFeatured: boolean;
};

type Settings = {
  title: string;
  subtitle: string;
  coverImageUrl: string | null;
  coverBackground: string;
  accentColor: string;
  homepageEnabled: boolean;
  homepageBlurb: string;
};

export function LookbookAdmin({
  initialImages,
  initialSettings,
}: {
  initialImages: Img[];
  initialSettings: Settings;
}) {
  const router = useRouter();
  const [images, setImages] = useState(initialImages);
  const [settings, setSettings] = useState(initialSettings);
  const [dragId, setDragId] = useState<string | null>(null);

  const enabled = useMemo(
    () => [...images].filter((i) => i.lookbookEnabled).sort((a, b) => a.lookbookOrder - b.lookbookOrder),
    [images],
  );
  const available = useMemo(() => images.filter((i) => !i.lookbookEnabled), [images]);

  async function patchItem(id: string, data: Partial<Img>) {
    const res = await fetch("/api/admin/lookbook", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ section: "item", data: { id, ...data } }),
    });
    if (!res.ok) return toast("Σφάλμα", "error");
    setImages((prev) => prev.map((img) => (img.id === id ? { ...img, ...data } : img)));
    toast("Ενημερώθηκε");
    router.refresh();
  }

  async function saveSettings(e: FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/admin/lookbook", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ section: "settings", data: settings }),
    });
    if (!res.ok) return toast("Σφάλμα", "error");
    toast("Lookbook settings αποθηκεύτηκαν");
    router.refresh();
  }

  async function reorder(ids: string[]) {
    setImages((prev) =>
      prev.map((img) => {
        const order = ids.indexOf(img.id);
        if (order === -1) return img;
        return { ...img, lookbookOrder: order, lookbookEnabled: true };
      }),
    );
    const res = await fetch("/api/admin/lookbook", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ section: "reorder", data: { ids } }),
    });
    if (!res.ok) toast("Σφάλμα reorder", "error");
    else toast("Η σειρά ενημερώθηκε");
    router.refresh();
  }

  function onDrop(targetId: string) {
    if (!dragId || dragId === targetId) return;
    const ids = enabled.map((i) => i.id);
    const from = ids.indexOf(dragId);
    const to = ids.indexOf(targetId);
    if (from < 0 || to < 0) return;
    ids.splice(from, 1);
    ids.splice(to, 0, dragId);
    setDragId(null);
    void reorder(ids);
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-semibold">Lookbook</h1>
          <p className="mt-1 text-white/50">THE ANGEL NAILS BOOK — διαχείριση σελίδων</p>
        </div>
        <Link
          href="/lookbook"
          target="_blank"
          className="rounded-md bg-[#ED2F78] px-4 py-2 text-sm font-medium"
        >
          Preview Lookbook
        </Link>
      </div>

      <form onSubmit={saveSettings} className="grid gap-3 rounded-xl border border-white/10 bg-[#17171A] p-5 md:grid-cols-2">
        <h2 className="md:col-span-2 text-lg">Cover & Settings</h2>
        {(
          [
            ["title", "Title"],
            ["subtitle", "Subtitle"],
            ["coverImageUrl", "Cover image URL"],
            ["homepageBlurb", "Homepage blurb"],
            ["accentColor", "Accent color"],
            ["coverBackground", "Cover background"],
          ] as const
        ).map(([key, label]) => (
          <label key={key} className="block text-sm text-white/70">
            {label}
            <input
              value={String(settings[key] ?? "")}
              onChange={(e) => setSettings({ ...settings, [key]: e.target.value })}
              className="mt-1 w-full rounded-md border border-white/10 bg-black/30 px-3 py-2 text-white"
            />
          </label>
        ))}
        <label className="inline-flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={settings.homepageEnabled}
            onChange={(e) => setSettings({ ...settings, homepageEnabled: e.target.checked })}
          />
          Show on homepage
        </label>
        <button className="rounded-md bg-[#ED2F78] px-4 py-2 text-sm md:col-span-2 md:w-fit">Αποθήκευση</button>
      </form>

      <section className="space-y-3">
        <h2 className="text-lg">Lookbook pages (drag to reorder)</h2>
        {enabled.length === 0 && (
          <p className="text-sm text-white/50">Καμία εικόνα στο Lookbook ακόμα. Ενεργοποίησε από κάτω.</p>
        )}
        <ul className="space-y-2">
          {enabled.map((img, i) => (
            <li
              key={img.id}
              draggable
              onDragStart={() => setDragId(img.id)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => onDrop(img.id)}
              className="grid gap-3 rounded-xl border border-white/10 bg-[#17171A] p-3 md:grid-cols-[72px_1fr_auto]"
            >
              <div className="flex items-center gap-2">
                <span className="text-xs text-white/40">{String(i + 1).padStart(2, "0")}</span>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={img.imageUrl} alt="" className="h-14 w-14 rounded object-cover" />
              </div>
              <div className="grid gap-2 md:grid-cols-2">
                <input
                  defaultValue={img.lookbookTitle || img.title || ""}
                  placeholder="Lookbook title"
                  className="rounded-md border border-white/10 bg-black/30 px-2 py-1.5 text-sm"
                  onBlur={(e) => patchItem(img.id, { lookbookTitle: e.target.value })}
                />
                <input
                  defaultValue={img.lookbookCategory || img.category}
                  placeholder="Category"
                  className="rounded-md border border-white/10 bg-black/30 px-2 py-1.5 text-sm"
                  onBlur={(e) => patchItem(img.id, { lookbookCategory: e.target.value })}
                />
                <input
                  defaultValue={img.lookbookDescription || ""}
                  placeholder="Description"
                  className="rounded-md border border-white/10 bg-black/30 px-2 py-1.5 text-sm md:col-span-2"
                  onBlur={(e) => patchItem(img.id, { lookbookDescription: e.target.value })}
                />
              </div>
              <div className="flex flex-col gap-2 text-sm">
                <button
                  type="button"
                  className="text-[#FF3F87]"
                  onClick={() => patchItem(img.id, { lookbookFeatured: !img.lookbookFeatured })}
                >
                  {img.lookbookFeatured ? "Unfeature" : "Feature"}
                </button>
                <button
                  type="button"
                  className="text-red-400"
                  onClick={() => patchItem(img.id, { lookbookEnabled: false })}
                >
                  Remove
                </button>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg">Available gallery images</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {available.map((img) => (
            <article key={img.id} className="overflow-hidden rounded-xl border border-white/10 bg-[#17171A]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img.imageUrl} alt="" className="h-36 w-full object-cover" />
              <div className="space-y-2 p-3 text-sm">
                <p>{img.title || "Untitled"}</p>
                <button
                  type="button"
                  className="rounded-md bg-[#ED2F78] px-3 py-1.5"
                  onClick={() =>
                    patchItem(img.id, {
                      lookbookEnabled: true,
                      lookbookOrder: enabled.length,
                      lookbookTitle: img.title,
                      lookbookCategory: img.category,
                    })
                  }
                >
                  Show in Lookbook
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
