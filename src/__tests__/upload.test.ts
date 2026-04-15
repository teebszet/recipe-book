import {
  validateFileSize,
  validateMagicBytes,
  generateFilename,
  getUploadDir,
  MAX_FILE_SIZE,
} from "@/lib/upload";

describe("validateFileSize", () => {
  it("returns null for files under limit", () => {
    expect(validateFileSize(1024)).toBeNull();
    expect(validateFileSize(MAX_FILE_SIZE)).toBeNull();
  });

  it("returns error for files over 10MB", () => {
    const result = validateFileSize(MAX_FILE_SIZE + 1);
    expect(result).toContain("File too large");
    expect(result).toContain("10MB");
  });
});

describe("validateMagicBytes", () => {
  it("detects JPEG files", () => {
    const buffer = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x00]);
    expect(validateMagicBytes(buffer)).toBe("image/jpeg");
  });

  it("detects PNG files", () => {
    const buffer = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a]);
    expect(validateMagicBytes(buffer)).toBe("image/png");
  });

  it("detects WebP files", () => {
    // RIFF....WEBP
    const buffer = Buffer.alloc(12);
    buffer[0] = 0x52; // R
    buffer[1] = 0x49; // I
    buffer[2] = 0x46; // F
    buffer[3] = 0x46; // F
    buffer[8] = 0x57; // W
    buffer[9] = 0x45; // E
    buffer[10] = 0x42; // B
    buffer[11] = 0x50; // P
    expect(validateMagicBytes(buffer)).toBe("image/webp");
  });

  it("rejects RIFF without WEBP marker", () => {
    const buffer = Buffer.alloc(12);
    buffer[0] = 0x52;
    buffer[1] = 0x49;
    buffer[2] = 0x46;
    buffer[3] = 0x46;
    // No WEBP at offset 8
    expect(validateMagicBytes(buffer)).toBeNull();
  });

  it("rejects unknown file types", () => {
    const buffer = Buffer.from([0x00, 0x00, 0x00, 0x00]);
    expect(validateMagicBytes(buffer)).toBeNull();
  });

  it("rejects empty buffer", () => {
    const buffer = Buffer.alloc(0);
    expect(validateMagicBytes(buffer)).toBeNull();
  });
});

describe("generateFilename", () => {
  it("generates UUID filename with .jpg extension for JPEG", () => {
    const name = generateFilename("image/jpeg");
    expect(name).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.jpg$/
    );
  });

  it("generates UUID filename with .png extension for PNG", () => {
    const name = generateFilename("image/png");
    expect(name).toMatch(/\.png$/);
  });

  it("generates UUID filename with .webp extension for WebP", () => {
    const name = generateFilename("image/webp");
    expect(name).toMatch(/\.webp$/);
  });

  it("generates unique filenames", () => {
    const name1 = generateFilename("image/jpeg");
    const name2 = generateFilename("image/jpeg");
    expect(name1).not.toBe(name2);
  });

  it("uses .bin for unknown mime types", () => {
    const name = generateFilename("application/octet-stream");
    expect(name).toMatch(/\.bin$/);
  });
});

describe("getUploadDir", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it("returns UPLOAD_DIR env var when set", () => {
    process.env.UPLOAD_DIR = "/data/uploads";
    expect(getUploadDir()).toBe("/data/uploads");
  });

  it("returns default public/uploads when env not set", () => {
    delete process.env.UPLOAD_DIR;
    const result = getUploadDir();
    expect(result).toContain("public/uploads");
  });
});
