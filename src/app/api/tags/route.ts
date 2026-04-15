import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q")?.trim().toLowerCase() || "";

  const tags = await prisma.tag.findMany({
    where: q ? { name: { contains: q } } : {},
    orderBy: { name: "asc" },
    take: 10,
  });

  return NextResponse.json({ tags: tags.map((t: { name: string }) => t.name) });
}
