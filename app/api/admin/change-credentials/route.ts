import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import bcrypt from "bcrypt";
import { authOptions } from "@/app/lib/auth";
import { isDbDisabled } from "@/app/lib/config";
import { getDb } from "@/app/lib/mongodb";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
	const session = await getServerSession(authOptions);
	if (!session) {
		return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
	}

	try {
		const body = await request.json();
		const currentPassword = String(body.currentPassword || "").trim();
		const newUsername = String(body.newUsername || "").trim();
		const newPassword = String(body.newPassword || "").trim();

		if (!currentPassword) {
			return NextResponse.json({ success: false, message: "Current password is required" }, { status: 400 });
		}
		if (!newUsername && !newPassword) {
			return NextResponse.json({ success: false, message: "Provide new username or new password" }, { status: 400 });
		}

		const envUsername = process.env.ADMIN_USERNAME || "admin";
		const envPassword = process.env.ADMIN_PASSWORD || "admin123";

		if (isDbDisabled()) {
			if (currentPassword !== envPassword) {
				return NextResponse.json({ success: false, message: "Current password is incorrect" }, { status: 401 });
			}
			return NextResponse.json({
				success: false,
				message: "Database is disabled. Enable MongoDB to change credentials permanently.",
			}, { status: 400 });
		}

		const db = await getDb();
		const collection = db.collection("AdminUser");
		let user = await collection.findOne({});

		if (!user) {
			if (currentPassword !== envPassword) {
				return NextResponse.json({ success: false, message: "Current password is incorrect" }, { status: 401 });
			}
			const passwordHash = await bcrypt.hash(envPassword, 10);
			const created = await collection.insertOne({
				username: envUsername,
				passwordHash,
				name: "Administrator",
				createdAt: new Date(),
				updatedAt: new Date(),
			});
			user = await collection.findOne({ _id: created.insertedId });
		}

		if (!user) {
			return NextResponse.json({ success: false, message: "Admin user not found" }, { status: 404 });
		}

		const validCurrent = await bcrypt.compare(currentPassword, user.passwordHash).catch(() => false)
			|| (currentPassword === envPassword && user.username === envUsername);

		if (!validCurrent) {
			return NextResponse.json({ success: false, message: "Current password is incorrect" }, { status: 401 });
		}

		const updates: Record<string, unknown> = { updatedAt: new Date() };
		if (newUsername) updates.username = newUsername;
		if (newPassword) updates.passwordHash = await bcrypt.hash(newPassword, 10);

		await collection.updateOne({ _id: user._id }, { $set: updates });

		return NextResponse.json({
			success: true,
			message: "Credentials updated successfully. Please login again with new credentials.",
		});
	} catch (error: unknown) {
		const message = error instanceof Error ? error.message : "Failed to update credentials";
		return NextResponse.json({ success: false, message }, { status: 500 });
	}
}
