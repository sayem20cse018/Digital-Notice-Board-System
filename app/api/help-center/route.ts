import { NextRequest, NextResponse } from "next/server";
import { CONTENT_KEYS, createItem, deleteItem, listItems, updateItem } from "@/app/lib/content-store";
import { getPublicSiteUrl, getBaseUrlFromRequest } from "@/app/lib/qr-utils";
import { safeRevalidate } from "@/app/lib/revalidate";
import QRCode from "qrcode";
import { existsSync } from "fs";
import { mkdir, writeFile } from "fs/promises";
import { join } from "path";

export const runtime = "nodejs";

const { fileKey, mongoCollection } = CONTENT_KEYS.helpCenter;

const UPLOAD_DIR = join(process.cwd(), "public", "uploads");

function normalizeContactType(value: unknown): "office" | "crs" {
	return value === "crs" ? "crs" : "office";
}

/**
 * Generate a QR code pointing to a file URL.
 * If fileUrl is relative (/uploads/...), prepend the public base URL
 * so phones on any network can reach it.
 */
async function generateHelpQr(
	fileUrl: string,
	id: string,
	contactType: string,
	requestBase: string | null,
): Promise<string> {
	let targetUrl = fileUrl;
	if (!fileUrl.startsWith("http://") && !fileUrl.startsWith("https://")) {
		const base = await getPublicSiteUrl(requestBase);
		targetUrl = `${base}${fileUrl.startsWith("/") ? "" : "/"}${fileUrl}`;
	}

	if (!existsSync(UPLOAD_DIR)) {
		await mkdir(UPLOAD_DIR, { recursive: true });
	}

	const filename = `qr-help-${contactType}-${id}.png`;
	const filepath = join(UPLOAD_DIR, filename);

	const buffer = await QRCode.toBuffer(targetUrl, {
		width: 400,
		margin: 2,
		color: { dark: "#7f1d1d", light: "#ffffff" },
	});

	await writeFile(filepath, buffer);
	return `/uploads/${filename}`;
}

export async function GET() {
	try {
		const data = await listItems(fileKey, mongoCollection);
		return NextResponse.json({ success: true, data });
	} catch (error: unknown) {
		const message = error instanceof Error ? error.message : "Failed to fetch help center";
		return NextResponse.json({ success: false, message }, { status: 500 });
	}
}

export async function POST(request: NextRequest) {
	try {
		const body = await request.json();
		const { officeName, phoneNumber, fileUrl, contactType, displayOrder, published } = body;

		if (!officeName?.trim()) {
			return NextResponse.json({ success: false, message: "Office name is required" }, { status: 400 });
		}

		const ct = normalizeContactType(contactType);

		const id = await createItem(fileKey, mongoCollection, {
			officeName: String(officeName).trim(),
			phoneNumber: String(phoneNumber ?? "").trim(),
			fileUrl: fileUrl?.trim() || null,
			qrCodeUrl: null,
			contactType: ct,
			displayOrder: Number(displayOrder) || 0,
			published: published !== false,
		});

		// Generate QR server-side if a file was provided
		let qrCodeUrl: string | null = null;
		if (fileUrl?.trim()) {
			const requestBase = getBaseUrlFromRequest(request);
			qrCodeUrl = await generateHelpQr(fileUrl.trim(), id, ct, requestBase);
			await updateItem(fileKey, mongoCollection, id, { qrCodeUrl });
		}

		safeRevalidate("/", "/admin/help-center");
		return NextResponse.json({
			success: true,
			message: "Help center entry created successfully",
			data: { id, qrCodeUrl },
		});
	} catch (error: unknown) {
		const message = error instanceof Error ? error.message : "Failed to create help center entry";
		return NextResponse.json({ success: false, message }, { status: 500 });
	}
}

export async function PUT(request: NextRequest) {
	try {
		const body = await request.json();
		const { id, officeName, phoneNumber, fileUrl, contactType, displayOrder, published } = body;

		if (!id || !officeName?.trim()) {
			return NextResponse.json({ success: false, message: "ID and office name are required" }, { status: 400 });
		}

		const ct = normalizeContactType(contactType);

		await updateItem(fileKey, mongoCollection, String(id), {
			officeName: String(officeName).trim(),
			phoneNumber: String(phoneNumber ?? "").trim(),
			fileUrl: fileUrl?.trim() || null,
			contactType: ct,
			displayOrder: Number(displayOrder) || 0,
			published: Boolean(published),
		});

		// Regenerate QR server-side if a file was provided
		let qrCodeUrl: string | null = null;
		if (fileUrl?.trim()) {
			const requestBase = getBaseUrlFromRequest(request);
			qrCodeUrl = await generateHelpQr(fileUrl.trim(), String(id), ct, requestBase);
			await updateItem(fileKey, mongoCollection, String(id), { qrCodeUrl });
		}

		safeRevalidate("/", "/admin/help-center");
		return NextResponse.json({
			success: true,
			message: "Help center entry updated successfully",
			data: { qrCodeUrl },
		});
	} catch (error: unknown) {
		const message = error instanceof Error ? error.message : "Failed to update help center entry";
		return NextResponse.json({ success: false, message }, { status: 500 });
	}
}

export async function DELETE(request: NextRequest) {
	try {
		const id = new URL(request.url).searchParams.get("id");
		if (!id) {
			return NextResponse.json({ success: false, message: "ID is required" }, { status: 400 });
		}

		const deleted = await deleteItem(fileKey, mongoCollection, id);
		if (!deleted) {
			return NextResponse.json({ success: false, message: "Item not found" }, { status: 404 });
		}

		safeRevalidate("/", "/admin/help-center");
		return NextResponse.json({ success: true, message: "Help center entry deleted successfully" });
	} catch (error: unknown) {
		const message = error instanceof Error ? error.message : "Failed to delete help center entry";
		return NextResponse.json({ success: false, message }, { status: 500 });
	}
}
