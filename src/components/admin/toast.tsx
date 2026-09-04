"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

type Toast = { id: number; message: string; type: "success" | "error" };

let pushToast: ((message: string, type?: "success" | "error") => void) | null = null;

export function toast(message: string, type: "success" | "error" = "success") {
  pushToast?.(message, type);
}

export function ToastHost() {
  const [items, setItems] = useState<Toast[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    pushToast = (message, type = "success") => {
      const id = Date.now() + Math.random();
      setItems((prev) => [...prev, { id, message, type }]);
      setTimeout(() => setItems((prev) => prev.filter((t) => t.id !== id)), 3200);
    };
    return () => {
      pushToast = null;
    };
  }, []);

  if (!mounted) return null;

  return createPortal(
    <div className="pointer-events-none fixed right-4 top-4 z-[100] flex w-80 flex-col gap-2">
      {items.map((t) => (
        <div
          key={t.id}
          className={`rounded-md px-4 py-3 text-sm text-white shadow-lg ${
            t.type === "success" ? "bg-[#17171A]" : "bg-red-600"
          }`}
        >
          {t.message}
        </div>
      ))}
    </div>,
    document.body,
  );
}
