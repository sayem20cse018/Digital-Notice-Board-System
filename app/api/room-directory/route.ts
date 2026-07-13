import { NextRequest, NextResponse } from "next/server";
import { listItems, listPublishedItems, createItem, updateItem, deleteItem, CONTENT_KEYS } from "@/app/lib/content-store";

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
    const { roomName, description, floor, imageUrl, fileUrl, qrCodeUrl, displayOrder, published } = body;
    if (!roomName) return NextResponse.json({ success: false, message: "Room name required" }, { status: 400 });

    const id = await createItem(fileKey, mongoCollection, {
      roomName: roomName.trim(),
      description: description?.trim() || null,
      floor: floor?.trim() || null,
      imageUrl: imageUrl || null,
      fileUrl: fileUrl || null,
      qrCodeUrl: qrCodeUrl || null,
      displayOrder: Number(displayOrder) || 0,
      published: published !== false,
    });
    return NextResponse.json({ success: true, id, message: "Room saved!" });
  } catch {
    return NextResponse.json({ success: false, message: "Failed to save" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, roomName, description, floor, imageUrl, fileUrl, qrCodeUrl, displayOrder, published } = body;
    if (!id) return NextResponse.json({ success: false, message: "ID required" }, { status: 400 });

    const ok = await updateItem(fileKey, mongoCollection, id, {
      roomName: roomName?.trim() ?? "",
      description: description?.trim() || null,
      floor: floor?.trim() || null,
      imageUrl: imageUrl || null,
      fileUrl: fileUrl || null,
      qrCodeUrl: qrCodeUrl || null,
      displayOrder: Number(displayOrder) || 0,
      published: published !== false,
    });
    return NextResponse.json({ success: ok, message: ok ? "Updated!" : "Not found" });
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
