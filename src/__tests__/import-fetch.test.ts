/**
 * Tests for src/lib/import/fetch.ts — safe server-side HTTP fetcher.
 *
 * We mock node's dns/promises and global fetch to test the SSRF protections,
 * size caps, timeouts, and content-type checks without hitting real servers.
 */

import { safeFetchText, safeFetchBytes } from "@/lib/import/fetch";

// ─── DNS mock ────────────────────────────────────────────────────────────────

jest.mock("dns/promises", () => ({
  lookup: jest.fn(),
}));

import { lookup } from "dns/promises";
const mockLookup = lookup as jest.MockedFunction<typeof lookup>;

// ─── fetch mock ───────────────────────────────────────────────────────────────

const mockFetch = jest.fn();
global.fetch = mockFetch;

// ─── Helpers ─────────────────────────────────────────────────────────────────

function makeResponse(opts: {
  status?: number;
  contentType?: string;
  body?: string | Buffer;
  headers?: Record<string, string>;
}): Response {
  const body = opts.body ?? "hello";
  const bytes =
    typeof body === "string" ? Buffer.from(body, "utf-8") : body;
  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      controller.enqueue(bytes);
      controller.close();
    },
  });
  return {
    ok: (opts.status ?? 200) < 400,
    status: opts.status ?? 200,
    headers: new Headers({
      "content-type": opts.contentType ?? "text/html",
      ...opts.headers,
    }),
    body: stream,
  } as unknown as Response;
}

function publicLookup() {
  // Simulate a public IP resolve (no private ranges)
  mockLookup.mockResolvedValue([
    { address: "93.184.216.34", family: 4 },
  ] as Awaited<ReturnType<typeof lookup>>);
}

// ─── Tests ────────────────────────────────────────────────────────────────────

beforeEach(() => {
  jest.clearAllMocks();
});

describe("safeFetchText", () => {
  test("rejects file:// scheme", async () => {
    await expect(safeFetchText("file:///etc/passwd")).rejects.toThrow(
      "Unsupported URL scheme"
    );
    expect(mockFetch).not.toHaveBeenCalled();
  });

  test("rejects gopher:// scheme", async () => {
    await expect(safeFetchText("gopher://evil.com")).rejects.toThrow(
      "Unsupported URL scheme"
    );
  });

  test("rejects loopback 127.0.0.1", async () => {
    mockLookup.mockResolvedValue([
      { address: "127.0.0.1", family: 4 },
    ] as Awaited<ReturnType<typeof lookup>>);
    await expect(safeFetchText("http://localhost/")).rejects.toThrow(
      "private/reserved IP"
    );
    expect(mockFetch).not.toHaveBeenCalled();
  });

  test("rejects 10.x private range", async () => {
    mockLookup.mockResolvedValue([
      { address: "10.0.0.1", family: 4 },
    ] as Awaited<ReturnType<typeof lookup>>);
    await expect(safeFetchText("http://internal/")).rejects.toThrow(
      "private/reserved IP"
    );
  });

  test("rejects 192.168.x private range", async () => {
    mockLookup.mockResolvedValue([
      { address: "192.168.1.100", family: 4 },
    ] as Awaited<ReturnType<typeof lookup>>);
    await expect(safeFetchText("http://router/")).rejects.toThrow(
      "private/reserved IP"
    );
  });

  test("rejects 172.16.x private range", async () => {
    mockLookup.mockResolvedValue([
      { address: "172.16.0.1", family: 4 },
    ] as Awaited<ReturnType<typeof lookup>>);
    await expect(safeFetchText("http://host/")).rejects.toThrow(
      "private/reserved IP"
    );
  });

  test("rejects 169.254.x link-local (cloud metadata)", async () => {
    mockLookup.mockResolvedValue([
      { address: "169.254.169.254", family: 4 },
    ] as Awaited<ReturnType<typeof lookup>>);
    await expect(safeFetchText("http://metadata/")).rejects.toThrow(
      "private/reserved IP"
    );
  });

  test("allows public IP and returns text", async () => {
    publicLookup();
    mockFetch.mockResolvedValue(
      makeResponse({ body: "<html>hello</html>", contentType: "text/html" })
    );
    const result = await safeFetchText("https://example.com/");
    expect(result).toBe("<html>hello</html>");
  });

  test("rejects wrong content-type", async () => {
    publicLookup();
    mockFetch.mockResolvedValue(
      makeResponse({ contentType: "application/octet-stream", body: "bytes" })
    );
    await expect(safeFetchText("https://example.com/")).rejects.toThrow(
      "Unexpected Content-Type"
    );
  });

  test("rejects response exceeding size cap", async () => {
    publicLookup();
    const big = "x".repeat(3 * 1024 * 1024); // 3MB > 2MB cap
    mockFetch.mockResolvedValue(
      makeResponse({ body: Buffer.from(big), contentType: "text/html" })
    );
    await expect(safeFetchText("https://example.com/")).rejects.toThrow(
      "size limit"
    );
  });

  test("follows a redirect to a public IP", async () => {
    publicLookup(); // same public IP for all lookups
    // First call returns a redirect, second returns the actual page
    mockFetch
      .mockResolvedValueOnce({
        ok: false,
        status: 301,
        headers: new Headers({
          "content-type": "text/html",
          location: "https://example.com/redirected",
        }),
        body: { cancel: jest.fn() },
      } as unknown as Response)
      .mockResolvedValueOnce(
        makeResponse({ body: "<html>redirected</html>", contentType: "text/html" })
      );
    const result = await safeFetchText("https://example.com/old");
    expect(result).toBe("<html>redirected</html>");
    expect(mockFetch).toHaveBeenCalledTimes(2);
  });

  test("blocks redirect-to-private IP (DNS rebinding)", async () => {
    // First lookup returns public, second returns private
    mockLookup
      .mockResolvedValueOnce([
        { address: "93.184.216.34", family: 4 },
      ] as Awaited<ReturnType<typeof lookup>>)
      .mockResolvedValueOnce([
        { address: "169.254.169.254", family: 4 },
      ] as Awaited<ReturnType<typeof lookup>>);

    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 302,
      headers: new Headers({
        "content-type": "text/html",
        location: "http://metadata.internal/secret",
      }),
      body: { cancel: jest.fn() },
    } as unknown as Response);

    await expect(safeFetchText("https://legit.com/page")).rejects.toThrow(
      "private/reserved IP"
    );
  });

  test("rejects non-resolvable hostname", async () => {
    mockLookup.mockRejectedValue(new Error("ENOTFOUND"));
    await expect(safeFetchText("https://notexist.example/")).rejects.toThrow(
      "Could not resolve hostname"
    );
  });
});

describe("safeFetchBytes", () => {
  test("rejects non-image content-type", async () => {
    publicLookup();
    mockFetch.mockResolvedValue(
      makeResponse({ contentType: "text/html", body: "<html/>" })
    );
    await expect(
      safeFetchBytes("https://example.com/img.jpg", {
        allowedContentTypes: ["image/"],
      })
    ).rejects.toThrow("Unexpected Content-Type");
  });

  test("accepts image/jpeg content-type", async () => {
    publicLookup();
    const fakeJpeg = Buffer.from([0xff, 0xd8, 0xff, 0xe0]);
    mockFetch.mockResolvedValue(
      makeResponse({ contentType: "image/jpeg", body: fakeJpeg })
    );
    const { bytes, contentType } = await safeFetchBytes(
      "https://example.com/img.jpg"
    );
    expect(contentType).toBe("image/jpeg");
    expect(bytes[0]).toBe(0xff);
  });

  test("rejects image exceeding 10MB cap", async () => {
    publicLookup();
    const big = Buffer.alloc(11 * 1024 * 1024, 0x00);
    mockFetch.mockResolvedValue(
      makeResponse({ contentType: "image/jpeg", body: big })
    );
    await expect(safeFetchBytes("https://example.com/huge.jpg")).rejects.toThrow(
      "size limit"
    );
  });
});
