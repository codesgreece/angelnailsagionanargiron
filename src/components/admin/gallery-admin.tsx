"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "@/components/admin/toast";

type Img = {
  id: string;
  title: string | null;
  category: string;
  description: string | null;
  altText: string | null;
  imageUrl: string;
  featured: boolean;
  active: boolean;
  displayOrder: number;
};

export function GalleryAdmin({ initial, mode = "list" }: { initial: Img[]; mode?: "list" | "upload" }) {
  const router = useRouter();
  const [uploading, setUploading] = useState(false);
  const [category, setCategory] = useState("Νύχια");

  async function onUpload(files: FileList | null) {
    if (!files?.length) return;
    setUploading(true);
    const fd = new FormData();
    Array.from(files).forEach((f) => fd.append("files", f));
    fd.append("category", category);
    const res = await fetch("/api/admin/gallery", { method: "POST", body: fd });
    setUploading(false);
    if (!res.ok) return toast("Αποτυχία upload", "error");
    toast("Ανέβηκαν εικόνες");
    router.refresh();
  }

  async function patch(id: string, data: Partial<Img>) {
    const res = await fetch(`/api/admin/gallery/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) return toast("Σφάλμα", "error");
    toast("Ενημερώθηκε");
    router.refresh();
  }

  async function remove(id: string) {
    if (!confirm("Διαγραφή εικόνας;")) return;
    const res = await fetch("/api/admin/gallery", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    if (!res.ok) return toast("Σφάλμα", "error");
    toast("Διαγράφηκε");
    router.refresh();
  }

  return (
    <div className="space-y-6">
      {(mode === "upload" || true) && (
        <div className="rounded-xl border border-dashed border-white/20 bg-[#17171A] p-6">
          <div className="mb-3 flex flex-wrap gap-3">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="rounded-md border border-white/10 bg-black/30 px-3 py-2 text-sm"
            >
              {["Νύχια", "Manicure", "Pedicure", "Nail Art", "Χώρος"].map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
            <label className="cursor-pointer rounded-md bg-[#ED2F78] px-4 py-2 text-sm">
              {uploading ? "Uploading..." : "Επιλογή εικόνων"}
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                multiple
                className="hidden"
                onChange={(e) => onUpload(e.target.files)}
              />
            </label>
          </div>
          <p className="text-sm text-white/50">Drag files via file picker · WebP optimization · max 5MB</p>
        </div>
      )}

      {mode !== "upload" && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {initial.length === 0 && (
            <p className="text-white/50">Δεν υπάρχουν εικόνες ακόμη. Ανεβάστε από Upload.</p>
          )}
          {initial.map((img) => (
            <article key={img.id} className="overflow-hidden rounded-xl border border-white/10 bg-[#17171A]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img.imageUrl} alt={img.altText || ""} className="h-40 w-full object-cover" />
              <div className="space-y-2 p-3 text-sm">
                <input
                  defaultValue={img.title || ""}
                  placeholder="Title"
                  className="w-full rounded-md border border-white/10 bg-black/30 px-2 py-1"
                  onBlur={(e) => patch(img.id, { title: e.target.value })}
                />
                <select
                  defaultValue={img.category}
                  className="w-full rounded-md border border-white/10 bg-black/30 px-2 py-1"
                  onChange={(e) => patch(img.id, { category: e.target.value })}
                >
                  {["Νύχια", "Manicure", "Pedicure", "Nail Art", "Χώρος"].map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
                <input
                  defaultValue={img.altText || ""}
                  placeholder="Alt text"
                  className="w-full rounded-md border border-white/10 bg-black/30 px-2 py-1"
                  onBlur={(e) => patch(img.id, { altText: e.target.value })}
                />
                <input
                  type="number"
                  defaultValue={img.displayOrder}
                  className="w-full rounded-md border border-white/10 bg-black/30 px-2 py-1"
                  onBlur={(e) => patch(img.id, { displayOrder: Number(e.target.value) || 0 })}
                />
                <div className="flex flex-wrap gap-2">
                  <button type="button" onClick={() => patch(img.id, { featured: !img.featured })}>
                    {img.featured ? "Unfeature" : "Feature"}
                  </button>
                  <button type="button" onClick={() => patch(img.id, { active: !img.active })}>
                    {img.active ? "Hide" : "Show"}
                  </button>
                  <button type="button" className="text-red-400" onClick={() => remove(img.id)}>
                    Delete
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
