/**
 * Tests for src/lib/import/image.ts — image download + validation + storage.
 *
 * Mocks: safeFetchBytes, validateMagicBytes, validateFileSize, writeFile, prisma.
 */

jest.mock("@/lib/import/fetch", () => ({ safeFetchBytes: jest.fn() }));
jest.mock("@/lib/upload", () => ({
  validateFileSize: jest.fn(),
  validateMagicBytes: jest.fn(),
  generateFilename: jest.fn(() => "uuid-photo.jpg"),
  getUploadDir: jest.fn(() => "/tmp/uploads-test"),
  MAX_FILE_SIZE: 10 * 1024 * 1024,
}));
jest.mock("fs/promises", () => ({
  writeFile: jest.fn(),
  mkdir: jest.fn(),
  unlink: jest.fn(),
}));
jest.mock("@/lib/db", () => ({
  prisma: { photo: { create: jest.fn() } },
}));

import { downloadAndStoreImage } from "@/lib/import/image";
import { safeFetchBytes } from "@/lib/import/fetch";
import { validateMagicBytes, validateFileSize } from "@/lib/upload";
import { writeFile } from "fs/promises";
import { prisma } from "@/lib/db";

const mockFetchBytes = safeFetchBytes as jest.MockedFunction<typeof safeFetchBytes>;
const mockMagic = validateMagicBytes as jest.MockedFunction<typeof validateMagicBytes>;
const mockSize = validateFileSize as jest.MockedFunction<typeof validateFileSize>;
const mockWrite = writeFile as jest.MockedFunction<typeof writeFile>;
const mockCreate = prisma.photo.create as jest.MockedFunction<typeof prisma.photo.create>;

beforeEach(() => jest.clearAllMocks());

const FAKE_JPEG = Buffer.from([0xff, 0xd8, 0xff, 0xe0]);

test("successful download returns photo id and url", async () => {
  mockFetchBytes.mockResolvedValue({ bytes: FAKE_JPEG, contentType: "image/jpeg" });
  mockSize.mockReturnValue(null);
  mockMagic.mockReturnValue("image/jpeg");
  mockWrite.mockResolvedValue(undefined as never);
  mockCreate.mockResolvedValue({ id: "photo-1", url: "/api/uploads/uuid-photo.jpg", alt: null, sortOrder: 0, recipeId: null } as never);

  const result = await downloadAndStoreImage("https://example.com/photo.jpg");
  expect(result).toEqual({ id: "photo-1", url: "/api/uploads/uuid-photo.jpg" });
});

test("returns null when fetch fails (network error)", async () => {
  mockFetchBytes.mockRejectedValue(new Error("timeout"));
  const result = await downloadAndStoreImage("https://example.com/photo.jpg");
  expect(result).toBeNull();
  expect(mockWrite).not.toHaveBeenCalled();
});

test("returns null when image exceeds size limit", async () => {
  mockFetchBytes.mockResolvedValue({ bytes: Buffer.alloc(100), contentType: "image/jpeg" });
  mockSize.mockReturnValue("File too large");
  const result = await downloadAndStoreImage("https://example.com/photo.jpg");
  expect(result).toBeNull();
  expect(mockWrite).not.toHaveBeenCalled();
});

test("returns null when magic bytes don't match claimed type", async () => {
  mockFetchBytes.mockResolvedValue({ bytes: Buffer.from("not an image"), contentType: "image/jpeg" });
  mockSize.mockReturnValue(null);
  mockMagic.mockReturnValue(null); // no recognised magic bytes
  const result = await downloadAndStoreImage("https://example.com/bad.jpg");
  expect(result).toBeNull();
  expect(mockWrite).not.toHaveBeenCalled();
});

test("returns null when disk write fails but does not throw", async () => {
  mockFetchBytes.mockResolvedValue({ bytes: FAKE_JPEG, contentType: "image/jpeg" });
  mockSize.mockReturnValue(null);
  mockMagic.mockReturnValue("image/jpeg");
  mockWrite.mockRejectedValue(new Error("disk full"));
  const result = await downloadAndStoreImage("https://example.com/photo.jpg");
  expect(result).toBeNull();
});
