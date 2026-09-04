import { prisma } from "@/lib/db";

export async function writeAuditLog(params: {
  userId?: string | null;
  action: string;
  entity: string;
  entityId?: string | null;
  details?: string | Record<string, unknown> | null;
}) {
  await prisma.auditLog.create({
    data: {
      userId: params.userId || undefined,
      action: params.action,
      entity: params.entity,
      entityId: params.entityId || undefined,
      details:
        typeof params.details === "string"
          ? params.details
          : params.details
            ? JSON.stringify(params.details)
            : undefined,
    },
  });
}
