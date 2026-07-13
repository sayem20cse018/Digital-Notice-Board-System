import { ObjectId } from "mongodb";
import { isDbDisabled } from "./config";
import { getDb } from "./mongodb";

type DeptSettings = {
	departmentName: string;
	logoUrl?: string | null;
	universityName?: string | null;
	universityLogoUrl?: string | null;
	marqueeText?: string | null;
	headerBackgroundImages?: string[];
	headerSlideshowInterval?: number;
	highlightSlideDuration?: number;
	publicSiteUrl?: string | null;
};

type News = { id: string; title: string; createdAt: Date; imageUrl?: string | null };
type Teacher = { id: string; name: string; title?: string | null; bio?: string | null; quote?: string | null; photoUrl?: string | null };
type Quote = { id: string; text: string; authorName: string };
type Event = { id: string; title: string; description?: string | null; when: string; imageUrl?: string | null };
type Result = { id: string; examName: string; linkUrl: string; publishedAt: Date };
type RoutineItem = { id: string; className: string; dayOfWeek: number; period: number; subject: string; teacher?: string | null; room?: string | null };
type ExamRoutineItem = { id: string; examName: string; date: Date; time?: string | null; subject: string; room?: string | null };
type Achievement = { id: string; title: string; description?: string | null };
type Notice = { id: string; title: string; body?: string | null; pdfUrl?: string | null; createdAt: Date };
type UpcomingCard = { id: string; title: string; imageUrl?: string | null; fileUrl?: string | null; dueDate: Date; displayOrder: number };
type BestAlumni = { id: string; title: string; imageUrl?: string | null; linkUrl?: string | null; note?: string | null; displayOrder: number };
type BestProgrammer = { id: string; name: string; photoUrl?: string | null; description?: string | null; displayOrder: number };
type HighlightNews = { id: string; title: string; imageUrl?: string | null; description?: string | null; linkUrl?: string | null; displayOrder: number };
type Researcher = { id: string; name: string; photoUrl?: string | null; title?: string | null; bio?: string | null; displayOrder: number };
type HelpCenter = { id: string; officeName: string; phoneNumber: string; qrCodeUrl?: string | null; contactType: "office" | "crs"; displayOrder: number };
type RightSidebarNotice = { id: string; title: string; imageUrl?: string | null; fileUrl?: string | null; displayOrder: number; published: boolean };

type DeptSettingsDoc = {
	departmentName: string;
	logoUrl?: string | null;
	universityName?: string | null;
	universityLogoUrl?: string | null;
	marqueeText?: string | null;
	headerBackgroundImages?: string[];
	headerSlideshowInterval?: number;
	highlightSlideDuration?: number;
	publicSiteUrl?: string | null;
};

type NewsDoc = {
	title: string;
	content?: string | null;
	imageUrl?: string | null;
	published: boolean;
	createdAt: Date;
	updatedAt: Date;
};

type WithId<T> = T & { _id: ObjectId };

const COLLECTIONS = {
	settings: "DepartmentSettings",
	news: "NewsItem",
	teachers: "Teacher",
	quotes: "Quote",
	results: "ResultItem",
	events: "EventItem",
	achievements: "Achievement",
	notices: "NoticeItem",
	upcoming: "UpcomingCard",
	classRoutine: "ClassRoutine",
	examRoutine: "ExamRoutine",
	bestAlumni: "BestAlumni",
	bestProgrammer: "BestProgrammer",
	highlightNews: "HighlightNews",
	researcher: "Researcher",
	helpCenter: "HelpCenter",
	rightSidebarNotices: "RightSidebarNotice",
};

const demoSettings: DeptSettings = {
	departmentName: "Computer Science And Engineering",
	logoUrl: "/images/cse_logo.jpg",
	universityName: "Gopalganj Science and Technology University",
	universityLogoUrl: "/images/GSTUlogo.png",
	marqueeText: "Welcome",
};

const demoNews: News[] = [
	{ id: "n1", title: "Welcome to the demo site", createdAt: new Date() },
];

const demoTeachers: Teacher[] = [];
const demoQuotes: Quote[] = [
	{ id: "q1", text: "Education is the passport to the future.", authorName: "Malcolm X" },
];

const demoNotices: Notice[] = [
	{ id: "no1", title: "Demo Notice", body: "Enable DB for real data", pdfUrl: null, createdAt: new Date() },
];

const demoEvents: Event[] = [
	{ id: "e1", title: "Orientation Program", description: "Welcome to new students", when: "12 Dec, 10:00 AM" },
];

const demoResults: Result[] = [
	{ id: "r1", examName: "Midterm 2025", linkUrl: "#", publishedAt: new Date() },
];

const demoRoutine: RoutineItem[] = [
	{ id: "rt1", className: "CSE-1", dayOfWeek: 1, period: 1, subject: "Math" },
];

const demoAchievements: Achievement[] = [
	{ id: "a1", title: "ICPC Regional Finalists", description: "Team Alpha" },
];

const demoUpcoming: UpcomingCard[] = [];

function normalize<T>(doc: WithId<T>) {
	const { _id, ...rest } = doc;
	return { id: _id.toString(), ...rest };
}

function normalizeMany<T>(docs: WithId<T>[]) {
	return docs.map(normalize);
}

async function getCollection<T extends object>(name: string) {
	const db = await getDb();
	return db.collection<T>(name);
}

async function getCookieArray(key: string): Promise<any[]> {
	if (!isDbDisabled()) {
		return [];
	}
	try {
		const { cookies } = await import("next/headers");
		const c: any = await (cookies() as any);
		const data = c?.get?.(key)?.value;
		return data ? JSON.parse(data) : [];
	} catch {
		return [];
	}
}

export async function getDepartmentSettings(): Promise<DeptSettings | null> {
	if (isDbDisabled()) {
		try {
			const { cookies } = await import("next/headers");
			const c: any = await (cookies() as any);
			const publicSiteUrl = c?.get?.("public_site_url")?.value ?? null;
			return { ...demoSettings, publicSiteUrl };
		} catch {
			return demoSettings;
		}
	}

	try {
		const collection = await getCollection<DeptSettingsDoc>(COLLECTIONS.settings);
		const settings = await collection.findOne();
		if (settings) {
			return {
				departmentName: settings.departmentName,
				logoUrl: settings.logoUrl ?? null,
				universityName: settings.universityName ?? null,
				universityLogoUrl: settings.universityLogoUrl ?? null,
				marqueeText: settings.marqueeText ?? null,
				headerBackgroundImages: settings.headerBackgroundImages ?? [],
				headerSlideshowInterval: settings.headerSlideshowInterval ?? 8,
				highlightSlideDuration: settings.highlightSlideDuration ?? 5,
				publicSiteUrl: settings.publicSiteUrl ?? null,
			};
		}
		return demoSettings;
	} catch (error) {
		console.error("Error fetching department settings:", error);
		return demoSettings;
	}
}

export async function getNews(): Promise<News[]> {
	if (!isDbDisabled()) {
		try {
			const collection = await getCollection<NewsDoc>(COLLECTIONS.news);
			const news = await collection
				.find({ published: true })
				.sort({ createdAt: -1 })
				.limit(20)
				.toArray();
			if (news.length > 0) {
				console.log(`Fetched ${news.length} news items from database`);
			}
			return normalizeMany(news as WithId<NewsDoc>[]).map((n) => ({
				id: n.id,
				title: n.title,
				imageUrl: n.imageUrl ?? null,
				createdAt: n.createdAt,
			}));
		} catch (error) {
			console.error("Error fetching news:", error);
		}
	}

	const cookieData = await getCookieArray("admin_news");
	if (cookieData.length > 0) {
		return cookieData
			.filter((n: any) => n.published)
			.map((n: any) => ({
				id: n.id,
				title: n.title,
				imageUrl: n.imageUrl || null,
				createdAt: new Date(n.createdAt || Date.now()),
			}));
	}
	return demoNews;
}

type TeacherDoc = {
	name: string;
	title?: string | null;
	bio?: string | null;
	photoUrl?: string | null;
	isFeatured: boolean;
	createdAt: Date;
	updatedAt: Date;
};

type QuoteDoc = {
	text: string;
	authorName: string;
	displayOrder: number;
	teacherId?: ObjectId | null;
	createdAt: Date;
	updatedAt: Date;
};

export async function getFeaturedTeachers(): Promise<Teacher[]> {
	if (!isDbDisabled()) {
		try {
			const collection = await getCollection<TeacherDoc>(COLLECTIONS.teachers);
			const teachers = await collection.find({ isFeatured: true }).toArray();
			return normalizeMany(teachers as WithId<TeacherDoc>[]).map((t) => ({
				id: t.id,
				name: t.name,
				title: t.title ?? null,
				bio: t.bio ?? null,
			}));
		} catch (error) {
			console.error("Error fetching featured teachers:", error);
		}
	}

	const cookieData = await getCookieArray("admin_teachers");
	if (cookieData.length > 0) {
		return cookieData
			.filter((t: any) => t.isFeatured)
			.map((t: any) => ({
				id: t.id,
				name: t.name,
				title: t.title || null,
				bio: t.bio || null,
			}));
	}
	return demoTeachers;
}

export async function getAllTeachers(): Promise<Teacher[]> {
	if (!isDbDisabled()) {
		try {
			const teacherCollection = await getCollection<TeacherDoc>(COLLECTIONS.teachers);
			const teachers = await teacherCollection.find().sort({ createdAt: 1 }).toArray();
			const teacherIds = (teachers as WithId<TeacherDoc>[]).map((t) => t._id);

			const quotesCollection = await getCollection<QuoteDoc>(COLLECTIONS.quotes);
			const quotes = await quotesCollection
				.find({ teacherId: { $in: teacherIds } })
				.sort({ displayOrder: 1 })
				.toArray();

			return normalizeMany(teachers as WithId<TeacherDoc>[]).map((t) => {
				const quote = quotes.find((q: WithId<QuoteDoc>) => q.teacherId?.toString() === t.id);
				return {
					id: t.id,
					name: t.name,
					title: t.title ?? null,
					bio: t.bio ?? null,
					photoUrl: t.photoUrl ?? null,
					quote: quote ? quote.text : null,
				};
			});
		} catch (error) {
			console.error("Error fetching teachers:", error);
		}
	}

	const cookieData = await getCookieArray("admin_teachers");
	if (cookieData.length > 0) {
		return cookieData.map((t: any) => ({
			id: t.id,
			name: t.name,
			title: t.title || null,
			bio: t.bio || null,
			photoUrl: t.photoUrl || null,
			quote: null,
		}));
	}
	return demoTeachers;
}

type NoticeDoc = {
	title: string;
	body?: string | null;
	pdfUrl?: string | null;
	displayOrder: number;
	published: boolean;
	createdAt: Date;
	updatedAt: Date;
};

export async function getPublicNotices(): Promise<Notice[]> {
	if (!isDbDisabled()) {
		try {
			const collection = await getCollection<NoticeDoc>(COLLECTIONS.notices);
			const notices = await collection
				.find({ published: true })
				.sort({ displayOrder: 1, createdAt: -1 })
				.limit(20)
				.toArray();
			return normalizeMany(notices as WithId<NoticeDoc>[]).map((n) => ({
				id: n.id,
				title: n.title,
				body: n.body ?? null,
				pdfUrl: n.pdfUrl ?? null,
				createdAt: n.createdAt,
			}));
		} catch (error) {
			console.error("Error fetching notices:", error);
		}
	}

	const cookieData = await getCookieArray("admin_notices");
	if (cookieData.length > 0) {
		return cookieData
			.filter((n: any) => n.published)
			.map((n: any) => ({
				id: n.id,
				title: n.title,
				body: n.body || null,
				pdfUrl: n.pdfUrl || null,
				createdAt: new Date(n.createdAt || Date.now()),
			}));
	}
	return demoNotices;
}

export async function getQuotes(): Promise<Quote[]> {
	if (!isDbDisabled()) {
		try {
			const collection = await getCollection<QuoteDoc>(COLLECTIONS.quotes);
			const quotes = await collection.find().sort({ displayOrder: 1 }).limit(10).toArray();
			return normalizeMany(quotes as WithId<QuoteDoc>[]).map((q) => ({
				id: q.id,
				text: q.text,
				authorName: q.authorName,
			}));
		} catch (error) {
			console.error("Error fetching quotes:", error);
		}
	}

	const cookieData = await getCookieArray("admin_quotes");
	if (cookieData.length > 0) {
		return cookieData.map((q: any) => ({
			id: q.id,
			text: q.text,
			authorName: q.authorName,
		}));
	}
	return demoQuotes;
}

type EventDoc = {
	title: string;
	description?: string | null;
	location?: string | null;
	imageUrl?: string | null;
	startsAt: Date;
	published: boolean;
	createdAt: Date;
	updatedAt: Date;
};

export async function getEvents(): Promise<Event[]> {
	if (!isDbDisabled()) {
		try {
			const collection = await getCollection<EventDoc>(COLLECTIONS.events);
			const events = await collection
				.find({ published: true })
				.sort({ startsAt: 1 })
				.limit(20)
				.toArray();
			return normalizeMany(events as WithId<EventDoc>[]).map((e) => ({
				id: e.id,
				title: e.title,
				description: e.description ?? null,
				imageUrl: e.imageUrl ?? null,
				when: e.startsAt ? new Date(e.startsAt).toLocaleString() : "TBA",
			}));
		} catch (error) {
			console.error("Error fetching events:", error);
		}
	}

	const cookieData = await getCookieArray("admin_events");
	if (cookieData.length > 0) {
		return cookieData
			.filter((e: any) => e.published)
			.map((e: any) => ({
				id: e.id,
				title: e.title,
				description: e.description || null,
				imageUrl: e.imageUrl || null,
				when: e.startsAt ? new Date(e.startsAt).toLocaleString() : "TBA",
			}));
	}
	return demoEvents;
}

type ResultDoc = {
	examName: string;
	className?: string | null;
	linkUrl: string;
	publishedAt: Date;
	createdAt: Date;
	updatedAt: Date;
};

export async function getResults(): Promise<Result[]> {
	if (!isDbDisabled()) {
		try {
			const collection = await getCollection<ResultDoc>(COLLECTIONS.results);
			const results = await collection.find().sort({ publishedAt: -1 }).limit(20).toArray();
			return normalizeMany(results as WithId<ResultDoc>[]).map((r) => ({
				id: r.id,
				examName: r.examName,
				linkUrl: r.linkUrl,
				publishedAt: r.publishedAt,
			}));
		} catch (error) {
			console.error("Error fetching results:", error);
		}
	}

	const cookieData = await getCookieArray("admin_results");
	if (cookieData.length > 0) {
		return cookieData.map((r: any) => ({
			id: r.id,
			examName: r.examName,
			linkUrl: r.linkUrl,
			publishedAt: new Date(r.publishedAt || Date.now()),
		}));
	}
	return demoResults;
}

type ClassRoutineDoc = {
	className: string;
	dayOfWeek: number;
	period: number;
	subject: string;
	teacher?: string | null;
	room?: string | null;
	fileUrl?: string | null;
	createdAt: Date;
	updatedAt: Date;
};

export async function getRoutine(): Promise<RoutineItem[]> {
	if (!isDbDisabled()) {
		try {
			const collection = await getCollection<ClassRoutineDoc>(COLLECTIONS.classRoutine);
			const routines = await collection
				.find()
				.sort({ dayOfWeek: 1, period: 1 })
				.toArray();
			return normalizeMany(routines as WithId<ClassRoutineDoc>[]).map((r) => ({
				id: r.id,
				className: r.className,
				dayOfWeek: r.dayOfWeek,
				period: r.period,
				subject: r.subject,
				teacher: r.teacher ?? null,
				room: r.room ?? null,
			}));
		} catch (error) {
			console.error("Error fetching routine:", error);
			return [];
		}
	} else {
		const cookieData = await getCookieArray("admin_routine");
		if (cookieData.length > 0) {
			return cookieData.map((r: any) => ({
				id: r.id,
				className: r.className,
				dayOfWeek: r.dayOfWeek,
				period: r.period,
				subject: r.subject,
				teacher: r.teacher,
				room: r.room,
			}));
		}
		return demoRoutine;
	}
}

type ExamRoutineDoc = {
	examName: string;
	date: Date;
	time?: string | null;
	subject: string;
	room?: string | null;
	createdAt: Date;
	updatedAt: Date;
};

export async function getExamRoutine(): Promise<ExamRoutineItem[]> {
	if (!isDbDisabled()) {
		try {
			const collection = await getCollection<ExamRoutineDoc>(COLLECTIONS.examRoutine);
			const examRoutines = await collection.find().sort({ date: 1 }).limit(50).toArray();
			return normalizeMany(examRoutines as WithId<ExamRoutineDoc>[]).map((r) => ({
				id: r.id,
				examName: r.examName,
				date: r.date,
				time: r.time ?? null,
				subject: r.subject,
				room: r.room ?? null,
			}));
		} catch (error) {
			console.error("Error fetching exam routine:", error);
			return [];
		}
	}
	return [];
}

type AchievementDoc = {
	title: string;
	description?: string | null;
	imageUrl?: string | null;
	published: boolean;
	displayOrder: number;
	createdAt: Date;
	updatedAt: Date;
};

export async function getAchievements(): Promise<Achievement[]> {
	if (!isDbDisabled()) {
		try {
			const collection = await getCollection<AchievementDoc>(COLLECTIONS.achievements);
			const achievements = await collection
				.find({ published: true })
				.sort({ displayOrder: 1 })
				.limit(20)
				.toArray();
			return normalizeMany(achievements as WithId<AchievementDoc>[]).map((a) => ({
				id: a.id,
				title: a.title,
				description: a.description ?? null,
				imageUrl: a.imageUrl ?? null,
			}));
		} catch (error) {
			console.error("Error fetching achievements:", error);
		}
	}

	const cookieData = await getCookieArray("admin_achievements");
	if (cookieData.length > 0) {
		return cookieData
			.filter((a: any) => a.published)
			.map((a: any) => ({
				id: a.id,
				title: a.title,
				description: a.description || null,
			}));
	}
	return demoAchievements;
}

type UpcomingDoc = {
	title: string;
	imageUrl?: string | null;
	fileUrl?: string | null;
	dueDate: Date;
	displayOrder: number;
	published: boolean;
	createdAt: Date;
	updatedAt: Date;
};

export async function getUpcomingCards(daysWindow: number = 10): Promise<UpcomingCard[]> {
	const now = new Date();
	const cutoff = new Date(now.getTime() + daysWindow * 24 * 60 * 60 * 1000);
	if (!isDbDisabled()) {
		try {
			const collection = await getCollection<UpcomingDoc>(COLLECTIONS.upcoming);
			const items = await collection
				.find({ published: true, dueDate: { $lte: cutoff } })
				.sort({ displayOrder: 1, createdAt: -1 })
				.limit(6)
				.toArray();
			return normalizeMany(items as WithId<UpcomingDoc>[]).map((u) => ({
				id: u.id,
				title: u.title,
				imageUrl: u.imageUrl ?? null,
				fileUrl: u.fileUrl ?? null,
				dueDate: u.dueDate,
				displayOrder: u.displayOrder ?? 0,
			}));
		} catch (error) {
			console.error("Error fetching upcoming cards:", error);
		}
	}
	const cookieData = await getCookieArray("admin_upcoming");
	if (cookieData.length > 0) {
		return cookieData
			.filter((u: any) => u.published && u.dueDate && new Date(u.dueDate) <= cutoff)
			.sort((a: any, b: any) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0))
			.slice(0, 6)
			.map((u: any) => ({
				id: u.id,
				title: u.title,
				imageUrl: u.imageUrl || null,
				fileUrl: u.fileUrl || null,
				dueDate: new Date(u.dueDate),
				displayOrder: Number(u.displayOrder ?? 0),
			}));
	}
	return demoUpcoming;
}

// New types for document structure
type BestAlumniDoc = {
	title: string;
	imageUrl?: string | null;
	linkUrl?: string | null;
	displayOrder: number;
	published: boolean;
	createdAt: Date;
	updatedAt: Date;
};

type BestProgrammerDoc = {
	name: string;
	photoUrl?: string | null;
	description?: string | null;
	displayOrder: number;
	published: boolean;
	createdAt: Date;
	updatedAt: Date;
};

type HighlightNewsDoc = {
	title: string;
	imageUrl?: string | null;
	description?: string | null;
	linkUrl?: string | null;
	displayOrder: number;
	published: boolean;
	createdAt: Date;
	updatedAt: Date;
};

type ResearcherDoc = {
	name: string;
	photoUrl?: string | null;
	title?: string | null;
	bio?: string | null;
	displayOrder: number;
	published: boolean;
	createdAt: Date;
	updatedAt: Date;
};

type HelpCenterDoc = {
	officeName: string;
	phoneNumber: string;
	displayOrder: number;
	published: boolean;
	createdAt: Date;
	updatedAt: Date;
};

type RightSidebarNoticeDoc = {
	title: string;
	imageUrl?: string | null;
	fileUrl?: string | null;
	displayOrder: number;
	published: boolean;
	createdAt: Date;
	updatedAt: Date;
};

// Fetch functions for new features
export async function getBestAlumni(): Promise<BestAlumni[]> {
	const { listPublishedItems, CONTENT_KEYS } = await import("./content-store");
	const { fileKey, mongoCollection } = CONTENT_KEYS.bestAlumni;
	try {
		const items = await listPublishedItems(fileKey, mongoCollection, 10);
		return items.map((n) => ({
			id: String(n.id),
			title: String(n.title ?? ""),
			imageUrl: (n.imageUrl as string | null) ?? null,
			linkUrl: (n.linkUrl as string | null) ?? null,
			note: (n.note as string | null) ?? null,
			displayOrder: Number(n.displayOrder) || 0,
		}));
	} catch (error) {
		console.error("Error fetching best alumni:", error);
		return [];
	}
}

export async function getBestProgrammers(): Promise<BestProgrammer[]> {
	const { listPublishedItems, CONTENT_KEYS } = await import("./content-store");
	const { fileKey, mongoCollection } = CONTENT_KEYS.bestProgrammer;
	try {
		const items = await listPublishedItems(fileKey, mongoCollection, 3);
		return items.map((p) => ({
			id: String(p.id),
			name: String(p.name ?? ""),
			photoUrl: (p.photoUrl as string | null) ?? null,
			description: (p.description as string | null) ?? null,
			displayOrder: Number(p.displayOrder) || 0,
		}));
	} catch (error) {
		console.error("Error fetching best programmers:", error);
		return [];
	}
}

export async function getHighlightNews(): Promise<HighlightNews[]> {
	const { listPublishedItems, CONTENT_KEYS } = await import("./content-store");
	const { fileKey, mongoCollection } = CONTENT_KEYS.highlightNews;
	try {
		const items = await listPublishedItems(fileKey, mongoCollection, 20);
		return items.map((n) => ({
			id: String(n.id),
			title: String(n.title ?? ""),
			imageUrl: (n.imageUrl as string | null) ?? null,
			description: (n.description as string | null) ?? null,
			linkUrl: (n.linkUrl as string | null) ?? null,
			displayOrder: Number(n.displayOrder) || 0,
			slideDuration: n.slideDuration != null ? Number(n.slideDuration) : null,
		}));
	} catch (error) {
		console.error("Error fetching highlight news:", error);
		return [];
	}
}

export async function getResearchers(): Promise<Researcher[]> {
	const { listPublishedItems, CONTENT_KEYS } = await import("./content-store");
	const { fileKey, mongoCollection } = CONTENT_KEYS.researcher;
	try {
		const items = await listPublishedItems(fileKey, mongoCollection, 50);
		const sorted = [...items].sort((a, b) => {
			const dateA = a.publishedAt ? new Date(String(a.publishedAt)).getTime() : 0;
			const dateB = b.publishedAt ? new Date(String(b.publishedAt)).getTime() : 0;
			if (dateA !== dateB) return dateB - dateA;
			return (Number(a.displayOrder) || 0) - (Number(b.displayOrder) || 0);
		});
		const latest = sorted.slice(0, 1);
		return latest.map((r) => ({
			id: String(r.id),
			name: String(r.name ?? ""),
			photoUrl: (r.photoUrl as string | null) ?? null,
			title: (r.title as string | null) ?? null,
			bio: (r.bio as string | null) ?? null,
			publicationTitle: (r.publicationTitle as string | null) ?? null,
			publishedAt: (r.publishedAt as string | null) ?? null,
			displayOrder: Number(r.displayOrder) || 0,
		}));
	} catch (error) {
		console.error("Error fetching researchers:", error);
		return [];
	}
}

export async function getHelpCenter(): Promise<HelpCenter[]> {
	const { listPublishedItems, CONTENT_KEYS } = await import("./content-store");
	const { fileKey, mongoCollection } = CONTENT_KEYS.helpCenter;
	try {
		const items = await listPublishedItems(fileKey, mongoCollection, 10);
		return items
			.map((h) => ({
				id: String(h.id),
				officeName: String(h.officeName ?? ""),
				phoneNumber: String(h.phoneNumber ?? ""),
				qrCodeUrl: (h.qrCodeUrl as string | null) ?? null,
				contactType: (h.contactType === "crs" ? "crs" : "office") as "office" | "crs",
				displayOrder: Number(h.displayOrder) || 0,
			}))
			.sort((a, b) => a.displayOrder - b.displayOrder)
			.slice(0, 2);
	} catch (error) {
		console.error("Error fetching help center:", error);
		return [];
	}
}

export async function getRightSidebarNotices(): Promise<RightSidebarNotice[]> {
	const { listPublishedItems, CONTENT_KEYS } = await import("./content-store");
	const { fileKey, mongoCollection } = CONTENT_KEYS.rightSidebarNotice;
	try {
		const items = await listPublishedItems(fileKey, mongoCollection, 6);
		return items.map((n) => ({
			id: String(n.id),
			title: String(n.title ?? ""),
			imageUrl: (n.imageUrl as string | null) ?? null,
			fileUrl: (n.fileUrl as string | null) ?? null,
			displayOrder: Number(n.displayOrder) || 0,
			published: Boolean(n.published),
		}));
	} catch (error) {
		console.error("Error fetching right sidebar notices:", error);
		return [];
	}
}

export async function getSecureResults() {
	const { listPublishedItems, CONTENT_KEYS } = await import("./content-store");
	const { fileKey, mongoCollection } = CONTENT_KEYS.secureResult;
	try {
		const items = await listPublishedItems(fileKey, mongoCollection, 4);
		const slots = items.map((r) => ({
			id: String(r.id),
			slotNumber: Number(r.slotNumber) || 0,
			title: String(r.title ?? ""),
			fileUrl: (r.fileUrl as string | null) ?? null,
			// QR for individual slot — used for the master results page
			qrCodeUrl: (r.qrCodeUrl as string | null) ?? null,
			published: Boolean(r.published),
		}));

		// Return first published slot for display board tile (just needs qrCodeUrl for visual)
		return slots;
	} catch (error) {
		console.error("Error fetching secure results:", error);
		return [];
	}
}

export async function getTeacherListPublic() {
	const { listPublishedItems, CONTENT_KEYS } = await import("./content-store");
	const { fileKey, mongoCollection } = CONTENT_KEYS.teacherList;
	try {
		const items = await listPublishedItems(fileKey, mongoCollection, 1);
		if (items.length === 0) return null;
		const t = items[0];
		return {
			id: String(t.id),
			title: String(t.title ?? "Teacher List"),
			fileUrl: (t.fileUrl as string | null) ?? null,
			qrCodeUrl: (t.qrCodeUrl as string | null) ?? null,
			published: Boolean(t.published),
		};
	} catch (error) {
		console.error("Error fetching teacher list:", error);
		return null;
	}
}

export type ClassRoutineQrItem = {
	id: string;
	title: string;
	qrCodeUrl: string | null;
	fileUrl: string | null;
	published: boolean;
};

export type ExamRoutineQrItem = {
	id: string;
	title: string;
	qrCodeUrl: string | null;
	fileUrl: string | null;
	published: boolean;
};

export type ProjectShowcaseItem = {
	id: string;
	title: string;
	description: string | null;
	imageUrl: string | null;
	linkUrl: string | null;
	displayOrder: number;
	published: boolean;
};

export type RoomDirectoryItem = {
	id: string;
	roomName: string;
	description: string | null;
	floor: string | null;
	imageUrl: string | null;
	displayOrder: number;
	published: boolean;
};

export async function getClassRoutineQr(): Promise<ClassRoutineQrItem | null> {
	const { listPublishedItems, CONTENT_KEYS } = await import("./content-store");
	const { fileKey, mongoCollection } = CONTENT_KEYS.classRoutineQr;
	try {
		const items = await listPublishedItems(fileKey, mongoCollection, 1);
		if (items.length === 0) return null;
		const r = items[0];
		return {
			id: String(r.id),
			title: String(r.title ?? "Class Routine"),
			qrCodeUrl: (r.qrCodeUrl as string | null) ?? null,
			fileUrl: (r.fileUrl as string | null) ?? null,
			published: Boolean(r.published),
		};
	} catch (error) {
		console.error("Error fetching class routine QR:", error);
		return null;
	}
}

export async function getExamRoutineQr(): Promise<ExamRoutineQrItem | null> {
	const { listPublishedItems, CONTENT_KEYS } = await import("./content-store");
	const { fileKey, mongoCollection } = CONTENT_KEYS.examRoutineQr;
	try {
		const items = await listPublishedItems(fileKey, mongoCollection, 1);
		if (items.length === 0) return null;
		const r = items[0];
		return {
			id: String(r.id),
			title: String(r.title ?? "Exam Routine"),
			qrCodeUrl: (r.qrCodeUrl as string | null) ?? null,
			fileUrl: (r.fileUrl as string | null) ?? null,
			published: Boolean(r.published),
		};
	} catch (error) {
		console.error("Error fetching exam routine QR:", error);
		return null;
	}
}

export async function getProjectShowcase(): Promise<ProjectShowcaseItem[]> {
	const { listPublishedItems, CONTENT_KEYS } = await import("./content-store");
	const { fileKey, mongoCollection } = CONTENT_KEYS.projectShowcase;
	try {
		const items = await listPublishedItems(fileKey, mongoCollection, 20);
		return items.map((p) => ({
			id: String(p.id),
			title: String(p.title ?? ""),
			description: (p.description as string | null) ?? null,
			imageUrl: (p.imageUrl as string | null) ?? null,
			linkUrl: (p.linkUrl as string | null) ?? null,
			displayOrder: Number(p.displayOrder) || 0,
			published: Boolean(p.published),
		}));
	} catch (error) {
		console.error("Error fetching project showcase:", error);
		return [];
	}
}

export async function getRoomDirectory(): Promise<RoomDirectoryItem[]> {
	const { listPublishedItems, CONTENT_KEYS } = await import("./content-store");
	const { fileKey, mongoCollection } = CONTENT_KEYS.roomDirectory;
	try {
		const items = await listPublishedItems(fileKey, mongoCollection, 20);
		return items.map((r) => ({
			id: String(r.id),
			roomName: String(r.roomName ?? ""),
			description: (r.description as string | null) ?? null,
			floor: (r.floor as string | null) ?? null,
			imageUrl: (r.imageUrl as string | null) ?? null,
			fileUrl: (r.fileUrl as string | null) ?? null,
			qrCodeUrl: (r.qrCodeUrl as string | null) ?? null,
			displayOrder: Number(r.displayOrder) || 0,
			published: Boolean(r.published),
		}));
	} catch (error) {
		console.error("Error fetching room directory:", error);
		return [];
	}
}

export type EventsBoardItem = {
	id: string;
	title: string;
	description: string | null;
	date: string | null;
	time: string | null;
	venue: string | null;
	imageUrl: string | null;
	published: boolean;
	displayOrder: number;
};

export async function getEventsBoard(): Promise<EventsBoardItem[]> {
	const { listPublishedItems, CONTENT_KEYS } = await import("./content-store");
	const { fileKey, mongoCollection } = CONTENT_KEYS.events;
	try {
		const items = await listPublishedItems(fileKey, mongoCollection, 20);
		return items.map((e) => ({
			id: String(e.id),
			title: String(e.title ?? ""),
			description: (e.description as string | null) ?? null,
			date: (e.date as string | null) ?? null,
			time: (e.time as string | null) ?? null,
			venue: (e.venue as string | null) ?? null,
			imageUrl: (e.imageUrl as string | null) ?? null,
			published: Boolean(e.published),
			displayOrder: Number(e.displayOrder) || 0,
		}));
	} catch (error) {
		console.error("Error fetching events board:", error);
		return [];
	}
}

export type AboutUsItem = {
	id: string;
	heading: string;
	body: string;
	imageUrl: string | null;
	published: boolean;
};

export async function getAboutUs(): Promise<AboutUsItem | null> {
	const { listPublishedItems, CONTENT_KEYS } = await import("./content-store");
	const { fileKey, mongoCollection } = CONTENT_KEYS.aboutUs;
	try {
		const items = await listPublishedItems(fileKey, mongoCollection, 1);
		if (items.length === 0) return null;
		const a = items[0];
		return {
			id: String(a.id),
			heading: String(a.heading ?? "About Us"),
			body: String(a.body ?? ""),
			imageUrl: (a.imageUrl as string | null) ?? null,
			published: Boolean(a.published),
		};
	} catch (error) {
		console.error("Error fetching About Us:", error);
		return null;
	}
}

