import { timingSafeEqual } from "crypto";
import { NextResponse } from "next/server";

export function checkAuth(request: Request): NextResponse | null {
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminPassword) {
    return NextResponse.json(
      { error: "Server configuration error: authentication not configured" },
      { status: 401 }
    );
  }

  const authHeader = request.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const provided = authHeader.slice(7);

  const a = Buffer.from(adminPassword, "utf-8");
  const b = Buffer.from(provided, "utf-8");

  if (a.length !== b.length || !timingSafeEqual(a, b)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return null;
}
