"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "@/components/admin/toast";

type Category = { id: string; name: string };
type Service = {
  id: string;
  name: string;
  slug: string;
  categoryId: string;
  description: string | null;
  price: string | number | null;
  priceFrom: boolean;
  durationMin: number | null;
  durationMax: number | null;
  durationLabel: string | null;
  featured: boolean;
  active: boolean;
  pendingData: boolean;
  displayOrder: number;
  category?: Category;
};

const empty = {
  name: "",
  categoryId: "",
  description: "",
  price: "",
  priceFrom: false,
  durationMin: "",
  durationMax: "",
  durationLabel: "",
  featured: false,
  active: true,
  pendingData: false,
  displayOrder: "0",
};

export function ServicesAdmin({
  initialServices,
  categories,
  featuredOnly = false,
}: {
  initialServices: Service[];
  categories: Category[];
  featuredOnly?: boolean;
}) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [editing, setEditing] = useState<Service | null>(null);
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);

  const list = useMemo(() => {
    return initialServices.filter((s) => {
      if (featuredOnly && !s.featured) return false;
      const query = q.trim().toLowerCase();
      if (!query) return true;
      return s.name.toLowerCase().includes(query) || s.category?.name.toLowerCase().includes(query);
    });
  }, [initialServices, q, featuredOnly]);

  function startCreate() {
    setEditing(null);
    setForm({ ...empty, categoryId: categories[0]?.id || "" });
  }

  function startEdit(s: Service) {
    setEditing(s);
    setForm({
      name: s.name,
      categoryId: s.categoryId,
      description: s.description || "",
      price: s.price?.toString() || "",
      priceFrom: s.priceFrom,
      durationMin: s.durationMin?.toString() || "",
      durationMax: s.durationMax?.toString() || "",
      durationLabel: s.durationLabel || "",
      featured: s.featured,
      active: s.active,
      pendingData: s.pendingData,
      displayOrder: String(s.displayOrder),
    });
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    const payload = {
      name: form.name,
      categoryId: form.categoryId,
      description: form.description || null,
      price: form.price === "" ? null : Number(form.price),
      priceFrom: form.priceFrom,
      durationMin: form.durationMin === "" ? null : Number(form.durationMin),
      durationMax: form.durationMax === "" ? null : Number(form.durationMax),
      durationLabel: form.durationLabel || null,
      featured: form.featured,
      active: form.active,
      pendingData: form.pendingData,
      displayOrder: Number(form.displayOrder) || 0,
    };
    const res = await fetch(editing ? `/api/admin/services/${editing.id}` : "/api/admin/services", {
      method: editing ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    setSaving(false);
    if (!res.ok) {
      toast("Αποτυχία αποθήκευσης", "error");
      return;
    }
    toast(editing ? "Ενημερώθηκε" : "Δημιουργήθηκε");
    setEditing(null);
    setForm(empty);
    router.refresh();
  }

  async function remove(id: string) {
    if (!confirm("Διαγραφή υπηρεσίας;")) return;
    const res = await fetch(`/api/admin/services/${id}`, { method: "DELETE" });
    if (!res.ok) {
      toast("Αποτυχία διαγραφής", "error");
      return;
    }
    toast("Διαγράφηκε");
    router.refresh();
  }

  async function toggle(id: string, patch: Partial<Service>) {
    const res = await fetch(`/api/admin/services/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    if (!res.ok) toast("Σφάλμα", "error");
    else {
      toast("Ενημερώθηκε");
      router.refresh();
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Αναζήτηση..."
          className="rounded-md border border-white/10 bg-black/30 px-3 py-2 text-sm"
        />
        <button
          type="button"
          onClick={startCreate}
          className="rounded-md bg-[#ED2F78] px-4 py-2 text-sm font-medium"
        >
          Νέα υπηρεσία
        </button>
      </div>

      {(editing || form.categoryId) && (
        <form onSubmit={onSubmit} className="grid gap-3 rounded-xl border border-white/10 bg-[#17171A] p-4 md:grid-cols-2">
          <h2 className="md:col-span-2 text-lg">{editing ? "Επεξεργασία" : "Νέα υπηρεσία"}</h2>
          <input
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Όνομα"
            className="rounded-md border border-white/10 bg-black/30 px-3 py-2"
          />
          <select
            required
            value={form.categoryId}
            onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
            className="rounded-md border border-white/10 bg-black/30 px-3 py-2"
          >
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Περιγραφή"
            className="md:col-span-2 min-h-24 rounded-md border border-white/10 bg-black/30 px-3 py-2"
          />
          <input
            value={form.price}
            onChange={(e) => setForm({ ...form, price: e.target.value })}
            placeholder="Τιμή (€)"
            className="rounded-md border border-white/10 bg-black/30 px-3 py-2"
          />
          <input
            value={form.durationLabel}
            onChange={(e) => setForm({ ...form, durationLabel: e.target.value })}
            placeholder="Διάρκεια (ετικέτα)"
            className="rounded-md border border-white/10 bg-black/30 px-3 py-2"
          />
          <input
            value={form.durationMin}
            onChange={(e) => setForm({ ...form, durationMin: e.target.value })}
            placeholder="Διάρκεια min (λεπτά)"
            className="rounded-md border border-white/10 bg-black/30 px-3 py-2"
          />
          <input
            value={form.durationMax}
            onChange={(e) => setForm({ ...form, durationMax: e.target.value })}
            placeholder="Διάρκεια max (λεπτά)"
            className="rounded-md border border-white/10 bg-black/30 px-3 py-2"
          />
          <input
            value={form.displayOrder}
            onChange={(e) => setForm({ ...form, displayOrder: e.target.value })}
            placeholder="Display order"
            className="rounded-md border border-white/10 bg-black/30 px-3 py-2"
          />
          <div className="flex flex-wrap gap-4 text-sm">
            {[
              ["priceFrom", "Από τιμή"],
              ["featured", "Featured"],
              ["active", "Active"],
              ["pendingData", "Pending data"],
            ].map(([key, label]) => (
              <label key={key} className="inline-flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={Boolean(form[key as keyof typeof form])}
                  onChange={(e) => setForm({ ...form, [key]: e.target.checked })}
                />
                {label}
              </label>
            ))}
          </div>
          <div className="md:col-span-2 flex gap-2">
            <button disabled={saving} className="rounded-md bg-[#ED2F78] px-4 py-2 text-sm">
              {saving ? "Αποθήκευση..." : "Αποθήκευση"}
            </button>
            <button
              type="button"
              onClick={() => {
                setEditing(null);
                setForm(empty);
              }}
              className="rounded-md bg-white/10 px-4 py-2 text-sm"
            >
              Άκυρο
            </button>
          </div>
        </form>
      )}

      <div className="overflow-x-auto rounded-xl border border-white/10">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-white/5 text-white/60">
            <tr>
              <th className="px-3 py-3">Όνομα</th>
              <th className="px-3 py-3">Κατηγορία</th>
              <th className="px-3 py-3">Τιμή</th>
              <th className="px-3 py-3">Flags</th>
              <th className="px-3 py-3">Ενέργειες</th>
            </tr>
          </thead>
          <tbody>
            {list.map((s) => (
              <tr key={s.id} className="border-t border-white/5">
                <td className="px-3 py-3">{s.name}</td>
                <td className="px-3 py-3 text-white/60">{s.category?.name}</td>
                <td className="px-3 py-3">
                  {s.pendingData ? "pending" : s.price != null ? `€${s.price}` : "—"}
                </td>
                <td className="px-3 py-3 text-xs text-white/50">
                  {s.active ? "active" : "off"} {s.featured ? "· featured" : ""}
                </td>
                <td className="px-3 py-3">
                  <div className="flex flex-wrap gap-2">
                    <button type="button" onClick={() => startEdit(s)} className="text-[#FF3F87]">
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => toggle(s.id, { featured: !s.featured })}
                      className="text-white/70"
                    >
                      {s.featured ? "Unfeature" : "Feature"}
                    </button>
                    <button
                      type="button"
                      onClick={() => toggle(s.id, { active: !s.active })}
                      className="text-white/70"
                    >
                      {s.active ? "Deactivate" : "Activate"}
                    </button>
                    <button type="button" onClick={() => remove(s.id)} className="text-red-400">
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
