#!/usr/bin/env node
/**
 * Prisma migrate deploy with retries.
 * Continues the build even if migrate fails after retries so production
 * can still ship (table is also ensured at runtime).
 */
const { execSync } = require("node:child_process");

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      console.log(`[migrate] attempt ${attempt}/3`);
      execSync("npx prisma migrate deploy", { stdio: "inherit", env: process.env });
      console.log("[migrate] success");
      return;
    } catch {
      console.warn(`[migrate] attempt ${attempt} failed`);
      if (attempt < 3) await sleep(3000 * attempt);
    }
  }
  console.warn(
    "[migrate] all attempts failed — continuing build (runtime ensure will create table if needed)",
  );
}

main().catch((err) => {
  console.error("[migrate] unexpected error", err);
  // Do not fail the build
});
