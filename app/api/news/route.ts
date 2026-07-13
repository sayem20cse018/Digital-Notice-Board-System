import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { isDbDisabled } from "@/app/lib/config";
import { revalidatePath } from "next/cache";
import { getDb } from "@/app/lib/mongodb";

const COLLECTION = "NewsItem";

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
    const news = await db.collection(COLLECTION).find().sort({ createdAt: -1 }).toArray();
    return NextResponse.json({ success: true, data: news.map(normalize) });
  } catch (error: any) {
    console.error("Error fetching news:", error);
    return NextResponse.json({ success: false, message: error?.message || "Failed to fetch news" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  if (isDbDisabled()) {
    return NextResponse.json({ success: false, message: "Database is disabled" }, { status: 503 });
  }

  try {
    const body = await request.json();
    const { title, content, imageUrl, published } = body;

    if (!title || !title.trim()) {
      return NextResponse.json({ success: false, message: "Title is required" }, { status: 400 });
    }

    const db = await getDb();
    const created = await db.collection(COLLECTION).insertOne({
      title: title.trim(),
      content: content?.trim() || null,
      imageUrl: imageUrl?.trim() || null,
      published: Boolean(published),
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    revalidatePath("/");
    revalidatePath("/admin/news");

    return NextResponse.json({ success: true, message: "News created successfully", data: { id: created.insertedId.toString() } });
  } catch (error: any) {
    console.error("Error creating news:", error);
    return NextResponse.json({ success: false, message: error?.message || "Failed to create news" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  if (isDbDisabled()) {
    return NextResponse.json({ success: false, message: "Database is disabled" }, { status: 503 });
  }

  try {
    const body = await request.json();
    const { id, title, content, imageUrl, published } = body;

    if (!id || !title || !title.trim()) {
      return NextResponse.json({ success: false, message: "ID and title are required" }, { status: 400 });
    }

    const db = await getDb();
    const result = await db.collection(COLLECTION).findOneAndUpdate(
      { _id: toObjectId(id) },
      {
        $set: {
          title: title.trim(),
          content: content?.trim() || null,
          imageUrl: imageUrl?.trim() || null,
          published: Boolean(published),
          updatedAt: new Date(),
        },
      },
      { returnDocument: "after" },
    );

    if (!result) {
      return NextResponse.json({ success: false, message: "News not found" }, { status: 404 });
    }

    revalidatePath("/");
    revalidatePath("/admin/news");

    return NextResponse.json({ success: true, message: "News updated successfully", data: normalize(result) });
  } catch (error: any) {
    console.error("Error updating news:", error);
    return NextResponse.json({ success: false, message: error?.message || "Failed to update news" }, { status: 500 });
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
      return NextResponse.json({ success: false, message: "News not found" }, { status: 404 });
    }

    revalidatePath("/");
    revalidatePath("/admin/news");

    return NextResponse.json({ success: true, message: "News deleted successfully" });
  } catch (error: any) {
    console.error("Error deleting news:", error);
    return NextResponse.json({ success: false, message: error?.message || "Failed to delete news" }, { status: 500 });
  }
}
