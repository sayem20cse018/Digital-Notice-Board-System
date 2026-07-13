import { NextRequest, NextResponse } from "next/server";
import { listItems, listPublishedItems, createItem, updateItem, deleteItem, CONTENT_KEYS } from "@/app/lib/content-store";

const { fileKey, mongoCollection } = CONTENT_KEYS.aboutUs;

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
    const { heading, body: bodyText, imageUrl, published } = body;
    if (!bodyText) return NextResponse.json({ success: false, message: "Body text required" }, { status: 400 });

    // Only one About Us record — clear first
    const existing = await listItems(fileKey, mongoCollection);
    for (const item of existing) {
      await deleteItem(fileKey, mongoCollection, item.id);
    }

    const id = await createItem(fileKey, mongoCollection, {
      heading: heading?.trim() || "About Us",
      body: bodyText.trim(),
      imageUrl: imageUrl || null,
      published: published !== false,
      displayOrder: 0,
    });
    return NextResponse.json({ success: true, id, message: "About Us saved!" });
  } catch {
    return NextResponse.json({ success: false, message: "Failed to save" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, heading, body: bodyText, imageUrl, published } = body;
    if (!id) return NextResponse.json({ success: false, message: "ID required" }, { status: 400 });

    const ok = await updateItem(fileKey, mongoCollection, id, {
      heading: heading?.trim() || "About Us",
      body: bodyText?.trim() ?? "",
      imageUrl: imageUrl || null,
      published: published !== false,
    });
    return NextResponse.json({ success: ok, message: ok ? "Updated!" : "Not found" });
  } catch {
    return NextResponse.json({ success: false, message: "Failed to update" }, { status: 500 });
  }
}
