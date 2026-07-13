import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { isDbDisabled } from "@/app/lib/config";
import { getDb } from "@/app/lib/mongodb";

export async function GET() {
  try {
    if (!isDbDisabled()) {
      const db = await getDb();
      const doc = await db.collection("DepartmentSettings").findOne();
      if (doc) {
        return NextResponse.json({
          marqueeText: doc.marqueeText ?? "",
          departmentName: doc.departmentName ?? "",
          universityName: doc.universityName ?? "",
        });
      }
    }
    return NextResponse.json({ marqueeText: "", departmentName: "", universityName: "" });
  } catch {
    return NextResponse.json({ marqueeText: "", departmentName: "", universityName: "" });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { marqueeText } = body;

    if (!isDbDisabled()) {
      const db = await getDb();
      const collection = db.collection("DepartmentSettings");
      const existing = await collection.findOne();
      if (existing) {
        await collection.updateOne({ _id: existing._id }, { $set: { marqueeText, updatedAt: new Date() } });
      } else {
        await collection.insertOne({ marqueeText, createdAt: new Date(), updatedAt: new Date() });
      }
    }

    revalidatePath("/");
    return NextResponse.json({ success: true, message: "Welcome text saved!" });
  } catch {
    return NextResponse.json({ success: false, message: "Failed to save" }, { status: 500 });
  }
}
