import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { isDbDisabled } from "@/app/lib/config";
import { revalidatePath } from "next/cache";
import { getDb } from "@/app/lib/mongodb";

const COLLECTION = "Quote";

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
    const quotes = await db.collection(COLLECTION).find().sort({ displayOrder: 1 }).toArray();
    return NextResponse.json({ success: true, data: quotes.map(normalize) });
  } catch (error: any) {
    console.error("Error fetching quotes:", error);
    return NextResponse.json({ success: false, message: error?.message || "Failed to fetch quotes" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  if (isDbDisabled()) {
    return NextResponse.json({ success: false, message: "Database is disabled" }, { status: 503 });
  }

  try {
    const body = await request.json();
    const { text, authorName } = body;

    if (!text || !text.trim() || !authorName || !authorName.trim()) {
      return NextResponse.json({ success: false, message: "Text and author name are required" }, { status: 400 });
    }

    const db = await getDb();
    const count = await db.collection(COLLECTION).countDocuments();
    const created = await db.collection(COLLECTION).insertOne({
      text: text.trim(),
      authorName: authorName.trim(),
      displayOrder: count,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    revalidatePath("/");
    revalidatePath("/admin/quotes");

    return NextResponse.json({ success: true, message: "Quote created successfully", data: { id: created.insertedId.toString() } });
  } catch (error: any) {
    console.error("Error creating quote:", error);
    return NextResponse.json({ success: false, message: error?.message || "Failed to create quote" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  if (isDbDisabled()) {
    return NextResponse.json({ success: false, message: "Database is disabled" }, { status: 503 });
  }

  try {
    const body = await request.json();
    const { id, text, authorName } = body;

    if (!id || !text || !text.trim() || !authorName || !authorName.trim()) {
      return NextResponse.json({ success: false, message: "ID, text and author name are required" }, { status: 400 });
    }

    const db = await getDb();
    const result = await db.collection(COLLECTION).findOneAndUpdate(
      { _id: toObjectId(id) },
      {
        $set: {
          text: text.trim(),
          authorName: authorName.trim(),
          updatedAt: new Date(),
        },
      },
      { returnDocument: "after" },
    );

    if (!result) {
      return NextResponse.json({ success: false, message: "Quote not found" }, { status: 404 });
    }

    revalidatePath("/");
    revalidatePath("/admin/quotes");

    return NextResponse.json({ success: true, message: "Quote updated successfully", data: normalize(result) });
  } catch (error: any) {
    console.error("Error updating quote:", error);
    return NextResponse.json({ success: false, message: error?.message || "Failed to update quote" }, { status: 500 });
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
      return NextResponse.json({ success: false, message: "Quote not found" }, { status: 404 });
    }

    revalidatePath("/");
    revalidatePath("/admin/quotes");

    return NextResponse.json({ success: true, message: "Quote deleted successfully" });
  } catch (error: any) {
    console.error("Error deleting quote:", error);
    return NextResponse.json({ success: false, message: error?.message || "Failed to delete quote" }, { status: 500 });
  }
}
