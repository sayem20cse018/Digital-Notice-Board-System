import { randomUUID } from "crypto";
import { existsSync } from "fs";
import { mkdir, readFile, unlink, writeFile } from "fs/promises";
import { join } from "path";
import { ObjectId } from "mongodb";
import { isDbDisabled } from "./config";
import { getDb } from "./mongodb";

const DATA_DIR = join(process.cwd(), "data");

export type StoredItem = Record<string, unknown> & { id: string };

function hasDbConfig(): boolean {
	return !isDbDisabled() && Boolean(process.env.DATABASE_URL || process.env.MONGODB_URI);
}

/** On Vercel the filesystem is read-only — skip JSON writes */
function isReadOnlyFs(): boolean {
	return Boolean(process.env.VERCEL);
}

function normalizeMongo(doc: Record<string, unknown> & { _id?: ObjectId }): StoredItem {
	const { _id, ...rest } = doc;
	return { id: _id!.toString(), ...rest };
}

function sortByOrder(items: StoredItem[]): StoredItem[] {
	return [...items].sort(
		(a, b) => (Number(a.displayOrder) || 0) - (Number(b.displayOrder) || 0),
	);
}

async function readJson(key: string): Promise<StoredItem[]> {
	const file = join(DATA_DIR, `${key}.json`);
	if (!existsSync(file)) return [];
	try {
		const raw = await readFile(file, "utf-8");
		const parsed = JSON.parse(raw);
		return Array.isArray(parsed) ? parsed : [];
	} catch {
		return [];
	}
}

async function writeJson(key: string, items: StoredItem[]): Promise<void> {
	if (isReadOnlyFs()) return; // Vercel: skip JSON writes — read-only filesystem
	if (!existsSync(DATA_DIR)) {
		await mkdir(DATA_DIR, { recursive: true });
	}
	await writeFile(join(DATA_DIR, `${key}.json`), JSON.stringify(items, null, 2), "utf-8");
}

async function clearJson(key: string): Promise<void> {
	const file = join(DATA_DIR, `${key}.json`);
	if (existsSync(file)) {
		await unlink(file);
	}
}

async function migrateJsonToMongo(fileKey: string, mongoCollection: string): Promise<void> {
	const jsonItems = await readJson(fileKey);
	if (jsonItems.length === 0) return;

	const db = await getDb();
	const collection = db.collection(mongoCollection);
	const count = await collection.countDocuments();
	if (count > 0) return;

	for (const item of jsonItems) {
		const { id, ...rest } = item;
		await collection.insertOne(rest);
	}

	await clearJson(fileKey);
	console.log(`Migrated ${jsonItems.length} item(s) from ${fileKey}.json to MongoDB (${mongoCollection})`);
}

async function listFromMongo(mongoCollection: string): Promise<StoredItem[]> {
	const db = await getDb();
	const items = await db.collection(mongoCollection).find().sort({ displayOrder: 1 }).toArray();
	return items.map((doc) => normalizeMongo(doc as Record<string, unknown> & { _id: ObjectId }));
}

export async function listItems(fileKey: string, mongoCollection: string): Promise<StoredItem[]> {
	if (hasDbConfig()) {
		try {
			await migrateJsonToMongo(fileKey, mongoCollection);
			return sortByOrder(await listFromMongo(mongoCollection));
		} catch (error) {
			console.warn(`MongoDB list failed (${mongoCollection}), using local JSON store:`, error);
		}
	}
	return sortByOrder(await readJson(fileKey));
}

export async function listPublishedItems(
	fileKey: string,
	mongoCollection: string,
	limit = 20,
): Promise<StoredItem[]> {
	if (hasDbConfig()) {
		try {
			await migrateJsonToMongo(fileKey, mongoCollection);
			const db = await getDb();
			const items = await db
				.collection(mongoCollection)
				.find({ published: true })
				.sort({ displayOrder: 1 })
				.limit(limit)
				.toArray();
			const result = items.map((doc) => normalizeMongo(doc as Record<string, unknown> & { _id: ObjectId }));
			// Cache successful result to JSON as fallback
			if (result.length > 0 && !isReadOnlyFs()) {
				writeJson(fileKey + "-cache", result).catch(() => {});
			}
			return result;
		} catch (error) {
			console.warn(`MongoDB list published failed (${mongoCollection}), using local JSON store:`, error);
			// Try cache first, then static JSON
			const cached = await readJson(fileKey + "-cache");
			if (cached.length > 0) return cached.filter((item) => item.published !== false).slice(0, limit);
		}
	}

	return sortByOrder(await readJson(fileKey))
		.filter((item) => item.published !== false)
		.slice(0, limit);
}

export async function createItem(
	fileKey: string,
	mongoCollection: string,
	data: Record<string, unknown>,
): Promise<string> {
	const now = new Date();
	const doc = { ...data, createdAt: now, updatedAt: now };

	if (hasDbConfig()) {
		try {
			const db = await getDb();
			const created = await db.collection(mongoCollection).insertOne(doc);
			return created.insertedId.toString();
		} catch (error) {
			console.warn(`MongoDB create failed (${mongoCollection}), using local JSON store:`, error);
		}
	}

	const items = await readJson(fileKey);
	const id = randomUUID();
	items.push({ id, ...doc });
	await writeJson(fileKey, items);
	return id;
}

export async function updateItem(
	fileKey: string,
	mongoCollection: string,
	id: string,
	data: Record<string, unknown>,
): Promise<boolean> {
	const updates = { ...data, updatedAt: new Date() };

	if (hasDbConfig()) {
		try {
			const db = await getDb();
			if (ObjectId.isValid(id)) {
				const result = await db
					.collection(mongoCollection)
					.updateOne({ _id: new ObjectId(id) }, { $set: updates });
				if (result.matchedCount > 0) return true;
			}
		} catch (error) {
			console.warn(`MongoDB update failed (${mongoCollection}), using local JSON store:`, error);
		}
	}

	const items = await readJson(fileKey);
	const index = items.findIndex((item) => item.id === id);
	if (index === -1) return false;
	items[index] = { ...items[index], ...updates };
	await writeJson(fileKey, items);
	return true;
}

export async function deleteItem(
	fileKey: string,
	mongoCollection: string,
	id: string,
): Promise<boolean> {
	if (hasDbConfig()) {
		try {
			const db = await getDb();
			if (ObjectId.isValid(id)) {
				const result = await db.collection(mongoCollection).deleteOne({ _id: new ObjectId(id) });
				if (result.deletedCount > 0) return true;
			}
		} catch (error) {
			console.warn(`MongoDB delete failed (${mongoCollection}), using local JSON store:`, error);
		}
	}

	const items = await readJson(fileKey);
	const filtered = items.filter((item) => item.id !== id);
	if (filtered.length === items.length) return false;
	await writeJson(fileKey, filtered);
	return true;
}

export const CONTENT_KEYS = {
	bestAlumni: { fileKey: "best-alumni", mongoCollection: "BestAlumni" },
	bestProgrammer: { fileKey: "best-programmer", mongoCollection: "BestProgrammer" },
	highlightNews: { fileKey: "highlight-news", mongoCollection: "HighlightNews" },
	researcher: { fileKey: "researcher", mongoCollection: "Researcher" },
	helpCenter: { fileKey: "help-center", mongoCollection: "HelpCenter" },
	rightSidebarNotice: { fileKey: "right-sidebar-notice", mongoCollection: "RightSidebarNotice" },
	secureResult: { fileKey: "secure-results", mongoCollection: "SecureResult" },
	teacherList: { fileKey: "teacher-list", mongoCollection: "TeacherList" },
	classRoutineQr: { fileKey: "class-routine-qr", mongoCollection: "ClassRoutineQr" },
	examRoutineQr: { fileKey: "exam-routine-qr", mongoCollection: "ExamRoutineQr" },
	projectShowcase: { fileKey: "project-showcase", mongoCollection: "ProjectShowcase" },
	roomDirectory: { fileKey: "room-directory", mongoCollection: "RoomDirectory" },
	aboutUs: { fileKey: "about-us", mongoCollection: "AboutUs" },
	events: { fileKey: "events-board", mongoCollection: "EventsBoard" },
} as const;
