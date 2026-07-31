import { NextRequest, NextResponse } from "next/server";
import { listItems, listPublishedItems, createItem, updateItem, deleteItem, CONTENT_KEYS } from "@/app/lib/content-store";
import { generateViewPageQr, getBaseUrlFromRequest } from "@/app/lib/qr-utils";
import { safeRevalidate } from "@/app/lib/revalidate";

export const runtime = "nodejs";

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
    const { title, fileUrl, published } = body;
    if (!title) return NextResponse.json({ success: false, message: "Title required" }, { status: 400 });
    if (!fileUrl) return NextResponse.json({ success: false, message: "File URL required" }, { status: 400 });

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

    const requestBase = getBaseUrlFromRequest(req);
    const qrCodeUrl = await generateViewPageQr(id, "exam-routine", requestBase);
    await updateItem(fileKey, mongoCollection, id, { qrCodeUrl });

    safeRevalidate("/", "/admin/exam-routine-qr");
    return NextResponse.json({ success: true, id, qrCodeUrl, message: "Exam Routine QR saved!" });
  } catch (e) {
    return NextResponse.json({ success: false, message: e instanceof Error ? e.message : "Failed to save" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, title, fileUrl, published } = body;
    if (!id) return NextResponse.json({ success: false, message: "ID required" }, { status: 400 });

    await updateItem(fileKey, mongoCollection, id, {
      title: title?.trim() ?? "Exam Routine",
      fileUrl: fileUrl || null,
      published: published !== false,
    });

    const requestBase = getBaseUrlFromRequest(req);
    const qrCodeUrl = await generateViewPageQr(id, "exam-routine", requestBase);
    await updateItem(fileKey, mongoCollection, id, { qrCodeUrl });

    safeRevalidate("/", "/admin/exam-routine-qr");
    return NextResponse.json({ success: true, qrCodeUrl, message: "Updated!" });
  } catch (e) {
    return NextResponse.json({ success: false, message: e instanceof Error ? e.message : "Failed to update" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id } = body;
    if (!id) return NextResponse.json({ success: false, message: "ID required" }, { status: 400 });

    const items = await listItems(fileKey, mongoCollection);
    const item = items.find((i) => String(i.id) === String(id));
    if (!item) return NextResponse.json({ success: false, message: "Record not found" }, { status: 404 });
    if (!item.fileUrl) return NextResponse.json({ success: false, message: "No file uploaded yet." }, { status: 400 });

    const requestBase = getBaseUrlFromRequest(req);
    const qrCodeUrl = await generateViewPageQr(id, "exam-routine", requestBase);
    await updateItem(fileKey, mongoCollection, id, { qrCodeUrl });

    safeRevalidate("/", "/admin/exam-routine-qr");
    return NextResponse.json({ success: true, qrCodeUrl, message: "QR regenerated!" });
  } catch (e) {
    return NextResponse.json({ success: false, message: e instanceof Error ? e.message : "Failed" }, { status: 500 });
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
