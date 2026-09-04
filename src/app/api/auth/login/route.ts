import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import {
  checkLoginRateLimit,
  createSession,
  recordLoginAttempt,
  verifyPassword,
} from "@/lib/auth/session";
import { writeAuditLog } from "@/lib/auth/audit";
import { loginSchema } from "@/lib/validations";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Μη έγκυρα στοιχεία" }, { status: 400 });
    }

    const email = parsed.data.email.toLowerCase().trim();
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    const allowed = await checkLoginRateLimit(email, ip);
    if (!allowed) {
      return NextResponse.json(
        { error: "Πολλές αποτυχημένες προσπάθειες. Δοκιμάστε αργότερα." },
        { status: 429 },
      );
    }

    const user = await prisma.adminUser.findUnique({ where: { email } });
    if (!user || !user.active) {
      await recordLoginAttempt(email, false, ip);
      return NextResponse.json({ error: "Λάθος email ή κωδικός" }, { status: 401 });
    }

    const ok = await verifyPassword(parsed.data.password, user.passwordHash);
    if (!ok) {
      await recordLoginAttempt(email, false, ip);
      return NextResponse.json({ error: "Λάθος email ή κωδικός" }, { status: 401 });
    }

    await createSession(user.id, { ip, userAgent: req.headers.get("user-agent") || undefined });
    await prisma.adminUser.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });
    await recordLoginAttempt(email, true, ip);
    await writeAuditLog({
      userId: user.id,
      action: "login",
      entity: "AdminUser",
      entityId: user.id,
    });

    return NextResponse.json({
      ok: true,
      user: { id: user.id, email: user.email, name: user.name },
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Σφάλμα σύνδεσης" }, { status: 500 });
  }
}
