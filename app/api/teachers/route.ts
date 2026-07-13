import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { isDbDisabled } from "@/app/lib/config";
import { revalidatePath } from "next/cache";
import { getDb } from "@/app/lib/mongodb";

const COLLECTION = "Teacher";

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
    const teachers = await db.collection(COLLECTION).find().sort({ createdAt: -1 }).toArray();
    return NextResponse.json({ success: true, data: teachers.map(normalize) });
  } catch (error: any) {
    console.error("Error fetching teachers:", error);
    return NextResponse.json({ success: false, message: error?.message || "Failed to fetch teachers" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  if (isDbDisabled()) {
    return NextResponse.json({ success: false, message: "Database is disabled" }, { status: 503 });
  }

  try {
    const body = await request.json();
    const { name, title, bio, photoUrl } = body;

    if (!name || !name.trim()) {
      return NextResponse.json({ success: false, message: "Name is required" }, { status: 400 });
    }

    const db = await getDb();
    const created = await db.collection(COLLECTION).insertOne({
      name: name.trim(),
      title: title?.trim() || null,
      bio: bio?.trim() || null,
      photoUrl: photoUrl?.trim() || null,
      isFeatured: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    revalidatePath("/");
    revalidatePath("/admin/teachers");

    return NextResponse.json({ success: true, message: "Teacher created successfully", data: { id: created.insertedId.toString() } });
  } catch (error: any) {
    console.error("Error creating teacher:", error);
    return NextResponse.json({ success: false, message: error?.message || "Failed to create teacher" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  if (isDbDisabled()) {
    return NextResponse.json({ success: false, message: "Database is disabled" }, { status: 503 });
  }

  try {
    const body = await request.json();
    const { id, name, title, bio, photoUrl } = body;

    if (!id || !name || !name.trim()) {
      return NextResponse.json({ success: false, message: "ID and name are required" }, { status: 400 });
    }

    const db = await getDb();
    const result = await db.collection(COLLECTION).findOneAndUpdate(
      { _id: toObjectId(id) },
      {
        $set: {
          name: name.trim(),
          title: title?.trim() || null,
          bio: bio?.trim() || null,
          photoUrl: photoUrl?.trim() || null,
          updatedAt: new Date(),
        },
      },
      { returnDocument: "after" },
    );

    if (!result) {
      return NextResponse.json({ success: false, message: "Teacher not found" }, { status: 404 });
    }

    revalidatePath("/");
    revalidatePath("/admin/teachers");

    return NextResponse.json({ success: true, message: "Teacher updated successfully", data: normalize(result) });
  } catch (error: any) {
    console.error("Error updating teacher:", error);
    return NextResponse.json({ success: false, message: error?.message || "Failed to update teacher" }, { status: 500 });
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
      return NextResponse.json({ success: false, message: "Teacher not found" }, { status: 404 });
    }

    revalidatePath("/");
    revalidatePath("/admin/teachers");

    return NextResponse.json({ success: true, message: "Teacher deleted successfully" });
  } catch (error: any) {
    console.error("Error deleting teacher:", error);
    return NextResponse.json({ success: false, message: error?.message || "Failed to delete teacher" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  if (isDbDisabled()) {
    return NextResponse.json({ success: false, message: "Database is disabled" }, { status: 503 });
  }

  try {
    const body = await request.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json({ success: false, message: "ID is required" }, { status: 400 });
    }

    const db = await getDb();
    const collection = db.collection(COLLECTION);
    const teacher = await collection.findOne({ _id: toObjectId(id) });
    if (!teacher) {
      return NextResponse.json({ success: false, message: "Teacher not found" }, { status: 404 });
    }

    const updated = await collection.findOneAndUpdate(
      { _id: teacher._id },
      { $set: { isFeatured: !teacher.isFeatured, updatedAt: new Date() } },
      { returnDocument: "after" },
    );

    revalidatePath("/");
    revalidatePath("/admin/teachers");

    return NextResponse.json({ success: true, message: "Teacher feature toggled", data: normalize(updated) });
  } catch (error: any) {
    console.error("Error toggling teacher feature:", error);
    return NextResponse.json({ success: false, message: error?.message || "Failed to toggle feature" }, { status: 500 });
  }
}
