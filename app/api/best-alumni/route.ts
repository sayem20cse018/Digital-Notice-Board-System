import { NextRequest, NextResponse } from "next/server";
import { CONTENT_KEYS, createItem, deleteItem, listItems, updateItem } from "@/app/lib/content-store";
import { safeRevalidate } from "@/app/lib/revalidate";

export const runtime = "nodejs";

const { fileKey, mongoCollection } = CONTENT_KEYS.bestAlumni;

export async function GET() {
	try {
		const data = await listItems(fileKey, mongoCollection);
		return NextResponse.json({ success: true, data });
	} catch (error: unknown) {
		const message = error instanceof Error ? error.message : "Failed to fetch best alumni";
		console.error("Error fetching best alumni:", error);
		return NextResponse.json({ success: false, message }, { status: 500 });
	}
}

export async function POST(request: NextRequest) {
	try {
		const body = await request.json();
		const { title, imageUrl, linkUrl, note, displayOrder, published } = body;

		if (!title || !String(title).trim()) {
			return NextResponse.json({ success: false, message: "Title is required" }, { status: 400 });
		}

		const id = await createItem(fileKey, mongoCollection, {
			title: String(title).trim(),
			imageUrl: imageUrl?.trim() || null,
			linkUrl: linkUrl?.trim() || null,
			note: note?.trim() || null,
			displayOrder: Number(displayOrder) || 0,
			published: published !== false,
		});

		safeRevalidate("/", "/admin/best-alumni");
		return NextResponse.json({
			success: true,
			message: "Best alumni created successfully",
			data: { id },
		});
	} catch (error: unknown) {
		const message = error instanceof Error ? error.message : "Failed to create best alumni";
		console.error("Error creating best alumni:", error);
		return NextResponse.json({ success: false, message }, { status: 500 });
	}
}

export async function PUT(request: NextRequest) {
	try {
		const body = await request.json();
		const { id, title, imageUrl, linkUrl, note, displayOrder, published } = body;

		if (!id || !title || !String(title).trim()) {
			return NextResponse.json({ success: false, message: "ID and title are required" }, { status: 400 });
		}

		const updated = await updateItem(fileKey, mongoCollection, String(id), {
			title: String(title).trim(),
			imageUrl: imageUrl?.trim() || null,
			linkUrl: linkUrl?.trim() || null,
			note: note?.trim() || null,
			displayOrder: Number(displayOrder) || 0,
			published: Boolean(published),
		});

		if (!updated) {
			return NextResponse.json({ success: false, message: "Item not found" }, { status: 404 });
		}

		safeRevalidate("/", "/admin/best-alumni");
		return NextResponse.json({ success: true, message: "Best alumni updated successfully" });
	} catch (error: unknown) {
		const message = error instanceof Error ? error.message : "Failed to update best alumni";
		console.error("Error updating best alumni:", error);
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

		safeRevalidate("/", "/admin/best-alumni");
		return NextResponse.json({ success: true, message: "Best alumni deleted successfully" });
	} catch (error: unknown) {
		const message = error instanceof Error ? error.message : "Failed to delete best alumni";
		console.error("Error deleting best alumni:", error);
		return NextResponse.json({ success: false, message }, { status: 500 });
	}
}
