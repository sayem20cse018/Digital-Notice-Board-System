import { NextRequest, NextResponse } from "next/server";
import { listItems, listPublishedItems, createItem, updateItem, deleteItem, CONTENT_KEYS } from "@/app/lib/content-store";
import { getPublicSiteUrl, getBaseUrlFromRequest } from "@/app/lib/qr-utils";
import QRCode from "qrcode";
import { existsSync } from "fs";
import { mkdir, writeFile } from "fs/promises";
import { join } from "path";

export const runtime = "nodejs";

const { fileKey, mongoCollection } = CONTENT_KEYS.classRoutineQr;

const UPLOAD_DIR = join(process.cwd(), "public", "uploads");

async function generateRoutineQr(fileUrl: string, id: string, requestBase: string | null): Promise<string> {
  // If fileUrl is an absolute URL, QR encodes it directly
  // If relative, we prepend the public base URL
  let targetUrl = fileUrl;
  if (!fileUrl.startsWith("http://") && !fileUrl.startsWith("https://")) {
    const base = await getPublicSiteUrl(requestBase);
    targetUrl = `${base}${fileUrl.startsWith("/") ? "" : "/"}${fileUrl}`;
  }

  if (!existsSync(UPLOAD_DIR)) {
    await mkdir(UPLOAD_DIR, { recursive: true });
  }

  const filename = `qr-class-routine-${id}.png`;
  const filepath = join(UPLOAD_DIR, filename);

  const buffer = await QRCode.toBuffer(targetUrl, {
    width: 400,
    margin: 2,
    color: { dark: "#1e3a8a", light: "#ffffff" },
  });

  await writeFile(filepath, buffer);
  return `/uploads/${filename}`;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const all = searchParams.get("all") === "1";
  try {
    const items = all
      ? await listItems(fileKey, mongoCollection)
      : await listPublishedItems(fileKey, mongoCollection, 1);
    return NextResponse.json({ success: true, data: items.length > 0 ? items[0] : null });
  } catch {
    return NextResponse.json({ success: false, message: "Failed to fetch" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, fileUrl, published } = body;
    if (!title) return NextResponse.json({ success: false, message: "Title required" }, { status: 400 });
    if (!fileUrl) return NextResponse.json({ success: false, message: "File URL required" }, { status: 400 });

    // Only one record allowed — clear first
    const existing = await listItems(fileKey, mongoCollection);
    for (const item of existing) {
      await deleteItem(fileKey, mongoCollection, String(item.id));
    }

    const id = await createItem(fileKey, mongoCollection, {
      title: title.trim(),
      qrCodeUrl: null,
      fileUrl: fileUrl || null,
      published: published !== false,
      displayOrder: 0,
    });

    // Generate QR server-side with correct public URL
    const requestBase = getBaseUrlFromRequest(req);
    const qrCodeUrl = await generateRoutineQr(fileUrl, id, requestBase);
    await updateItem(fileKey, mongoCollection, id, { qrCodeUrl });

    return NextResponse.json({ success: true, id, qrCodeUrl, message: "Class Routine QR saved!" });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Failed to save";
    return NextResponse.json({ success: false, message: msg }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, title, fileUrl, published } = body;
    if (!id) return NextResponse.json({ success: false, message: "ID required" }, { status: 400 });

    await updateItem(fileKey, mongoCollection, id, {
      title: title?.trim() ?? "Class Routine",
      fileUrl: fileUrl || null,
      published: published !== false,
    });

    // Regenerate QR server-side
    let qrCodeUrl: string | null = null;
    if (fileUrl) {
      const requestBase = getBaseUrlFromRequest(req);
      qrCodeUrl = await generateRoutineQr(fileUrl, id, requestBase);
      await updateItem(fileKey, mongoCollection, id, { qrCodeUrl });
    }

    return NextResponse.json({ success: true, qrCodeUrl, message: "Updated!" });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Failed to update";
    return NextResponse.json({ success: false, message: msg }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ success: false, message: "ID required" }, { status: 400 });
  try {
    const ok = await deleteItem(fileKey, mongoCollection, id);
    return NextResponse.json({ success: ok });
  } catch {
    return NextResponse.json({ success: false, message: "Failed to delete" }, { status: 500 });
  }
}
