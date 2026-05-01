import { NextResponse } from "next/server";
import { checkAuth } from "@/lib/auth";
import { importFromUrl } from "@/lib/import";

export async function POST(request: Request) {
  const authError = checkAuth(request);
  if (authError) return authError;

  let body: { url?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const url = body?.url;
  if (typeof url !== "string" || !url.trim()) {
    return NextResponse.json({ error: "url is required" }, { status: 400 });
  }

  // Syntactic URL validation before handing off to the importer
  try {
    const parsed = new URL(url.trim());
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return NextResponse.json(
        { error: "Only http and https URLs are supported" },
        { status: 400 }
      );
    }
  } catch {
    return NextResponse.json({ error: "Invalid URL format" }, { status: 400 });
  }

  try {
    const result = await importFromUrl(url.trim());
    return NextResponse.json(result);
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to import recipe";
    return NextResponse.json({ error: message }, { status: 422 });
  }
}
