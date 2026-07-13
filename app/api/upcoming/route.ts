import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { isDbDisabled } from "@/app/lib/config";
import { revalidatePath } from "next/cache";
import { getDb } from "@/app/lib/mongodb";

const COLLECTION = "UpcomingCard";

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
    const cards = await db.collection(COLLECTION).find().sort({ displayOrder: 1, createdAt: -1 }).toArray();
    return NextResponse.json({ success: true, data: cards.map(normalize) });
  } catch (error: any) {
    console.error("Error fetching upcoming cards:", error);
    return NextResponse.json({ success: false, message: error?.message || "Failed to fetch upcoming cards" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  if (isDbDisabled()) {
    return NextResponse.json({ success: false, message: "Database is disabled" }, { status: 503 });
  }

  try {
    const body = await request.json();
    const { title, imageUrl, fileUrl, dueDate, displayOrder, published } = body;

    if (!title || !title.trim() || !dueDate) {
      return NextResponse.json({ success: false, message: "Title and due date are required" }, { status: 400 });
    }

    const db = await getDb();
    const created = await db.collection(COLLECTION).insertOne({
        title: title.trim(),
        imageUrl: imageUrl?.trim() || null,
        fileUrl: fileUrl?.trim() || null,
        dueDate: new Date(dueDate),
        displayOrder: Number(displayOrder) || 0,
        published: Boolean(published),
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    revalidatePath("/");
    revalidatePath("/admin/upcoming");

    return NextResponse.json({ success: true, message: "Upcoming card created successfully", data: { id: created.insertedId.toString() } });
  } catch (error: any) {
    console.error("Error creating upcoming card:", error);
    return NextResponse.json({ success: false, message: error?.message || "Failed to create upcoming card" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  if (isDbDisabled()) {
    return NextResponse.json({ success: false, message: "Database is disabled" }, { status: 503 });
  }

  try {
    const body = await request.json();
    const { id, title, imageUrl, fileUrl, dueDate, displayOrder, published } = body;

    if (!id || !title || !title.trim() || !dueDate) {
      return NextResponse.json({ success: false, message: "ID, title and due date are required" }, { status: 400 });
    }

    const db = await getDb();
    const result = await db.collection(COLLECTION).findOneAndUpdate(
      { _id: toObjectId(id) },
      {
        $set: {
        title: title.trim(),
        imageUrl: imageUrl?.trim() || null,
        fileUrl: fileUrl?.trim() || null,
        dueDate: new Date(dueDate),
        displayOrder: Number(displayOrder) || 0,
        published: Boolean(published),
          updatedAt: new Date(),
      },
      },
      { returnDocument: "after" },
    );

    if (!result) {
      return NextResponse.json({ success: false, message: "Upcoming card not found" }, { status: 404 });
    }

    revalidatePath("/");
    revalidatePath("/admin/upcoming");

    return NextResponse.json({ success: true, message: "Upcoming card updated successfully", data: normalize(result) });
  } catch (error: any) {
    console.error("Error updating upcoming card:", error);
    return NextResponse.json({ success: false, message: error?.message || "Failed to update upcoming card" }, { status: 500 });
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
      return NextResponse.json({ success: false, message: "Upcoming card not found" }, { status: 404 });
    }

    revalidatePath("/");
    revalidatePath("/admin/upcoming");

    return NextResponse.json({ success: true, message: "Upcoming card deleted successfully" });
  } catch (error: any) {
    console.error("Error deleting upcoming card:", error);
    return NextResponse.json({ success: false, message: error?.message || "Failed to delete upcoming card" }, { status: 500 });
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
      return NextResponse.json({ success: false, message: "Upcoming card not found" }, { status: 404 });
    }

    revalidatePath("/");
    revalidatePath("/admin/upcoming");

    return NextResponse.json({ success: true, message: "Upcoming card publish status updated", data: normalize(result) });
  } catch (error: any) {
    console.error("Error toggling upcoming card publish:", error);
    return NextResponse.json({ success: false, message: error?.message || "Failed to update publish status" }, { status: 500 });
  }
}
