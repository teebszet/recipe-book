import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { safeFetchBytes } from "./fetch";
import {
  validateFileSize,
  validateMagicBytes,
  generateFilename,
  getUploadDir,
  MAX_FILE_SIZE,
} from "@/lib/upload";
import { prisma } from "@/lib/db";

export interface ImportedPhoto {
  id: string;
  url: string;
}

/**
 * Download a remote image URL, validate it, persist to the upload directory,
 * and create a Photo record (with no recipeId — an orphan accepted by design).
 *
 * Returns null (and logs a warning) on any failure so the import can succeed
 * without a photo rather than failing entirely.
 */
export async function downloadAndStoreImage(
  imageUrl: string
): Promise<ImportedPhoto | null> {
  let bytes: Buffer;
  let contentType: string;

  try {
    const result = await safeFetchBytes(imageUrl, {
      maxBytes: MAX_FILE_SIZE,
      allowedContentTypes: ["image/"],
    });
    bytes = result.bytes;
    contentType = result.contentType;
  } catch (err) {
    console.warn(`[import] image download failed for ${imageUrl}:`, err);
    return null;
  }

  // Size check (belt-and-suspenders — safeFetchBytes already caps this)
  const sizeError = validateFileSize(bytes.length);
  if (sizeError) {
    console.warn(`[import] image rejected (size): ${sizeError}`);
    return null;
  }

  // Magic-byte validation
  const detectedMime = validateMagicBytes(bytes);
  if (!detectedMime) {
    console.warn(`[import] image rejected (magic bytes mismatch, claimed ${contentType})`);
    return null;
  }

  // Persist
  const filename = generateFilename(detectedMime);
  const uploadDir = getUploadDir();
  try {
    await mkdir(uploadDir, { recursive: true });
    await writeFile(path.join(uploadDir, filename), bytes);
  } catch (err) {
    console.warn(`[import] failed to write image to disk:`, err);
    return null;
  }

  // Create orphan Photo row (no recipeId — cleaned up in a future GC task)
  try {
    const photo = await prisma.photo.create({
      data: {
        url: `/api/uploads/${filename}`,
        sortOrder: 0,
      },
    });
    return { id: photo.id, url: photo.url };
  } catch (err) {
    console.warn(`[import] failed to create Photo record:`, err);
    // Best-effort cleanup of the file we just wrote
    try {
      const { unlink } = await import("fs/promises");
      await unlink(path.join(uploadDir, filename));
    } catch {}
    return null;
  }
}
