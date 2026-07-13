import { NextResponse } from "next/server";
import { getDb } from "@/app/lib/mongodb";
import { isDbDisabled } from "@/app/lib/config";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
	const status: Record<string, unknown> = {
		timestamp: new Date().toISOString(),
		dbDisabled: isDbDisabled(),
	};

	if (isDbDisabled()) {
		status.db = "disabled (SKIP_DB=1)";
		return NextResponse.json(status);
	}

	try {
		const db = await getDb();

		const collections = [
			"BestAlumni",
			"BestProgrammer",
			"HighlightNews",
			"RightSidebarNotice",
			"HelpCenter",
			"SecureResult",
			"TeacherList",
			"Researcher",
			"DepartmentSettings",
			"AdminPreferences",
		];

		const counts: Record<string, number> = {};
		for (const col of collections) {
			counts[col] = await db.collection(col).countDocuments();
		}

		status.db = "connected";
		status.counts = counts;
	} catch (error) {
		status.db = "error";
		status.error = error instanceof Error ? error.message : String(error);
	}

	return NextResponse.json(status);
}
