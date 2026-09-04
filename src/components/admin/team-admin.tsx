"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "@/components/admin/toast";

type Member = {
  id: string;
  name: string;
  role: string | null;
  services: string | null;
  bio: string | null;
  photoUrl: string | null;
  displayOrder: number;
  active: boolean;
};

export function TeamAdmin({ initial }: { initial: Member[] }) {
  const router = useRouter();
  const [editing, setEditing] = useState<Member | null>(null);
  const [form, setForm] = useState({
    name: "",
    role: "",
    services: "",
    bio: "",
    displayOrder: "0",
    active: true,
  });

  async function save(e: FormEvent) {
    e.preventDefault();
    const payload = {
      name: form.name,
      role: form.role || null,
      services: form.services || null,
      bio: form.bio || null,
      displayOrder: Number(form.displayOrder) || 0,
      active: form.active,
    };
    const res = await fetch(editing ? `/api/admin/team/${editing.id}` : "/api/admin/team", {
      method: editing ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) return toast("Σφάλμα", "error");
    toast("Αποθηκεύτηκε");
    setEditing(null);
    setForm({ name: "", role: "", services: "", bio: "", displayOrder: "0", active: true });
    router.refresh();
  }

  async function remove(id: string) {
    if (!confirm("Διαγραφή μέλους;")) return;
    const res = await fetch(`/api/admin/team/${id}`, { method: "DELETE" });
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
          placeholder="Όνομα"
          className="rounded-md border border-white/10 bg-black/30 px-3 py-2"
        />
        <input
          value={form.role}
          onChange={(e) => setForm({ ...form, role: e.target.value })}
          placeholder="Ρόλος"
          className="rounded-md border border-white/10 bg-black/30 px-3 py-2"
        />
        <input
          value={form.services}
          onChange={(e) => setForm({ ...form, services: e.target.value })}
          placeholder="Υπηρεσίες"
          className="rounded-md border border-white/10 bg-black/30 px-3 py-2"
        />
        <input
          value={form.displayOrder}
          onChange={(e) => setForm({ ...form, displayOrder: e.target.value })}
          placeholder="Order"
          className="rounded-md border border-white/10 bg-black/30 px-3 py-2"
        />
        <textarea
          value={form.bio}
          onChange={(e) => setForm({ ...form, bio: e.target.value })}
          placeholder="Bio"
          className="md:col-span-2 min-h-20 rounded-md border border-white/10 bg-black/30 px-3 py-2"
        />
        <button className="rounded-md bg-[#ED2F78] px-4 py-2 text-sm">{editing ? "Ενημέρωση" : "Προσθήκη"}</button>
      </form>

      <div className="grid gap-3 md:grid-cols-2">
        {initial.map((m) => (
          <article key={m.id} className="rounded-xl border border-white/10 bg-[#17171A] p-4">
            <h3 className="text-lg">{m.name}</h3>
            <p className="text-sm text-white/50">{m.role}</p>
            <p className="mt-2 text-sm text-white/70">{m.services}</p>
            <div className="mt-3 flex gap-3 text-sm">
              <button
                type="button"
                className="text-[#FF3F87]"
                onClick={() => {
                  setEditing(m);
                  setForm({
                    name: m.name,
                    role: m.role || "",
                    services: m.services || "",
                    bio: m.bio || "",
                    displayOrder: String(m.displayOrder),
                    active: m.active,
                  });
                }}
              >
                Edit
              </button>
              <button type="button" className="text-red-400" onClick={() => remove(m.id)}>
                Delete
              </button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
