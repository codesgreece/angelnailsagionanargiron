import { NextResponse } from "next/server";
import { destroySession, getSessionUser } from "@/lib/auth/session";
import { writeAuditLog } from "@/lib/auth/audit";

export async function POST() {
  const user = await getSessionUser();
  await destroySession();
  if (user) {
    await writeAuditLog({
      userId: user.id,
      action: "logout",
      entity: "AdminUser",
      entityId: user.id,
    });
  }
  return NextResponse.json({ ok: true });
}
