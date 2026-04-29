import { lookup } from "dns/promises";

const HTML_MAX_BYTES = 2 * 1024 * 1024; // 2MB
const IMAGE_MAX_BYTES = 10 * 1024 * 1024; // 10MB
const HTML_TIMEOUT_MS = 15_000;
const IMAGE_TIMEOUT_MS = 30_000;
const MAX_REDIRECTS = 3;

// Private / reserved IP ranges that must never be fetched (SSRF mitigation).
const PRIVATE_RANGES: [number, number][] = [
  // 127.0.0.0/8  loopback
  [0x7f000000, 0x7fffffff],
  // 10.0.0.0/8
  [0x0a000000, 0x0affffff],
  // 172.16.0.0/12
  [0xac100000, 0xac1fffff],
  // 192.168.0.0/16
  [0xc0a80000, 0xc0a8ffff],
  // 169.254.0.0/16  link-local / cloud metadata
  [0xa9fe0000, 0xa9feffff],
  // 100.64.0.0/10  shared address space
  [0x64400000, 0x6440ffff],
  // ::1 / fc00::/7 / fe80::/10 handled by string check below
];

function ipv4ToInt(ip: string): number {
  return ip
    .split(".")
    .reduce((acc, octet) => (acc << 8) | parseInt(octet, 10), 0) >>> 0;
}

function isPrivateIp(ip: string): boolean {
  if (ip === "::1" || ip.startsWith("fc") || ip.startsWith("fd") || ip.startsWith("fe80")) {
    return true;
  }
  if (!ip.includes(".")) return false; // non-v4, conservative pass (rare in practice)
  const n = ipv4ToInt(ip);
  return PRIVATE_RANGES.some(([lo, hi]) => n >= lo && n <= hi);
}

async function resolveAndCheck(hostname: string): Promise<void> {
  let addresses: string[];
  try {
    const result = await lookup(hostname, { all: true });
    addresses = result.map((r) => r.address);
  } catch {
    throw new Error(`Could not resolve hostname: ${hostname}`);
  }
  for (const addr of addresses) {
    if (isPrivateIp(addr)) {
      throw new Error(`URL resolves to a private/reserved IP address: ${addr}`);
    }
  }
}

export interface FetchTextOptions {
  maxBytes?: number;
  timeoutMs?: number;
  allowedContentTypes?: string[];
  maxRedirects?: number;
}

export interface FetchBytesOptions {
  maxBytes?: number;
  timeoutMs?: number;
  allowedContentTypes?: string[];
  maxRedirects?: number;
}

async function safeFetch(
  url: string,
  options: {
    maxBytes: number;
    timeoutMs: number;
    allowedContentTypes: string[];
    maxRedirects: number;
  }
): Promise<{ body: Buffer; contentType: string }> {
  const parsed = new URL(url); // throws if malformed
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    throw new Error(`Unsupported URL scheme: ${parsed.protocol}`);
  }

  await resolveAndCheck(parsed.hostname);

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), options.timeoutMs);

  let response: Response;
  let redirectsLeft = options.maxRedirects;

  try {
    response = await fetch(url, {
      signal: controller.signal,
      redirect: "manual",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; recipe-importer/1.0; +https://foodlepop.app)",
        Accept: "text/html,application/xhtml+xml,*/*;q=0.8",
      },
    });

    // Follow redirects manually so we can SSRF-check each hop.
    while (
      (response.status === 301 ||
        response.status === 302 ||
        response.status === 303 ||
        response.status === 307 ||
        response.status === 308) &&
      redirectsLeft > 0
    ) {
      const location = response.headers.get("location");
      if (!location) break;
      redirectsLeft--;

      const nextUrl = new URL(location, url);
      if (nextUrl.protocol !== "http:" && nextUrl.protocol !== "https:") {
        throw new Error(`Redirect to unsupported scheme: ${nextUrl.protocol}`);
      }
      await resolveAndCheck(nextUrl.hostname);

      // Consume body to free socket
      await response.body?.cancel();

      response = await fetch(nextUrl.toString(), {
        signal: controller.signal,
        redirect: "manual",
        headers: {
          "User-Agent":
            "Mozilla/5.0 (compatible; recipe-importer/1.0; +https://foodlepop.app)",
          Accept: "text/html,application/xhtml+xml,*/*;q=0.8",
        },
      });
      url = nextUrl.toString();
    }
  } finally {
    clearTimeout(timer);
  }

  if (!response.ok && response.status !== 200) {
    // Allow through for content-type check even on 2xx variants
    if (response.status < 200 || response.status >= 300) {
      throw new Error(`HTTP ${response.status} from server`);
    }
  }

  const contentType = response.headers.get("content-type") || "";
  const allowed = options.allowedContentTypes.some((t) =>
    contentType.toLowerCase().startsWith(t.toLowerCase())
  );
  if (!allowed) {
    await response.body?.cancel();
    throw new Error(
      `Unexpected Content-Type: ${contentType}. Expected one of: ${options.allowedContentTypes.join(", ")}`
    );
  }

  // Stream with size cap
  const reader = response.body?.getReader();
  if (!reader) throw new Error("No response body");

  const chunks: Uint8Array[] = [];
  let totalBytes = 0;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    totalBytes += value.byteLength;
    if (totalBytes > options.maxBytes) {
      await reader.cancel();
      throw new Error(
        `Response exceeds size limit of ${options.maxBytes} bytes`
      );
    }
    chunks.push(value);
  }

  const buffer = Buffer.concat(chunks.map((c) => Buffer.from(c)));
  return { body: buffer, contentType };
}

export async function safeFetchText(
  url: string,
  opts: FetchTextOptions = {}
): Promise<string> {
  const { body } = await safeFetch(url, {
    maxBytes: opts.maxBytes ?? HTML_MAX_BYTES,
    timeoutMs: opts.timeoutMs ?? HTML_TIMEOUT_MS,
    allowedContentTypes: opts.allowedContentTypes ?? ["text/html", "application/xhtml+xml"],
    maxRedirects: opts.maxRedirects ?? MAX_REDIRECTS,
  });
  return body.toString("utf-8");
}

export async function safeFetchBytes(
  url: string,
  opts: FetchBytesOptions = {}
): Promise<{ bytes: Buffer; contentType: string }> {
  const { body, contentType } = await safeFetch(url, {
    maxBytes: opts.maxBytes ?? IMAGE_MAX_BYTES,
    timeoutMs: opts.timeoutMs ?? IMAGE_TIMEOUT_MS,
    allowedContentTypes: opts.allowedContentTypes ?? ["image/"],
    maxRedirects: opts.maxRedirects ?? MAX_REDIRECTS,
  });
  return { bytes: body, contentType };
}
