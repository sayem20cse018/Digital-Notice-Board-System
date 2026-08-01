import { NextRequest, NextResponse } from "next/server";
import { CONTENT_KEYS, listItems, createItem, updateItem, deleteItem } from "@/app/lib/content-store";
import { safeRevalidate } from "@/app/lib/revalidate";

export const runtime = "nodejs";

const { fileKey, mongoCollection } = CONTENT_KEYS.classRoutineSlots;

// A slot = one cell in the routine table
// day: 0=SUN 1=MON 2=TUE 3=WED 4=THU
// period: 1-8
// semester: "4-1" | "3-1" | "2-2" | "1-2" | "1-1"

export async function GET() {
  try {
    const items = await listItems(fileKey, mongoCollection);
    return NextResponse.json({ success: true, data: items });
  } catch (e) {
    return NextResponse.json({ success: false, message: e instanceof Error ? e.message : "Failed" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { day, period, semester, courseCode, courseName, teacherInitial, room } = body;

    if (day === undefined || period === undefined || !semester) {
      return NextResponse.json({ success: false, message: "day, period, semester required" }, { status: 400 });
    }

    // Upsert: delete existing slot for same day+period+semester first
    const existing = await listItems(fileKey, mongoCollection);
    const dup = existing.find(
      (i) => Number(i.day) === Number(day) && Number(i.period) === Number(period) && i.semester === semester,
    );
    if (dup) await deleteItem(fileKey, mongoCollection, String(dup.id));

    const id = await createItem(fileKey, mongoCollection, {
      day: Number(day),
      period: Number(period),
      semester: String(semester),
      courseCode: String(courseCode || "").trim(),
      courseName: String(courseName || "").trim(),
      teacherInitial: String(teacherInitial || "").trim(),
      room: String(room || "").trim(),
    });

    safeRevalidate("/", "/admin/class-routine-qr");
    return NextResponse.json({ success: true, id });
  } catch (e) {
    return NextResponse.json({ success: false, message: e instanceof Error ? e.message : "Failed" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, courseCode, courseName, teacherInitial, room } = body;
    if (!id) return NextResponse.json({ success: false, message: "ID required" }, { status: 400 });

    await updateItem(fileKey, mongoCollection, String(id), {
      courseCode: String(courseCode || "").trim(),
      courseName: String(courseName || "").trim(),
      teacherInitial: String(teacherInitial || "").trim(),
      room: String(room || "").trim(),
    });

    safeRevalidate("/", "/admin/class-routine-qr");
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ success: false, message: e instanceof Error ? e.message : "Failed" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const id = new URL(req.url).searchParams.get("id");
    if (!id) return NextResponse.json({ success: false, message: "ID required" }, { status: 400 });
    await deleteItem(fileKey, mongoCollection, id);
    safeRevalidate("/", "/admin/class-routine-qr");
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ success: false, message: e instanceof Error ? e.message : "Failed" }, { status: 500 });
  }
}
