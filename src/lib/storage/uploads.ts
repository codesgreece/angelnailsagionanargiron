import { mkdir, unlink } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";
import sharp from "sharp";

const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

export function getUploadRoot() {
  return path.join(process.cwd(), process.env.UPLOAD_DIR || "public/uploads");
}

export function getMaxUploadBytes() {
  return Number(process.env.MAX_UPLOAD_BYTES || 5 * 1024 * 1024);
}

export async function saveOptimizedImage(file: File, folder = "general") {
  if (!ALLOWED.has(file.type)) {
    throw new Error("UNSUPPORTED_TYPE");
  }
  if (file.size > getMaxUploadBytes()) {
    throw new Error("FILE_TOO_LARGE");
  }

  const safeFolder = folder.replace(/[^a-zA-Z0-9_-]/g, "");
  const dir = path.join(getUploadRoot(), safeFolder);
  await mkdir(dir, { recursive: true });

  const buffer = Buffer.from(await file.arrayBuffer());
  const filename = `${Date.now()}-${randomUUID()}.webp`;
  const dest = path.join(dir, filename);

  // Prevent path traversal
  const resolved = path.resolve(dest);
  if (!resolved.startsWith(path.resolve(getUploadRoot()))) {
    throw new Error("INVALID_PATH");
  }

  await sharp(buffer)
    .rotate()
    .resize({ width: 2400, height: 2400, fit: "inside", withoutEnlargement: true })
    .webp({ quality: 88 })
    .toFile(dest);

  return `/uploads/${safeFolder}/${filename}`;
}

export async function deleteUploadedFile(publicUrl: string) {
  if (!publicUrl.startsWith("/uploads/")) return;
  const relative = publicUrl.replace(/^\//, "");
  const full = path.join(process.cwd(), "public", relative);
  const resolved = path.resolve(full);
  if (!resolved.startsWith(path.resolve(getUploadRoot()))) return;
  try {
    await unlink(resolved);
  } catch {
    // ignore missing
  }
}
