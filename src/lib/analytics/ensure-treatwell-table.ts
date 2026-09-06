import { prisma } from "@/lib/db";

let ensured = false;

/** Idempotent safety net if migrate deploy didn't run in build. */
export async function ensureTreatwellClickTable() {
  if (ensured) return;
  try {
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "TreatwellClick" (
        "id" TEXT NOT NULL,
        "source" TEXT NOT NULL,
        "path" TEXT NOT NULL DEFAULT '/',
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "TreatwellClick_pkey" PRIMARY KEY ("id")
      )
    `);
    await prisma.$executeRawUnsafe(
      `CREATE INDEX IF NOT EXISTS "TreatwellClick_createdAt_idx" ON "TreatwellClick"("createdAt")`,
    );
    await prisma.$executeRawUnsafe(
      `CREATE INDEX IF NOT EXISTS "TreatwellClick_source_idx" ON "TreatwellClick"("source")`,
    );
    await prisma.$executeRawUnsafe(
      `CREATE INDEX IF NOT EXISTS "TreatwellClick_source_createdAt_idx" ON "TreatwellClick"("source", "createdAt")`,
    );
    ensured = true;
  } catch (error) {
    // Table may already exist / permissions — caller still tries normal queries.
    console.error("[ensureTreatwellClickTable]", error);
  }
}
