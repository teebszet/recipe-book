import { randomUUID } from "crypto";
import path from "path";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

const MAGIC_BYTES: Record<string, number[][]> = {
  "image/jpeg": [[0xff, 0xd8, 0xff]],
  "image/png": [[0x89, 0x50, 0x4e, 0x47]],
  "image/webp": [[0x52, 0x49, 0x46, 0x46]], // RIFF header
};

const EXTENSION_MAP: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
};

export function getUploadDir(): string {
  return process.env.UPLOAD_DIR || path.join(process.cwd(), "public/uploads");
}

export function validateFileSize(size: number): string | null {
  if (size > MAX_FILE_SIZE) {
    return `File too large. Maximum size is ${MAX_FILE_SIZE / 1024 / 1024}MB`;
  }
  return null;
}

export function validateMagicBytes(buffer: Buffer): string | null {
  for (const [mimeType, patterns] of Object.entries(MAGIC_BYTES)) {
    for (const pattern of patterns) {
      if (pattern.every((byte, i) => buffer[i] === byte)) {
        if (mimeType === "image/webp") {
          // WebP also needs WEBP at offset 8
          if (
            buffer[8] === 0x57 &&
            buffer[9] === 0x45 &&
            buffer[10] === 0x42 &&
            buffer[11] === 0x50
          ) {
            return mimeType;
          }
          continue;
        }
        return mimeType;
      }
    }
  }
  return null;
}

export function generateFilename(mimeType: string): string {
  const ext = EXTENSION_MAP[mimeType] || ".bin";
  return `${randomUUID()}${ext}`;
}

export { MAX_FILE_SIZE };
