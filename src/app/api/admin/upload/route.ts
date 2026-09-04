import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi, jsonError } from "@/lib/api";
import { saveOptimizedImage } from "@/lib/storage/uploads";
import { writeAuditLog } from "@/lib/auth/audit";

export async function POST(req: NextRequest) {
  const { user, response } = await requireAdminApi();
  if (response) return response;
  const form = await req.formData();
  const file = form.get("file");
  const folder = String(form.get("folder") || "general");
  if (!(file instanceof File)) return jsonError("Missing file");
  try {
    const url = await saveOptimizedImage(file, folder);
    await writeAuditLog({
      userId: user!.id,
      action: "upload",
      entity: "File",
      details: { url, folder },
    });
    return NextResponse.json({ url });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "UPLOAD_FAILED";
    if (msg === "UNSUPPORTED_TYPE") return jsonError("Μη υποστηριζόμενος τύπος αρχείου");
    if (msg === "FILE_TOO_LARGE") return jsonError("Το αρχείο είναι πολύ μεγάλο");
    return jsonError("Αποτυχία ανεβάσματος", 500);
  }
}
