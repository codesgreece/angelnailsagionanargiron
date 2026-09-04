import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/session";

export async function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export async function requireAdminApi() {
  const user = await getSessionUser();
  if (!user) {
    return { user: null, response: jsonError("Unauthorized", 401) };
  }
  return { user, response: null };
}

export function parseDecimal(value: unknown) {
  if (value === null || value === undefined || value === "") return null;
  const n = typeof value === "number" ? value : Number(value);
  if (Number.isNaN(n)) return null;
  return n;
}
