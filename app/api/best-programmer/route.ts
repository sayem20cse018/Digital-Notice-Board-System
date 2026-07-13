import { NextRequest, NextResponse } from "next/server";
import { CONTENT_KEYS, createItem, deleteItem, listItems, updateItem } from "@/app/lib/content-store";
import { safeRevalidate } from "@/app/lib/revalidate";

export const runtime = "nodejs";

const { fileKey, mongoCollection } = CONTENT_KEYS.bestProgrammer;

export async function GET() {
	try {
		const data = await listItems(fileKey, mongoCollection);
		return NextResponse.json({ success: true, data });
	} catch (error: unknown) {
		const message = error instanceof Error ? error.message : "Failed to fetch best programmers";
		console.error("Error fetching best programmers:", error);
		return NextResponse.json({ success: false, message }, { status: 500 });
	}
}

export async function POST(request: NextRequest) {
	try {
		const body = await request.json();
		const { name, photoUrl, description, displayOrder, published } = body;

		if (!name || !String(name).trim()) {
			return NextResponse.json({ success: false, message: "Name is required" }, { status: 400 });
		}

		const id = await createItem(fileKey, mongoCollection, {
			name: String(name).trim(),
			photoUrl: photoUrl?.trim() || null,
			description: description?.trim() || null,
			displayOrder: Number(displayOrder) || 0,
			published: published !== false,
		});

		safeRevalidate("/", "/admin/best-programmer");
		return NextResponse.json({
			success: true,
			message: "Best programmer created successfully",
			data: { id },
		});
	} catch (error: unknown) {
		const message = error instanceof Error ? error.message : "Failed to create best programmer";
		console.error("Error creating best programmer:", error);
		return NextResponse.json({ success: false, message }, { status: 500 });
	}
}

export async function PUT(request: NextRequest) {
	try {
		const body = await request.json();
		const { id, name, photoUrl, description, displayOrder, published } = body;

		if (!id || !name || !String(name).trim()) {
			return NextResponse.json({ success: false, message: "ID and name are required" }, { status: 400 });
		}

		const updated = await updateItem(fileKey, mongoCollection, String(id), {
			name: String(name).trim(),
			photoUrl: photoUrl?.trim() || null,
			description: description?.trim() || null,
			displayOrder: Number(displayOrder) || 0,
			published: Boolean(published),
		});

		if (!updated) {
			return NextResponse.json({ success: false, message: "Item not found" }, { status: 404 });
		}

		safeRevalidate("/", "/admin/best-programmer");
		return NextResponse.json({ success: true, message: "Best programmer updated successfully" });
	} catch (error: unknown) {
		const message = error instanceof Error ? error.message : "Failed to update best programmer";
		console.error("Error updating best programmer:", error);
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

		safeRevalidate("/", "/admin/best-programmer");
		return NextResponse.json({ success: true, message: "Best programmer deleted successfully" });
	} catch (error: unknown) {
		const message = error instanceof Error ? error.message : "Failed to delete best programmer";
		console.error("Error deleting best programmer:", error);
		return NextResponse.json({ success: false, message }, { status: 500 });
	}
}
