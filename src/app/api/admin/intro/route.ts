import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireAdminApi, jsonError } from "@/lib/api";
import { writeAuditLog } from "@/lib/auth/audit";

const schema = z.object({
  enabled: z.boolean().optional(),
  style: z.enum(["angel-reveal", "logo-reveal", "liquid-chrome", "minimal"]).optional(),
  playFrequency: z.enum(["session", "first", "daily", "always"]).optional(),
  durationMs: z.number().int().min(2000).max(4000).optional(),
  showSkip: z.boolean().optional(),
  showSubtitle: z.boolean().optional(),
  showLoading: z.boolean().optional(),
  showPetals: z.boolean().optional(),
  showParticles: z.boolean().optional(),
  qualityMode: z.enum(["auto", "high", "medium", "low"]).optional(),
  mobileQuality: z.enum(["high", "medium", "low"]).optional(),
});

export async function GET() {
  const { response } = await requireAdminApi();
  if (response) return response;
  const settings = await prisma.introSettings.upsert({
    where: { id: "default" },
    update: {},
    create: { id: "default" },
  });
  return NextResponse.json(settings);
}

export async function PATCH(req: NextRequest) {
  const { user, response } = await requireAdminApi();
  if (response) return response;
  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return jsonError("Μη έγκυρα intro settings");
  const updated = await prisma.introSettings.upsert({
    where: { id: "default" },
    update: parsed.data,
    create: { id: "default", ...parsed.data },
  });
  await writeAuditLog({
    userId: user!.id,
    action: "update",
    entity: "IntroSettings",
    entityId: "default",
    details: parsed.data,
  });
  return NextResponse.json(updated);
}
