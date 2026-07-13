import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { CONTENT_KEYS, createItem, deleteItem, listItems, updateItem } from "@/app/lib/content-store";
import { generateQrCodeImage, getBaseUrlFromRequest } from "@/app/lib/qr-utils";
import { safeRevalidate } from "@/app/lib/revalidate";

export const runtime = "nodejs";

const { fileKey, mongoCollection } = CONTENT_KEYS.secureResult;

const MAX_SLOTS = 4;

async function upsertSlot(
	slotNumber: number,
	data: {
		title: string;
		fileUrl: string;
		password?: string;
		published: boolean;
	},
	existingId?: string,
	qrBase?: string | null,
) {
	const passwordHash = data.password
		? await bcrypt.hash(data.password, 10)
		: undefined;

	if (existingId) {
		const updates: Record<string, unknown> = {
			title: data.title,
			fileUrl: data.fileUrl,
			slotNumber,
			published: data.published,
		};
		if (passwordHash) updates.passwordHash = passwordHash;

		await updateItem(fileKey, mongoCollection, existingId, updates);
		const qrCodeUrl = await generateQrCodeImage("result", existingId, qrBase);
		await updateItem(fileKey, mongoCollection, existingId, { qrCodeUrl });
		return existingId;
	}

	const id = await createItem(fileKey, mongoCollection, {
		title: data.title,
		fileUrl: data.fileUrl,
		slotNumber,
		passwordHash: passwordHash || (await bcrypt.hash("changeme", 10)),
		published: data.published,
		qrCodeUrl: null,
	});
	const qrCodeUrl = await generateQrCodeImage("result", id, qrBase);
	await updateItem(fileKey, mongoCollection, id, { qrCodeUrl });
	return id;
}

export async function GET() {
	try {
		const data = await listItems(fileKey, mongoCollection);
		const slots = Array.from({ length: MAX_SLOTS }, (_, i) => {
			const slotNum = i + 1;
			const found = data.find((d) => Number(d.slotNumber) === slotNum);
			if (found) {
				const { passwordHash: _, ...rest } = found;
				return rest;
			}
			return { slotNumber: slotNum, id: null, title: "", fileUrl: null, qrCodeUrl: null, published: false };
		});
		return NextResponse.json({ success: true, data: slots });
	} catch (error: unknown) {
		const message = error instanceof Error ? error.message : "Failed to fetch results";
		return NextResponse.json({ success: false, message }, { status: 500 });
	}
}

export async function POST(request: NextRequest) {
	try {
		const body = await request.json();
		const slotNumber = Number(body.slotNumber);
		const title = String(body.title || "").trim();
		const fileUrl = String(body.fileUrl || "").trim();
		const password = String(body.password || "").trim();
		const published = Boolean(body.published);

		if (!slotNumber || slotNumber < 1 || slotNumber > MAX_SLOTS) {
			return NextResponse.json({ success: false, message: "Invalid slot (1-4)" }, { status: 400 });
		}
		if (!title || !fileUrl) {
			return NextResponse.json({ success: false, message: "Title and file are required" }, { status: 400 });
		}
		if (!password) {
			return NextResponse.json({ success: false, message: "Password is required" }, { status: 400 });
		}

		const qrBase = getBaseUrlFromRequest(request);
		const all = await listItems(fileKey, mongoCollection);
		const existing = all.find((d) => Number(d.slotNumber) === slotNumber);
		const id = await upsertSlot(slotNumber, { title, fileUrl, password, published }, existing?.id as string | undefined, qrBase);

		safeRevalidate("/", "/admin/results");
		return NextResponse.json({ success: true, message: "Result saved and QR generated", data: { id } });
	} catch (error: unknown) {
		const message = error instanceof Error ? error.message : "Failed to save result";
		return NextResponse.json({ success: false, message }, { status: 500 });
	}
}

export async function PUT(request: NextRequest) {
	try {
		const body = await request.json();
		const { id, slotNumber, title, fileUrl, password, published } = body;

		if (!id || !title || !fileUrl) {
			return NextResponse.json({ success: false, message: "ID, title and file are required" }, { status: 400 });
		}

		const updates: Record<string, unknown> = {
			title: String(title).trim(),
			fileUrl: String(fileUrl).trim(),
			slotNumber: Number(slotNumber) || 1,
			published: Boolean(published),
		};
		if (password && String(password).trim()) {
			updates.passwordHash = await bcrypt.hash(String(password).trim(), 10);
		}

		const updated = await updateItem(fileKey, mongoCollection, String(id), updates);
		if (!updated) {
			return NextResponse.json({ success: false, message: "Item not found" }, { status: 404 });
		}

		const qrBase = getBaseUrlFromRequest(request);
		const qrCodeUrl = await generateQrCodeImage("result", String(id), qrBase);
		await updateItem(fileKey, mongoCollection, String(id), { qrCodeUrl });

		safeRevalidate("/", "/admin/results");
		return NextResponse.json({ success: true, message: "Result updated and QR regenerated" });
	} catch (error: unknown) {
		const message = error instanceof Error ? error.message : "Failed to update result";
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

		safeRevalidate("/", "/admin/results");
		return NextResponse.json({ success: true, message: "Result deleted" });
	} catch (error: unknown) {
		const message = error instanceof Error ? error.message : "Failed to delete result";
		return NextResponse.json({ success: false, message }, { status: 500 });
	}
}
