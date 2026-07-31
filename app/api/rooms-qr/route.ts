import { NextRequest, NextResponse } from "next/server";
import { getPublicSiteUrl, getBaseUrlFromRequest, buildExternalQrUrl } from "@/app/lib/qr-utils";

export const runtime = "nodejs";

/**
 * Returns a master QR for /view/rooms — the single QR shown on the display board.
 * Scanning it opens the full room directory page on the student's phone.
 */
export async function GET(request: NextRequest) {
  try {
    const requestBase = getBaseUrlFromRequest(request);
    const base = await getPublicSiteUrl(requestBase);
    const url = `${base}/view/rooms`;
    const qrCodeUrl = buildExternalQrUrl(url);
    return NextResponse.json({ success: true, data: { url, qrCodeUrl } });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : "Failed" },
      { status: 500 },
    );
  }
}
