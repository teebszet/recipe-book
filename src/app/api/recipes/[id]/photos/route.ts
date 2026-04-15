import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { checkAuth } from "@/lib/auth";
import {
  validateFileSize,
  validateMagicBytes,
  generateFilename,
  getUploadDir,
} from "@/lib/upload";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = checkAuth(request);
  if (authError) return authError;

  const { id } = await params;
  const recipe = await prisma.recipe.findUnique({ where: { id } });
  if (!recipe) {
    return NextResponse.json({ error: "Recipe not found" }, { status: 404 });
  }

  const formData = await request.formData();
  const file = formData.get("file") as File | null;

  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  const sizeError = validateFileSize(file.size);
  if (sizeError) {
    return NextResponse.json({ error: sizeError }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const mimeType = validateMagicBytes(buffer);
  if (!mimeType) {
    return NextResponse.json(
      { error: "Invalid file type. Supported: JPEG, PNG, WebP" },
      { status: 400 }
    );
  }

  const filename = generateFilename(mimeType);
  const uploadDir = getUploadDir();
  await mkdir(uploadDir, { recursive: true });
  await writeFile(path.join(uploadDir, filename), buffer);

  const photoCount = await prisma.photo.count({ where: { recipeId: id } });
  const photo = await prisma.photo.create({
    data: {
      url: `/uploads/${filename}`,
      recipeId: id,
      sortOrder: photoCount,
      alt: (formData.get("alt") as string) || null,
    },
  });

  return NextResponse.json(
    { id: photo.id, url: photo.url, alt: photo.alt },
    { status: 201 }
  );
}
