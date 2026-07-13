import { NextRequest, NextResponse } from "next/server";
import { CONTENT_KEYS, createItem, deleteItem, listItems, updateItem } from "@/app/lib/content-store";
import { safeRevalidate } from "@/app/lib/revalidate";

export const runtime = "nodejs";

const { fileKey, mongoCollection } = CONTENT_KEYS.researcher;

export async function GET() {
	try {
		const data = await listItems(fileKey, mongoCollection);
		return NextResponse.json({ success: true, data });
	} catch (error: unknown) {
		const message = error instanceof Error ? error.message : "Failed to fetch researchers";
		console.error("Error fetching researchers:", error);
		return NextResponse.json({ success: false, message }, { status: 500 });
	}
}

export async function POST(request: NextRequest) {
	try {
		const body = await request.json();
		const { name, photoUrl, title, bio, publicationTitle, publishedAt, displayOrder, published } = body;

		if (!name || !String(name).trim()) {
			return NextResponse.json({ success: false, message: "Name is required" }, { status: 400 });
		}

		const id = await createItem(fileKey, mongoCollection, {
			name: String(name).trim(),
			photoUrl: photoUrl?.trim() || null,
			title: title?.trim() || null,
			bio: bio?.trim() || null,
			publicationTitle: publicationTitle?.trim() || null,
			publishedAt: publishedAt?.trim() || null,
			displayOrder: Number(displayOrder) || 0,
			published: published !== false,
		});

		safeRevalidate("/", "/admin/researcher");
		return NextResponse.json({
			success: true,
			message: "Researcher created successfully",
			data: { id },
		});
	} catch (error: unknown) {
		const message = error instanceof Error ? error.message : "Failed to create researcher";
		console.error("Error creating researcher:", error);
		return NextResponse.json({ success: false, message }, { status: 500 });
	}
}

export async function PUT(request: NextRequest) {
	try {
		const body = await request.json();
		const { id, name, photoUrl, title, bio, publicationTitle, publishedAt, displayOrder, published } = body;

		if (!id || !name || !String(name).trim()) {
			return NextResponse.json({ success: false, message: "ID and name are required" }, { status: 400 });
		}

		const updated = await updateItem(fileKey, mongoCollection, String(id), {
			name: String(name).trim(),
			photoUrl: photoUrl?.trim() || null,
			title: title?.trim() || null,
			bio: bio?.trim() || null,
			publicationTitle: publicationTitle?.trim() || null,
			publishedAt: publishedAt?.trim() || null,
			displayOrder: Number(displayOrder) || 0,
			published: Boolean(published),
		});

		if (!updated) {
			return NextResponse.json({ success: false, message: "Item not found" }, { status: 404 });
		}

		safeRevalidate("/", "/admin/researcher");
		return NextResponse.json({ success: true, message: "Researcher updated successfully" });
	} catch (error: unknown) {
		const message = error instanceof Error ? error.message : "Failed to update researcher";
		console.error("Error updating researcher:", error);
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

		safeRevalidate("/", "/admin/researcher");
		return NextResponse.json({ success: true, message: "Researcher deleted successfully" });
	} catch (error: unknown) {
		const message = error instanceof Error ? error.message : "Failed to delete researcher";
		console.error("Error deleting researcher:", error);
		return NextResponse.json({ success: false, message }, { status: 500 });
	}
}
