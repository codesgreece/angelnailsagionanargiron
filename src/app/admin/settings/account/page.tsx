"use client";
import { FormEvent, useState } from "react";
import { toast } from "@/components/admin/toast";

export default function AccountPage() {
  const [form, setForm] = useState({ name: "", email: "", currentPassword: "", newPassword: "" });
  async function save(e: FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/admin/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ section: "admin-user", data: form }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      return toast(data.error || "Σφάλμα", "error");
    }
    toast("Ενημερώθηκε ο λογαριασμός");
  }
  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-semibold">Admin user</h1>
      <form onSubmit={save} className="grid max-w-lg gap-3 rounded-xl border border-white/10 bg-[#17171A] p-5">
        {(["name", "email", "currentPassword", "newPassword"] as const).map((key) => (
          <label key={key} className="block text-sm text-white/70">
            {key}
            <input
              type={key.toLowerCase().includes("password") ? "password" : key === "email" ? "email" : "text"}
              value={form[key]}
              onChange={(e) => setForm({ ...form, [key]: e.target.value })}
              className="mt-1 w-full rounded-md border border-white/10 bg-black/30 px-3 py-2"
            />
          </label>
        ))}
        <button className="rounded-md bg-[#ED2F78] px-4 py-2 text-sm">Αποθήκευση</button>
      </form>
    </div>
  );
}
