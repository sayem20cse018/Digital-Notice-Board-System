import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { getAdminPreferences, saveAdminPreferences } from "@/app/lib/display-settings";
import { parseAdminPreferences } from "@/app/lib/display-config";

export async function GET() {
  const prefs = await getAdminPreferences();
  return NextResponse.json({ success: true, data: prefs });
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const preferences = parseAdminPreferences(body);
    const result = await saveAdminPreferences(preferences);

    if (result.success) {
      revalidatePath("/");
      revalidatePath("/admin");
      revalidatePath("/admin/control-center");
    }

    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ success: false, message: "Invalid request" }, { status: 400 });
  }
}
