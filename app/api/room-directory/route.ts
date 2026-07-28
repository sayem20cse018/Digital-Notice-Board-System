import { NextRequest, NextResponse } from "next/server";
import { listItems, listPublishedItems, createItem, updateItem, deleteItem, CONTENT_KEYS } from "@/app/lib/content-store";
import { generateFileQrUrl, getBaseUrlFromRequest } from "@/app/lib/qr-utils";
import { safeRevalidate } from "@/app/lib/revalidate";

export const runtime = "nodejs";

const { fileKey, mongoCollection } = CONTENT_KEYS.roomDirectory;

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const all = searchParams.get("all") === "1";
  try {
    const items = all
      ? await listItems(fileKey, mongoCollection)
      : await listPublishedItems(fileKey, mongoCollection, 20);
    return NextResponse.json({ success: true, data: items });
  } catch {
    return NextResponse.json({ success: false, message: "Failed to fetch" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { roomName, description, floor, imageUrl, fileUrl, displayOrder, published } = body;
    if (!roomName) return NextResponse.json({ success: false, message: "Room name required" }, { status: 400 });

    // Server-side QR generation — always uses public URL, never localhost
    const qrTarget = fileUrl || imageUrl || null;
    let qrCodeUrl: string | null = null;
    if (qrTarget) {
      const requestBase = getBaseUrlFromRequest(req);
      qrCodeUrl = await generateFileQrUrl(qrTarget, requestBase);
    }

    const id = await createItem(fileKey, mongoCollection, {
      roomName: roomName.trim(),
      description: description?.trim() || null,
      floor: floor?.trim() || null,
      imageUrl: imageUrl || null,
      fileUrl: fileUrl || null,
      qrCodeUrl,
      displayOrder: Number(displayOrder) || 0,
      published: published !== false,
    });

    safeRevalidate("/", "/admin/room-directory");
    return NextResponse.json({ success: true, id, qrCodeUrl, message: "Room saved!" });
  } catch {
    return NextResponse.json({ success: false, message: "Failed to save" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, roomName, description, floor, imageUrl, fileUrl, displayOrder, published } = body;
    if (!id) return NextResponse.json({ success: false, message: "ID required" }, { status: 400 });

    // Server-side QR generation — always uses public URL, never localhost
    const qrTarget = fileUrl || imageUrl || null;
    let qrCodeUrl: string | null = null;
    if (qrTarget) {
      const requestBase = getBaseUrlFromRequest(req);
      qrCodeUrl = await generateFileQrUrl(qrTarget, requestBase);
    }

    const ok = await updateItem(fileKey, mongoCollection, id, {
      roomName: roomName?.trim() ?? "",
      description: description?.trim() || null,
      floor: floor?.trim() || null,
      imageUrl: imageUrl || null,
      fileUrl: fileUrl || null,
      qrCodeUrl,
      displayOrder: Number(displayOrder) || 0,
      published: published !== false,
    });

    safeRevalidate("/", "/admin/room-directory");
    return NextResponse.json({ success: ok, qrCodeUrl, message: ok ? "Updated!" : "Not found" });
  } catch {
    return NextResponse.json({ success: false, message: "Failed to update" }, { status: 500 });
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
