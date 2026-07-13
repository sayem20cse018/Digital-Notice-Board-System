import { NextRequest, NextResponse } from "next/server";
import { CONTENT_KEYS, createItem, listItems, updateItem } from "@/app/lib/content-store";
import { generateQrCodeImage, getBaseUrlFromRequest } from "@/app/lib/qr-utils";
import { safeRevalidate } from "@/app/lib/revalidate";

export const runtime = "nodejs";

const { fileKey, mongoCollection } = CONTENT_KEYS.teacherList;

export async function GET() {
  try {
    const items = await listItems(fileKey, mongoCollection);
    const item = items[0];
    if (!item) {
      return NextResponse.json({
        success: true,
        data: { id: null, title: "", fileUrl: null, qrCodeUrl: null, published: false },
      });
    }
    // No passwordHash — teacher list is public
    const { passwordHash: _, ...rest } = item as Record<string, unknown> & { passwordHash?: unknown };
    return NextResponse.json({ success: true, data: rest });
  } catch (error: unknown) {
    return NextResponse.json({ success: false, message: error instanceof Error ? error.message : "Failed" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const title   = String(body.title || "Teacher List").trim();
    const fileUrl = String(body.fileUrl || "").trim();
    const published = Boolean(body.published);

    if (!fileUrl) {
      return NextResponse.json({ success: false, message: "File is required" }, { status: 400 });
    }

    const existing = await listItems(fileKey, mongoCollection);
    const existingId = existing.length > 0 ? String(existing[0].id) : null;

    let id: string;
    if (existingId) {
      await updateItem(fileKey, mongoCollection, existingId, { title, fileUrl, published });
      id = existingId;
    } else {
      id = await createItem(fileKey, mongoCollection, { title, fileUrl, published, qrCodeUrl: null });
    }

    const qrBase = getBaseUrlFromRequest(request);
    const qrCodeUrl = await generateQrCodeImage("teacher-list", id, qrBase);
    await updateItem(fileKey, mongoCollection, id, { qrCodeUrl });

    safeRevalidate("/", "/admin/teacher-list");
    return NextResponse.json({ success: true, message: "Teacher list saved and QR generated", data: { id } });
  } catch (error: unknown) {
    return NextResponse.json({ success: false, message: error instanceof Error ? error.message : "Failed" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, title, fileUrl, published } = body;

    if (!id || !fileUrl) {
      return NextResponse.json({ success: false, message: "ID and file required" }, { status: 400 });
    }

    await updateItem(fileKey, mongoCollection, String(id), {
      title: String(title || "Teacher List").trim(),
      fileUrl: String(fileUrl).trim(),
      published: Boolean(published),
    });

    const qrBase = getBaseUrlFromRequest(request);
    const qrCodeUrl = await generateQrCodeImage("teacher-list", String(id), qrBase);
    await updateItem(fileKey, mongoCollection, String(id), { qrCodeUrl });

    safeRevalidate("/", "/admin/teacher-list");
    return NextResponse.json({ success: true, message: "Teacher list updated and QR regenerated" });
  } catch (error: unknown) {
    return NextResponse.json({ success: false, message: error instanceof Error ? error.message : "Failed" }, { status: 500 });
  }
}
