import { NextResponse } from "next/server";
import { checkAuth } from "@/lib/auth";

export async function POST(request: Request) {
  const authError = checkAuth(request);
  if (authError) return authError;
  return NextResponse.json({ authenticated: true });
}
