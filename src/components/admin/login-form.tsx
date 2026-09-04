"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Αποτυχία σύνδεσης");
        return;
      }
      router.push("/admin");
      router.refresh();
    } catch {
      setError("Σφάλμα δικτύου");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="w-full max-w-md space-y-4 rounded-xl border border-white/10 bg-[#17171A] p-8">
      <div>
        <p className="text-3xl text-[#FF3F87]" style={{ fontFamily: "var(--font-script), cursive" }}>
          Angel Nails
        </p>
        <h1 className="mt-2 text-xl text-white">Admin Login</h1>
      </div>
      <label className="block text-sm text-white/70">
        Email
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-1 w-full rounded-md border border-white/10 bg-black/40 px-3 py-2 text-white outline-none focus:border-[#ED2F78]"
        />
      </label>
      <label className="block text-sm text-white/70">
        Password
        <input
          type="password"
          required
          minLength={8}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-1 w-full rounded-md border border-white/10 bg-black/40 px-3 py-2 text-white outline-none focus:border-[#ED2F78]"
        />
      </label>
      {error && <p className="text-sm text-red-400">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-md bg-[#ED2F78] px-4 py-2.5 font-medium text-white hover:bg-[#FF3F87] disabled:opacity-60"
      >
        {loading ? "Σύνδεση..." : "Είσοδος"}
      </button>
    </form>
  );
}
