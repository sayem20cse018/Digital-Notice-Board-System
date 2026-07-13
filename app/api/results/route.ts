import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { isDbDisabled } from "@/app/lib/config";
import { revalidatePath } from "next/cache";
import { getDb } from "@/app/lib/mongodb";

const COLLECTION = "ResultItem";

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
    const results = await db.collection(COLLECTION).find().sort({ publishedAt: -1 }).toArray();
    return NextResponse.json({ success: true, data: results.map(normalize) });
  } catch (error: any) {
    console.error("Error fetching results:", error);
    return NextResponse.json({ success: false, message: error?.message || "Failed to fetch results" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  if (isDbDisabled()) {
    return NextResponse.json({ success: false, message: "Database is disabled" }, { status: 503 });
  }

  try {
    const body = await request.json();
    const { examName, className, linkUrl } = body;

    if (!examName || !examName.trim() || !linkUrl || !linkUrl.trim()) {
      return NextResponse.json({ success: false, message: "Exam name and link URL are required" }, { status: 400 });
    }

    const db = await getDb();
    const created = await db.collection(COLLECTION).insertOne({
      examName: examName.trim(),
      className: className?.trim() || null,
      linkUrl: linkUrl.trim(),
      publishedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    revalidatePath("/");
    revalidatePath("/admin/results");

    return NextResponse.json({ success: true, message: "Result created successfully", data: { id: created.insertedId.toString() } });
  } catch (error: any) {
    console.error("Error creating result:", error);
    return NextResponse.json({ success: false, message: error?.message || "Failed to create result" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  if (isDbDisabled()) {
    return NextResponse.json({ success: false, message: "Database is disabled" }, { status: 503 });
  }

  try {
    const body = await request.json();
    const { id, examName, className, linkUrl } = body;

    if (!id || !examName || !examName.trim() || !linkUrl || !linkUrl.trim()) {
      return NextResponse.json({ success: false, message: "ID, exam name and link URL are required" }, { status: 400 });
    }

    const db = await getDb();
    const result = await db.collection(COLLECTION).findOneAndUpdate(
      { _id: toObjectId(id) },
      {
        $set: {
          examName: examName.trim(),
          className: className?.trim() || null,
          linkUrl: linkUrl.trim(),
          updatedAt: new Date(),
        },
      },
      { returnDocument: "after" },
    );

    if (!result) {
      return NextResponse.json({ success: false, message: "Result not found" }, { status: 404 });
    }

    revalidatePath("/");
    revalidatePath("/admin/results");

    return NextResponse.json({ success: true, message: "Result updated successfully", data: normalize(result) });
  } catch (error: any) {
    console.error("Error updating result:", error);
    return NextResponse.json({ success: false, message: error?.message || "Failed to update result" }, { status: 500 });
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
      return NextResponse.json({ success: false, message: "Result not found" }, { status: 404 });
    }

    revalidatePath("/");
    revalidatePath("/admin/results");

    return NextResponse.json({ success: true, message: "Result deleted successfully" });
  } catch (error: any) {
    console.error("Error deleting result:", error);
    return NextResponse.json({ success: false, message: error?.message || "Failed to delete result" }, { status: 500 });
  }
}
