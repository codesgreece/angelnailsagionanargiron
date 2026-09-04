import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { createHash, randomBytes } from "crypto";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";

const COOKIE_NAME = "angel_admin_session";
const SESSION_DAYS = 7;

function getSecret() {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 16) {
    throw new Error("AUTH_SECRET must be set (min 16 chars)");
  }
  return new TextEncoder().encode(secret);
}

export function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export async function createSession(userId: string, meta?: { ip?: string; userAgent?: string }) {
  const token = randomBytes(32).toString("hex");
  const tokenHash = hashToken(token);
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);

  await prisma.session.create({
    data: {
      tokenHash,
      userId,
      expiresAt,
      ip: meta?.ip,
      userAgent: meta?.userAgent,
    },
  });

  const jwt = await new SignJWT({ sid: tokenHash, uid: userId })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime(`${SESSION_DAYS}d`)
    .setIssuedAt()
    .sign(getSecret());

  const jar = await cookies();
  jar.set(COOKIE_NAME, jwt, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });

  return token;
}

export async function destroySession() {
  const jar = await cookies();
  const value = jar.get(COOKIE_NAME)?.value;
  if (value) {
    try {
      const { payload } = await jwtVerify(value, getSecret());
      const sid = payload.sid as string | undefined;
      if (sid) {
        await prisma.session.deleteMany({ where: { tokenHash: sid } });
      }
    } catch {
      // ignore invalid token
    }
  }
  jar.set(COOKIE_NAME, "", { httpOnly: true, path: "/", expires: new Date(0) });
}

export async function getSessionUser() {
  const jar = await cookies();
  const value = jar.get(COOKIE_NAME)?.value;
  if (!value) return null;

  try {
    const { payload } = await jwtVerify(value, getSecret());
    const sid = payload.sid as string | undefined;
    const uid = payload.uid as string | undefined;
    if (!sid || !uid) return null;

    const session = await prisma.session.findUnique({
      where: { tokenHash: sid },
      include: { user: true },
    });

    if (!session || session.expiresAt < new Date() || !session.user.active) {
      return null;
    }

    return session.user;
  } catch {
    return null;
  }
}

export async function requireAdmin() {
  const user = await getSessionUser();
  if (!user) {
    throw new Error("UNAUTHORIZED");
  }
  return user;
}

export async function checkLoginRateLimit(email: string, ip?: string | null) {
  const since = new Date(Date.now() - 15 * 60 * 1000);
  const failed = await prisma.loginAttempt.count({
    where: {
      success: false,
      createdAt: { gte: since },
      OR: [{ email: email.toLowerCase() }, ...(ip ? [{ ip }] : [])],
    },
  });
  return failed < 8;
}

export async function recordLoginAttempt(email: string, success: boolean, ip?: string | null) {
  await prisma.loginAttempt.create({
    data: { email: email.toLowerCase(), success, ip: ip || undefined },
  });
}

export { COOKIE_NAME };
