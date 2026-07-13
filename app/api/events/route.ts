import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { isDbDisabled } from "@/app/lib/config";
import { revalidatePath } from "next/cache";
import { getDb } from "@/app/lib/mongodb";

const COLLECTION = "EventItem";

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
    const events = await db.collection(COLLECTION).find().sort({ startsAt: -1 }).toArray();
    return NextResponse.json({ success: true, data: events.map(normalize) });
  } catch (error: any) {
    console.error("Error fetching events:", error);
    return NextResponse.json({ success: false, message: error?.message || "Failed to fetch events" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  if (isDbDisabled()) {
    return NextResponse.json({ success: false, message: "Database is disabled" }, { status: 503 });
  }

  try {
    const body = await request.json();
    const { title, description, location, startsAt, imageUrl, published } = body;

    if (!title || !title.trim() || !startsAt) {
      return NextResponse.json({ success: false, message: "Title and start date are required" }, { status: 400 });
    }

    const db = await getDb();
    const created = await db.collection(COLLECTION).insertOne({
      title: title.trim(),
      description: description?.trim() || null,
      location: location?.trim() || null,
      imageUrl: imageUrl?.trim() || null,
      startsAt: new Date(startsAt),
      published: Boolean(published),
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    revalidatePath("/");
    revalidatePath("/admin/events");

    return NextResponse.json({ success: true, message: "Event created successfully", data: { id: created.insertedId.toString() } });
  } catch (error: any) {
    console.error("Error creating event:", error);
    return NextResponse.json({ success: false, message: error?.message || "Failed to create event" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  if (isDbDisabled()) {
    return NextResponse.json({ success: false, message: "Database is disabled" }, { status: 503 });
  }

  try {
    const body = await request.json();
    const { id, title, description, location, startsAt, imageUrl, published } = body;

    if (!id || !title || !title.trim() || !startsAt) {
      return NextResponse.json({ success: false, message: "ID, title and start date are required" }, { status: 400 });
    }

    const db = await getDb();
    const result = await db.collection(COLLECTION).findOneAndUpdate(
      { _id: toObjectId(id) },
      {
        $set: {
          title: title.trim(),
          description: description?.trim() || null,
          location: location?.trim() || null,
          imageUrl: imageUrl?.trim() || null,
          startsAt: new Date(startsAt),
          published: Boolean(published),
          updatedAt: new Date(),
        },
      },
      { returnDocument: "after" },
    );

    if (!result) {
      return NextResponse.json({ success: false, message: "Event not found" }, { status: 404 });
    }

    revalidatePath("/");
    revalidatePath("/admin/events");

    return NextResponse.json({ success: true, message: "Event updated successfully", data: normalize(result) });
  } catch (error: any) {
    console.error("Error updating event:", error);
    return NextResponse.json({ success: false, message: error?.message || "Failed to update event" }, { status: 500 });
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
      return NextResponse.json({ success: false, message: "Event not found" }, { status: 404 });
    }

    revalidatePath("/");
    revalidatePath("/admin/events");

    return NextResponse.json({ success: true, message: "Event deleted successfully" });
  } catch (error: any) {
    console.error("Error deleting event:", error);
    return NextResponse.json({ success: false, message: error?.message || "Failed to delete event" }, { status: 500 });
  }
}
