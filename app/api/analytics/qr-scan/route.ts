import { NextResponse } from "next/server";

/** Track QR scan events for admin analytics. */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { type, id, title } = body as { type?: string; id?: string; title?: string };
    if (!type || !id) {
      return NextResponse.json({ success: false, message: "Missing type or id" }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      data: {
        type,
        id,
        title: title ?? id,
        scannedAt: new Date().toISOString(),
      },
    });
  } catch {
    return NextResponse.json({ success: false, message: "Invalid request" }, { status: 400 });
  }
}
