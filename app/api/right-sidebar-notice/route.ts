import { NextRequest, NextResponse } from "next/server";
import { CONTENT_KEYS, createItem, deleteItem, listItems, updateItem } from "@/app/lib/content-store";
import { safeRevalidate } from "@/app/lib/revalidate";

export const runtime = "nodejs";

const { fileKey, mongoCollection } = CONTENT_KEYS.rightSidebarNotice;

export async function GET() {
	try {
		const data = await listItems(fileKey, mongoCollection);
		return NextResponse.json({ success: true, data });
	} catch (error: unknown) {
		const message = error instanceof Error ? error.message : "Failed to fetch notices";
		console.error("Error fetching right sidebar notices:", error);
		return NextResponse.json({ success: false, message }, { status: 500 });
	}
}

export async function POST(request: NextRequest) {
	try {
		const body = await request.json();
		const { title, imageUrl, fileUrl, displayOrder, published } = body;

		if (!title || !String(title).trim()) {
			return NextResponse.json({ success: false, message: "Title is required" }, { status: 400 });
		}

		const id = await createItem(fileKey, mongoCollection, {
			title: String(title).trim(),
			imageUrl: imageUrl?.trim() || null,
			fileUrl: fileUrl?.trim() || null,
			displayOrder: Number(displayOrder) || 0,
			published: published !== false,
		});

		safeRevalidate("/", "/admin/right-sidebar-notice");
		return NextResponse.json({
			success: true,
			message: "Notice created successfully",
			data: { id },
		});
	} catch (error: unknown) {
		const message = error instanceof Error ? error.message : "Failed to create notice";
		console.error("Error creating right sidebar notice:", error);
		return NextResponse.json({ success: false, message }, { status: 500 });
	}
}

export async function PUT(request: NextRequest) {
	try {
		const body = await request.json();
		const { id, title, imageUrl, fileUrl, displayOrder, published } = body;

		if (!id || !title || !String(title).trim()) {
			return NextResponse.json({ success: false, message: "ID and title are required" }, { status: 400 });
		}

		const updated = await updateItem(fileKey, mongoCollection, String(id), {
			title: String(title).trim(),
			imageUrl: imageUrl?.trim() || null,
			fileUrl: fileUrl?.trim() || null,
			displayOrder: Number(displayOrder) || 0,
			published: Boolean(published),
		});

		if (!updated) {
			return NextResponse.json({ success: false, message: "Item not found" }, { status: 404 });
		}
		safeRevalidate("/", "/admin/right-sidebar-notice");
		return NextResponse.json({ success: true, message: "Notice updated successfully" });
	} catch (error: unknown) {
		const message = error instanceof Error ? error.message : "Failed to update notice";
		console.error("Error updating right sidebar notice:", error);
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

		safeRevalidate("/", "/admin/right-sidebar-notice");
		return NextResponse.json({ success: true, message: "Notice deleted successfully" });
	} catch (error: unknown) {
		const message = error instanceof Error ? error.message : "Failed to delete notice";
		console.error("Error deleting right sidebar notice:", error);
		return NextResponse.json({ success: false, message }, { status: 500 });
	}
}
