import { NextRequest, NextResponse } from "next/server";
import {
  listItems,
  listPublishedItems,
  createItem,
  updateItem,
  deleteItem,
  CONTENT_KEYS,
} from "@/app/lib/content-store";

const { fileKey, mongoCollection } = CONTENT_KEYS.events;

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
    const { title, description, date, time, venue, imageUrl, published } = body;
    if (!title?.trim()) {
      return NextResponse.json({ success: false, message: "Title is required" }, { status: 400 });
    }
    const id = await createItem(fileKey, mongoCollection, {
      title: title.trim(),
      description: description?.trim() || null,
      date: date?.trim() || null,
      time: time?.trim() || null,
      venue: venue?.trim() || null,
      imageUrl: imageUrl || null,
      published: published !== false,
      displayOrder: 0,
    });
    return NextResponse.json({ success: true, id, message: "Event saved!" });
  } catch {
    return NextResponse.json({ success: false, message: "Failed to save" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, title, description, date, time, venue, imageUrl, published } = body;
    if (!id) return NextResponse.json({ success: false, message: "ID required" }, { status: 400 });
    const ok = await updateItem(fileKey, mongoCollection, id, {
      title: title?.trim() ?? "",
      description: description?.trim() || null,
      date: date?.trim() || null,
      time: time?.trim() || null,
      venue: venue?.trim() || null,
      imageUrl: imageUrl || null,
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
