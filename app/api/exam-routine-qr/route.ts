import { NextRequest, NextResponse } from "next/server";
import { listItems, listPublishedItems, createItem, updateItem, deleteItem, CONTENT_KEYS } from "@/app/lib/content-store";

const { fileKey, mongoCollection } = CONTENT_KEYS.examRoutineQr;

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
    const { title, qrCodeUrl, fileUrl, published } = body;
    if (!title) return NextResponse.json({ success: false, message: "Title required" }, { status: 400 });

    // Only one record allowed — clear first
    const existing = await listItems(fileKey, mongoCollection);
    for (const item of existing) {
      await deleteItem(fileKey, mongoCollection, item.id);
    }

    const id = await createItem(fileKey, mongoCollection, {
      title: title.trim(),
      qrCodeUrl: qrCodeUrl || null,
      fileUrl: fileUrl || null,
      published: published !== false,
      displayOrder: 0,
    });
    return NextResponse.json({ success: true, id, message: "Exam Routine QR saved!" });
  } catch {
    return NextResponse.json({ success: false, message: "Failed to save" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, title, qrCodeUrl, fileUrl, published } = body;
    if (!id) return NextResponse.json({ success: false, message: "ID required" }, { status: 400 });

    const ok = await updateItem(fileKey, mongoCollection, id, {
      title: title?.trim() ?? "Exam Routine",
      qrCodeUrl: qrCodeUrl || null,
      fileUrl: fileUrl || null,
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
