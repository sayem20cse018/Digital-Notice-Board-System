import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { isDbDisabled } from "@/app/lib/config";
import { revalidatePath } from "next/cache";
import { getDb } from "@/app/lib/mongodb";

const COLLECTION = "ClassRoutine";

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
    const routines = await db
      .collection(COLLECTION)
      .find()
      .sort({ dayOfWeek: 1, period: 1 })
      .toArray();
    return NextResponse.json({ success: true, data: routines.map(normalize) });
  } catch (error: any) {
    console.error("Error fetching class routines:", error);
    return NextResponse.json({ success: false, message: error?.message || "Failed to fetch routines" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  if (isDbDisabled()) {
    return NextResponse.json({ success: false, message: "Database is disabled" }, { status: 503 });
  }

  try {
    const body = await request.json();
    const { className, dayOfWeek, period, subject, teacher, room, fileUrl } = body;

    if (!className || !className.trim() || !subject || !subject.trim()) {
      return NextResponse.json({ success: false, message: "Class name and subject are required" }, { status: 400 });
    }

    const db = await getDb();
    const created = await db.collection(COLLECTION).insertOne({
        className: className.trim(),
        dayOfWeek: Number(dayOfWeek) || 0,
        period: Number(period) || 1,
        subject: subject.trim(),
        teacher: teacher?.trim() || null,
        room: room?.trim() || null,
        fileUrl: fileUrl?.trim() || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    revalidatePath("/");
    revalidatePath("/admin/routine");

    return NextResponse.json({ success: true, message: "Class routine created successfully", data: { id: created.insertedId.toString() } });
  } catch (error: any) {
    console.error("Error creating class routine:", error);
    return NextResponse.json({ success: false, message: error?.message || "Failed to create routine" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  if (isDbDisabled()) {
    return NextResponse.json({ success: false, message: "Database is disabled" }, { status: 503 });
  }

  try {
    const body = await request.json();
    const { id, className, dayOfWeek, period, subject, teacher, room, fileUrl } = body;

    if (!id || !className || !className.trim() || !subject || !subject.trim()) {
      return NextResponse.json({ success: false, message: "ID, class name and subject are required" }, { status: 400 });
    }

    const db = await getDb();
    const result = await db.collection(COLLECTION).findOneAndUpdate(
      { _id: toObjectId(id) },
      {
        $set: {
        className: className.trim(),
        dayOfWeek: Number(dayOfWeek) || 0,
        period: Number(period) || 1,
        subject: subject.trim(),
        teacher: teacher?.trim() || null,
        room: room?.trim() || null,
        fileUrl: fileUrl?.trim() || null,
          updatedAt: new Date(),
      },
      },
      { returnDocument: "after" },
    );

    if (!result) {
      return NextResponse.json({ success: false, message: "Class routine not found" }, { status: 404 });
    }

    revalidatePath("/");
    revalidatePath("/admin/routine");

    return NextResponse.json({ success: true, message: "Class routine updated successfully", data: normalize(result) });
  } catch (error: any) {
    console.error("Error updating class routine:", error);
    return NextResponse.json({ success: false, message: error?.message || "Failed to update routine" }, { status: 500 });
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
      return NextResponse.json({ success: false, message: "Class routine not found" }, { status: 404 });
    }

    revalidatePath("/");
    revalidatePath("/admin/routine");

    return NextResponse.json({ success: true, message: "Class routine deleted successfully" });
  } catch (error: any) {
    console.error("Error deleting class routine:", error);
    return NextResponse.json({ success: false, message: error?.message || "Failed to delete routine" }, { status: 500 });
  }
}
