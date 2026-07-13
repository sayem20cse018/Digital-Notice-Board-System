import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { isDbDisabled } from "@/app/lib/config";
import { revalidatePath } from "next/cache";
import { getDb } from "@/app/lib/mongodb";

const COLLECTION = "NoticeItem";

function toObjectId(id: string) {
  try {
    return new ObjectId(id);
  } catch {
    throw new Error("Invalid id");
  }
}

function normalize(doc: any) {
  const { _id, ...rest } = doc;
  return { id: _id.toString(), ...rest };
}

export async function GET() {
  if (isDbDisabled()) {
    return NextResponse.json({ success: false, message: "Database is disabled" }, { status: 503 });
  }

  try {
    const db = await getDb();
    const notices = await db
      .collection(COLLECTION)
      .find()
      .sort({ displayOrder: 1, createdAt: -1 })
      .toArray();
    return NextResponse.json({ success: true, data: notices.map(normalize) });
  } catch (error: any) {
    console.error("Error fetching notices:", error);
    return NextResponse.json({ success: false, message: error?.message || "Failed to fetch notices" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  if (isDbDisabled()) {
    return NextResponse.json({ success: false, message: "Database is disabled" }, { status: 503 });
  }

  try {
    const body = await request.json();
    const { title, body: bodyText, pdfUrl, displayOrder, published } = body;

    if (!title || !title.trim()) {
      return NextResponse.json({ success: false, message: "Title is required" }, { status: 400 });
    }

    const db = await getDb();
    const created = await db.collection(COLLECTION).insertOne({
      title: title.trim(),
      body: bodyText?.trim() || null,
      pdfUrl: pdfUrl?.trim() || null,
      displayOrder: Number(displayOrder) || 0,
      published: Boolean(published),
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    revalidatePath("/");
    revalidatePath("/admin/notices");

    return NextResponse.json({ success: true, message: "Notice created successfully", data: { id: created.insertedId.toString() } });
  } catch (error: any) {
    console.error("Error creating notice:", error);
    return NextResponse.json({ success: false, message: error?.message || "Failed to create notice" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  if (isDbDisabled()) {
    return NextResponse.json({ success: false, message: "Database is disabled" }, { status: 503 });
  }

  try {
    const body = await request.json();
    const { id, title, body: bodyText, pdfUrl, displayOrder, published } = body;

    if (!id || !title || !title.trim()) {
      return NextResponse.json({ success: false, message: "ID and title are required" }, { status: 400 });
    }

    const db = await getDb();
    const result = await db.collection(COLLECTION).findOneAndUpdate(
      { _id: toObjectId(id) },
      {
        $set: {
          title: title.trim(),
          body: bodyText?.trim() || null,
          pdfUrl: pdfUrl?.trim() || null,
          displayOrder: Number(displayOrder) || 0,
          published: Boolean(published),
          updatedAt: new Date(),
        },
      },
      { returnDocument: "after" },
    );

    if (!result) {
      return NextResponse.json({ success: false, message: "Notice not found" }, { status: 404 });
    }

    revalidatePath("/");
    revalidatePath("/admin/notices");

    return NextResponse.json({ success: true, message: "Notice updated successfully", data: normalize(result) });
  } catch (error: any) {
    console.error("Error updating notice:", error);
    return NextResponse.json({ success: false, message: error?.message || "Failed to update notice" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  if (isDbDisabled()) {
    return NextResponse.json({ success: false, message: "Database is disabled" }, { status: 503 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ success: false, message: "ID is required" }, { status: 400 });
    }

    const db = await getDb();
    const result = await db.collection(COLLECTION).deleteOne({ _id: toObjectId(id) });

    if (result.deletedCount === 0) {
      return NextResponse.json({ success: false, message: "Notice not found" }, { status: 404 });
    }

    revalidatePath("/");
    revalidatePath("/admin/notices");

    return NextResponse.json({ success: true, message: "Notice deleted successfully" });
  } catch (error: any) {
    console.error("Error deleting notice:", error);
    return NextResponse.json({ success: false, message: error?.message || "Failed to delete notice" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  if (isDbDisabled()) {
    return NextResponse.json({ success: false, message: "Database is disabled" }, { status: 503 });
  }

  try {
    const body = await request.json();
    const { id, published } = body;

    if (!id || typeof published !== "boolean") {
      return NextResponse.json({ success: false, message: "ID and published status are required" }, { status: 400 });
    }

    const db = await getDb();
    const result = await db.collection(COLLECTION).findOneAndUpdate(
      { _id: toObjectId(id) },
      { $set: { published, updatedAt: new Date() } },
      { returnDocument: "after" },
    );

    if (!result) {
      return NextResponse.json({ success: false, message: "Notice not found" }, { status: 404 });
    }

    revalidatePath("/");
    revalidatePath("/admin/notices");

    return NextResponse.json({ success: true, message: "Notice publish status updated", data: normalize(result) });
  } catch (error: any) {
    console.error("Error toggling notice publish:", error);
    return NextResponse.json({ success: false, message: error?.message || "Failed to update publish status" }, { status: 500 });
  }
}
