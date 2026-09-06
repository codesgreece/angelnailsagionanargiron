import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { ensureTreatwellClickTable } from "@/lib/analytics/ensure-treatwell-table";

export async function POST(req: NextRequest) {
  try {
    await ensureTreatwellClickTable();
    const body = await req.json().catch(() => ({}));
    const source =
      typeof body.source === "string" && body.source.trim()
        ? body.source.trim().slice(0, 80)
        : "unknown";
    const path = typeof body.path === "string" ? body.path.slice(0, 200) : "/";

    await prisma.treatwellClick.create({
      data: { source, path },
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
