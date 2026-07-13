import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
	try {
		const formData = await request.formData();
		const file = formData.get("file");

		if (!file || !(file instanceof File)) {
			return NextResponse.json({ success: false, error: "No file uploaded" }, { status: 400 });
		}

		const allowedTypes = [
			"image/jpeg",
			"image/jpg",
			"image/png",
			"image/webp",
			"image/gif",
			"application/pdf",
			"application/msword",
			"application/vnd.openxmlformats-officedocument.wordprocessingml.document",
			"application/vnd.ms-excel",
			"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
		];

		if (!allowedTypes.includes(file.type)) {
			return NextResponse.json(
				{ success: false, error: "Invalid file type. Allowed: Images, PDF, Word, Excel" },
				{ status: 400 },
			);
		}

		const maxSize = 10 * 1024 * 1024;
		if (file.size > maxSize) {
			return NextResponse.json({ success: false, error: "File too large (max 10MB)" }, { status: 400 });
		}

		const bytes = await file.arrayBuffer();
		const buffer = Buffer.from(bytes);

		const uploadsDir = join(process.cwd(), "public", "uploads");
		if (!existsSync(uploadsDir)) {
			await mkdir(uploadsDir, { recursive: true });
		}

		const timestamp = Date.now();
		const filename = `${timestamp}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
		const filepath = join(uploadsDir, filename);

		await writeFile(filepath, buffer);

		const url = `/uploads/${filename}`;
		return NextResponse.json({ success: true, url });
	} catch (error) {
		console.error("Upload error:", error);
		const message = error instanceof Error ? error.message : "Upload failed";
		return NextResponse.json({ success: false, error: message }, { status: 500 });
	}
}
