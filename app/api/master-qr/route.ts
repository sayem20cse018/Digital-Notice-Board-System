import { NextRequest, NextResponse } from "next/server";
import { getPublicSiteUrl, getBaseUrlFromRequest, buildExternalQrUrl } from "@/app/lib/qr-utils";

export const runtime = "nodejs";

/**
 * Returns the correct public URL for the master results QR.
 * Uses PUBLIC_APP_URL, LAN IP, or VERCEL_URL — never localhost.
 */
export async function GET(request: NextRequest) {
  try {
    const requestBase = getBaseUrlFromRequest(request);
    const base = await getPublicSiteUrl(requestBase);
    const url = `${base}/view/results`;
    const qrCodeUrl = buildExternalQrUrl(url);

    return NextResponse.json({ success: true, data: { url, qrCodeUrl } });
  } catch (error) {
    return NextResponse.json({ success: false, message: error instanceof Error ? error.message : "Failed" }, { status: 500 });
  }
}
