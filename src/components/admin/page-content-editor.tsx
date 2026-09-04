"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "@/components/admin/toast";

export function PageContentEditor({
  pageKey,
  title,
  initial,
}: {
  pageKey: string;
  title: string;
  initial: {
    title?: string | null;
    subtitle?: string | null;
    body?: string | null;
    ctaLabel?: string | null;
    ctaHref?: string | null;
    imageUrl?: string | null;
  };
}) {
  const router = useRouter();
  const [data, setData] = useState({
    title: initial.title || "",
    subtitle: initial.subtitle || "",
    body: initial.body || "",
    ctaLabel: initial.ctaLabel || "",
    ctaHref: initial.ctaHref || "",
    imageUrl: initial.imageUrl || "",
  });

  async function save(e: FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/admin/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ section: "page", data: { key: pageKey, ...data } }),
    });
    if (!res.ok) return toast("Σφάλμα", "error");
    toast("Αποθηκεύτηκε");
    router.refresh();
  }

  return (
    <form onSubmit={save} className="space-y-4 rounded-xl border border-white/10 bg-[#17171A] p-5">
      <h2 className="text-xl">{title}</h2>
      {Object.entries(data).map(([key, value]) =>
        key === "body" ? (
          <label key={key} className="block text-sm text-white/70">
            {key}
            <textarea
              value={value}
              onChange={(e) => setData({ ...data, [key]: e.target.value })}
              className="mt-1 min-h-32 w-full rounded-md border border-white/10 bg-black/30 px-3 py-2"
            />
          </label>
        ) : (
          <label key={key} className="block text-sm text-white/70">
            {key}
            <input
              value={value}
              onChange={(e) => setData({ ...data, [key]: e.target.value })}
              className="mt-1 w-full rounded-md border border-white/10 bg-black/30 px-3 py-2"
            />
          </label>
        ),
      )}
      <button className="rounded-md bg-[#ED2F78] px-4 py-2 text-sm">Αποθήκευση</button>
    </form>
  );
}
