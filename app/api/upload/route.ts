import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

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

const MAX_SIZE = 10 * 1024 * 1024; // 10MB

/** Upload to Cloudinary using unsigned upload preset */
async function uploadToCloudinary(
	bytes: ArrayBuffer,
	filename: string,
	mimeType: string,
): Promise<string> {
	const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
	const uploadPreset = process.env.CLOUDINARY_UPLOAD_PRESET;

	if (!cloudName || !uploadPreset) {
		throw new Error(
			"Cloudinary not configured. Set CLOUDINARY_CLOUD_NAME and CLOUDINARY_UPLOAD_PRESET.",
		);
	}

	// Use the original ArrayBuffer directly — no Buffer conversion needed
	const blob = new Blob([bytes], { type: mimeType });
	const formData = new FormData();
	formData.append("file", blob, filename);
	formData.append("upload_preset", uploadPreset);
	formData.append("folder", "notis-app");

	const res = await fetch(
		`https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`,
		{ method: "POST", body: formData },
	);

	if (!res.ok) {
		const err = await res.text();
		throw new Error(`Cloudinary upload failed: ${err}`);
	}

	const data = (await res.json()) as { secure_url: string };
	return data.secure_url;
}

/** Upload to local /public/uploads — only for local development */
async function uploadToLocal(bytes: ArrayBuffer, filename: string): Promise<string> {
	const { writeFile, mkdir } = await import("fs/promises");
	const { existsSync } = await import("fs");
	const { join } = await import("path");

	const uploadsDir = join(process.cwd(), "public", "uploads");
	if (!existsSync(uploadsDir)) {
		await mkdir(uploadsDir, { recursive: true });
	}

	const timestamp = Date.now();
	const safeFilename = `${timestamp}-${filename.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
	const filepath = join(uploadsDir, safeFilename);

	await writeFile(filepath, Buffer.from(bytes));
	return `/uploads/${safeFilename}`;
}

export async function POST(request: NextRequest) {
	try {
		const formData = await request.formData();
		const file = formData.get("file");

		if (!file || !(file instanceof File)) {
			return NextResponse.json({ success: false, error: "No file uploaded" }, { status: 400 });
		}

		if (!allowedTypes.includes(file.type)) {
			return NextResponse.json(
				{ success: false, error: "Invalid file type. Allowed: Images, PDF, Word, Excel" },
				{ status: 400 },
			);
		}

		if (file.size > MAX_SIZE) {
			return NextResponse.json(
				{ success: false, error: "File too large (max 10MB)" },
				{ status: 400 },
			);
		}

		// Get raw ArrayBuffer — no Buffer conversion, avoids TypeScript strict type issues
		const bytes = await file.arrayBuffer();

		let url: string;

		const isVercel = Boolean(process.env.VERCEL);
		const hasCloudinary = Boolean(
			process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_UPLOAD_PRESET,
		);

		if (isVercel || hasCloudinary) {
			url = await uploadToCloudinary(bytes, file.name, file.type);
		} else {
			url = await uploadToLocal(bytes, file.name);
		}

		return NextResponse.json({ success: true, url });
	} catch (error) {
		console.error("Upload error:", error);
		const message = error instanceof Error ? error.message : "Upload failed";
		return NextResponse.json({ success: false, error: message }, { status: 500 });
	}
}
