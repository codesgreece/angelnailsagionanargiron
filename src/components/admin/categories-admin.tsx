"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "@/components/admin/toast";

type Cat = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  filterGroup: string | null;
  displayOrder: number;
  active: boolean;
};

export function CategoriesAdmin({ initial }: { initial: Cat[] }) {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    filterGroup: "",
    description: "",
    displayOrder: "0",
    active: true,
  });
  const [editing, setEditing] = useState<Cat | null>(null);

  async function save(e: FormEvent) {
    e.preventDefault();
    const payload = {
      name: form.name,
      filterGroup: form.filterGroup || null,
      description: form.description || null,
      displayOrder: Number(form.displayOrder) || 0,
      active: form.active,
    };
    const res = await fetch(editing ? `/api/admin/categories/${editing.id}` : "/api/admin/categories", {
      method: editing ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) return toast("Σφάλμα", "error");
    toast("Αποθηκεύτηκε");
    setEditing(null);
    setForm({ name: "", filterGroup: "", description: "", displayOrder: "0", active: true });
    router.refresh();
  }

  async function remove(id: string) {
    if (!confirm("Διαγραφή κατηγορίας και των υπηρεσιών της;")) return;
    const res = await fetch(`/api/admin/categories/${id}`, { method: "DELETE" });
    if (!res.ok) return toast("Σφάλμα", "error");
    toast("Διαγράφηκε");
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <form onSubmit={save} className="grid gap-3 rounded-xl border border-white/10 bg-[#17171A] p-4 md:grid-cols-2">
        <input
          required
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          placeholder="Όνομα κατηγορίας"
          className="rounded-md border border-white/10 bg-black/30 px-3 py-2"
        />
        <input
          value={form.filterGroup}
          onChange={(e) => setForm({ ...form, filterGroup: e.target.value })}
          placeholder="Filter group (π.χ. Αποτρίχωση)"
          className="rounded-md border border-white/10 bg-black/30 px-3 py-2"
        />
        <input
          value={form.displayOrder}
          onChange={(e) => setForm({ ...form, displayOrder: e.target.value })}
          placeholder="Order"
          className="rounded-md border border-white/10 bg-black/30 px-3 py-2"
        />
        <label className="inline-flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.active}
            onChange={(e) => setForm({ ...form, active: e.target.checked })}
          />
          Active
        </label>
        <textarea
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          placeholder="Περιγραφή"
          className="md:col-span-2 min-h-20 rounded-md border border-white/10 bg-black/30 px-3 py-2"
        />
        <button className="rounded-md bg-[#ED2F78] px-4 py-2 text-sm">{editing ? "Ενημέρωση" : "Προσθήκη"}</button>
      </form>

      <ul className="space-y-2">
        {initial.map((c) => (
          <li key={c.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-white/10 bg-[#17171A] px-4 py-3">
            <div>
              <p className="font-medium">{c.name}</p>
              <p className="text-xs text-white/40">
                {c.filterGroup || "—"} · order {c.displayOrder}
              </p>
            </div>
            <div className="flex gap-3 text-sm">
              <button
                type="button"
                className="text-[#FF3F87]"
                onClick={() => {
                  setEditing(c);
                  setForm({
                    name: c.name,
                    filterGroup: c.filterGroup || "",
                    description: c.description || "",
                    displayOrder: String(c.displayOrder),
                    active: c.active,
                  });
                }}
              >
                Edit
              </button>
              <button type="button" className="text-red-400" onClick={() => remove(c.id)}>
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
