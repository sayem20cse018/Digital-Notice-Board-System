import { NextRequest, NextResponse } from "next/server";
import { CONTENT_KEYS, createItem, deleteItem, listItems, updateItem } from "@/app/lib/content-store";
import { safeRevalidate } from "@/app/lib/revalidate";

export const runtime = "nodejs";

const { fileKey, mongoCollection } = CONTENT_KEYS.helpCenter;

function normalizeContactType(value: unknown): "office" | "crs" {
	return value === "crs" ? "crs" : "office";
}

export async function GET() {
	try {
		const data = await listItems(fileKey, mongoCollection);
		return NextResponse.json({ success: true, data });
	} catch (error: unknown) {
		const message = error instanceof Error ? error.message : "Failed to fetch help center";
		console.error("Error fetching help center:", error);
		return NextResponse.json({ success: false, message }, { status: 500 });
	}
}

export async function POST(request: NextRequest) {
	try {
		const body = await request.json();
		const { officeName, phoneNumber, qrCodeUrl, contactType, displayOrder, published } = body;

		if (!officeName?.trim()) {
			return NextResponse.json(
				{ success: false, message: "Office name is required" },
				{ status: 400 },
			);
		}

		const id = await createItem(fileKey, mongoCollection, {
			officeName: String(officeName).trim(),
			phoneNumber: String(phoneNumber ?? "").trim(),
			qrCodeUrl: qrCodeUrl?.trim() || null,
			contactType: normalizeContactType(contactType),
			displayOrder: Number(displayOrder) || 0,
			published: published !== false,
		});

		safeRevalidate("/", "/admin/help-center");
		return NextResponse.json({
			success: true,
			message: "Help center entry created successfully",
			data: { id },
		});
	} catch (error: unknown) {
		const message = error instanceof Error ? error.message : "Failed to create help center entry";
		console.error("Error creating help center entry:", error);
		return NextResponse.json({ success: false, message }, { status: 500 });
	}
}

export async function PUT(request: NextRequest) {
	try {
		const body = await request.json();
		const { id, officeName, phoneNumber, qrCodeUrl, contactType, displayOrder, published } = body;

		if (!id || !officeName?.trim()) {
			return NextResponse.json(
				{ success: false, message: "ID and office name are required" },
				{ status: 400 },
			);
		}

		const updated = await updateItem(fileKey, mongoCollection, String(id), {
			officeName: String(officeName).trim(),
			phoneNumber: String(phoneNumber ?? "").trim(),
			qrCodeUrl: qrCodeUrl?.trim() || null,
			contactType: normalizeContactType(contactType),
			displayOrder: Number(displayOrder) || 0,
			published: Boolean(published),
		});

		if (!updated) {
			return NextResponse.json({ success: false, message: "Item not found" }, { status: 404 });
		}

		safeRevalidate("/", "/admin/help-center");
		return NextResponse.json({ success: true, message: "Help center entry updated successfully" });
	} catch (error: unknown) {
		const message = error instanceof Error ? error.message : "Failed to update help center entry";
		console.error("Error updating help center entry:", error);
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
		console.error("Error deleting help center entry:", error);
		return NextResponse.json({ success: false, message }, { status: 500 });
	}
}
