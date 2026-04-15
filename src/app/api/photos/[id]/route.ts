import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { checkAuth } from "@/lib/auth";
import { getUploadDir } from "@/lib/upload";
import { unlink } from "fs/promises";
import path from "path";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = checkAuth(request);
  if (authError) return authError;

  const { id } = await params;
  const photo = await prisma.photo.findUnique({ where: { id } });

  if (!photo) {
    return NextResponse.json({ error: "Photo not found" }, { status: 404 });
  }

  const filename = path.basename(photo.url);
  const filePath = path.join(getUploadDir(), filename);

  try {
    await unlink(filePath);
  } catch {
    // File may already be deleted
  }

  await prisma.photo.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
