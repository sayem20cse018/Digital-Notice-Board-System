import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { CONTENT_KEYS, listItems } from "@/app/lib/content-store";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, password, type } = body;

    if (!id || !type) {
      return NextResponse.json({ success: false, message: "Missing fields" }, { status: 400 });
    }

    if (type === "teacher-list") {
      // No password for teacher list
      const items = await listItems(CONTENT_KEYS.teacherList.fileKey, CONTENT_KEYS.teacherList.mongoCollection);
      const item = items.find((i) => String(i.id) === String(id) && i.published);
      if (!item) return NextResponse.json({ success: false, message: "Not found" }, { status: 404 });
      return NextResponse.json({ success: true, data: { title: String(item.title || ""), fileUrl: String(item.fileUrl || "") } });
    }

    if (type === "result") {
      if (!password) return NextResponse.json({ success: false, message: "Password required" }, { status: 400 });
      const items = await listItems(CONTENT_KEYS.secureResult.fileKey, CONTENT_KEYS.secureResult.mongoCollection);
      const item = items.find((i) => String(i.id) === String(id) && i.published);
      if (!item) return NextResponse.json({ success: false, message: "Not found" }, { status: 404 });

      const valid = await bcrypt.compare(String(password), String(item.passwordHash || ""));
      if (!valid) return NextResponse.json({ success: false, message: "Incorrect password" }, { status: 401 });

      return NextResponse.json({ success: true, data: { title: String(item.title || ""), fileUrl: String(item.fileUrl || "") } });
    }

    return NextResponse.json({ success: false, message: "Invalid type" }, { status: 400 });
  } catch (error: unknown) {
    return NextResponse.json({ success: false, message: error instanceof Error ? error.message : "Error" }, { status: 500 });
  }
}
