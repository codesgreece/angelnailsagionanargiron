"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "@/components/admin/toast";

export function LegalEditor({
  slug,
  initialTitle,
  initialContent,
}: {
  slug: string;
  initialTitle: string;
  initialContent: string;
}) {
  const router = useRouter();
  const [title, setTitle] = useState(initialTitle);
  const [content, setContent] = useState(initialContent);

  async function save(e: FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/admin/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ section: "legal", data: { slug, title, content } }),
    });
    if (!res.ok) return toast("Σφάλμα", "error");
    toast("Αποθηκεύτηκε");
    router.refresh();
  }

  return (
    <form onSubmit={save} className="space-y-4 rounded-xl border border-white/10 bg-[#17171A] p-5">
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="w-full rounded-md border border-white/10 bg-black/30 px-3 py-2"
      />
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="min-h-[420px] w-full rounded-md border border-white/10 bg-black/30 px-3 py-2 font-mono text-sm"
      />
      <button className="rounded-md bg-[#ED2F78] px-4 py-2 text-sm">Αποθήκευση</button>
    </form>
  );
}
