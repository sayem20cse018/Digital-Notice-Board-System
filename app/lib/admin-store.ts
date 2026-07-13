"use server";

import { ObjectId } from "mongodb";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { isDbDisabled } from "./config";
import { getDb } from "./mongodb";

type WithId<T> = T & { _id: ObjectId };

type NewsDoc = {
  title: string;
  content?: string | null;
  imageUrl?: string | null;
  published: boolean;
  createdAt: Date;
  updatedAt: Date;
};

type TeacherDoc = {
  name: string;
  title?: string | null;
  bio?: string | null;
  photoUrl?: string | null;
  isFeatured: boolean;
  createdAt: Date;
  updatedAt: Date;
};

type ResultDoc = {
  examName: string;
  className?: string | null;
  linkUrl: string;
  publishedAt: Date;
  createdAt: Date;
  updatedAt: Date;
};

type QuoteDoc = {
  text: string;
  authorName: string;
  displayOrder: number;
  createdAt: Date;
  updatedAt: Date;
};

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

type AchievementDoc = {
  title: string;
  description?: string | null;
  imageUrl?: string | null;
  published: boolean;
  displayOrder: number;
  createdAt: Date;
  updatedAt: Date;
};

type NoticeDoc = {
  title: string;
  body?: string | null;
  pdfUrl?: string | null;
  displayOrder: number;
  published: boolean;
  createdAt: Date;
  updatedAt: Date;
};

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

type ExamRoutineDoc = {
  examName: string;
  date: Date;
  time?: string | null;
  subject: string;
  room?: string | null;
  createdAt: Date;
  updatedAt: Date;
};

const COLLECTIONS = {
  news: "NewsItem",
  teachers: "Teacher",
  results: "ResultItem",
  quotes: "Quote",
  events: "EventItem",
  achievements: "Achievement",
  notices: "NoticeItem",
  upcoming: "UpcomingCard",
  classRoutine: "ClassRoutine",
  examRoutine: "ExamRoutine",
};

// Cookie-based storage for demo mode
async function getCookieData(key: string): Promise<any[]> {
  try {
    const c = await cookies();
    const data = c.get(key)?.value;
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

async function setCookieData(key: string, data: any[]) {
  const c = await cookies();
  c.set(key, JSON.stringify(data), { path: "/", maxAge: 60 * 60 * 24 * 365 });
}

function toObjectId(id: string) {
  try {
    return new ObjectId(id);
  } catch {
    throw new Error("Invalid id");
  }
}

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

// News
export async function getNewsAdmin() {
  if (isDbDisabled()) {
    return await getCookieData("admin_news");
  }
  try {
    const collection = await getCollection<NewsDoc>(COLLECTIONS.news);
    const items = await collection.find().sort({ createdAt: -1 }).toArray();
    return normalizeMany(items as WithId<NewsDoc>[]);
  } catch (error) {
    console.error("Error fetching news:", error);
    return await getCookieData("admin_news");
  }
}

export async function createNews(formData: FormData) {
  const title = String(formData.get("title") || "").trim();
  const content = String(formData.get("content") || "").trim() || null;
  const imageUrl = String(formData.get("imageUrl") || "").trim() || null;
  const published = Boolean(formData.get("published"));

  if (!title) return;

  if (isDbDisabled()) {
    const items = await getCookieData("admin_news");
    items.push({
      id: `n_${Date.now()}`,
      title,
      content,
      imageUrl,
      published,
      createdAt: new Date().toISOString(),
    });
    await setCookieData("admin_news", items);
  } else {
    try {
      const collection = await getCollection<NewsDoc>(COLLECTIONS.news);
      await collection.insertOne({
        title,
        content,
        imageUrl,
        published,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    } catch (error) {
      console.error("❌ Error creating news:", error);
      const items = await getCookieData("admin_news");
      items.push({
        id: `n_${Date.now()}`,
        title,
        content,
        imageUrl,
        published,
        createdAt: new Date().toISOString(),
      });
      await setCookieData("admin_news", items);
    }
  }
  revalidatePath("/");
  revalidatePath("/admin/news");
  redirect("/admin/news?success=true");
}

export async function updateNews(id: string, formData: FormData) {
  const title = String(formData.get("title") || "").trim();
  const content = String(formData.get("content") || "").trim() || null;
  const imageUrl = String(formData.get("imageUrl") || "").trim() || null;
  const published = Boolean(formData.get("published"));

  if (!title) return;

  if (isDbDisabled()) {
    const items = await getCookieData("admin_news");
    const index = items.findIndex((x: any) => x.id === id);
    if (index !== -1) {
      items[index] = { ...items[index], title, content, imageUrl, published };
      await setCookieData("admin_news", items);
    }
  } else {
    try {
      const collection = await getCollection<NewsDoc>(COLLECTIONS.news);
      await collection.updateOne(
        { _id: toObjectId(id) },
        {
          $set: {
            title,
            content,
            imageUrl,
            published,
            updatedAt: new Date(),
          },
        },
      );
    } catch (error) {
      console.error("❌ Error updating news:", error);
      const items = await getCookieData("admin_news");
      const index = items.findIndex((x: any) => x.id === id);
      if (index !== -1) {
        items[index] = { ...items[index], title, content, imageUrl, published };
        await setCookieData("admin_news", items);
      }
    }
  }
  revalidatePath("/");
  revalidatePath("/admin/news");
  redirect("/admin/news?success=true");
}

export async function deleteNews(id: string) {
  if (isDbDisabled()) {
    const items = await getCookieData("admin_news");
    await setCookieData("admin_news", items.filter((x: any) => x.id !== id));
  } else {
    try {
      const collection = await getCollection<NewsDoc>(COLLECTIONS.news);
      await collection.deleteOne({ _id: toObjectId(id) });
    } catch (error) {
      console.error("Error deleting news:", error);
      const items = await getCookieData("admin_news");
      await setCookieData("admin_news", items.filter((x: any) => x.id !== id));
    }
  }
  revalidatePath("/");
  revalidatePath("/admin/news");
}

// Teachers
export async function getTeachersAdmin() {
  if (isDbDisabled()) {
    return await getCookieData("admin_teachers");
  }
  try {
    const collection = await getCollection<TeacherDoc>(COLLECTIONS.teachers);
    const items = await collection.find().sort({ createdAt: -1 }).toArray();
    return normalizeMany(items as WithId<TeacherDoc>[]);
  } catch (error) {
    console.error("Error fetching teachers:", error);
    return await getCookieData("admin_teachers");
  }
}

export async function createTeacher(formData: FormData) {
  const name = String(formData.get("name") || "").trim();
  const title = String(formData.get("title") || "").trim() || null;
  const bio = String(formData.get("bio") || "").trim() || null;
  const photoUrl = String(formData.get("photoUrl") || "").trim() || null;

  if (!name) return;

  if (isDbDisabled()) {
    const items = await getCookieData("admin_teachers");
    items.push({
      id: `t_${Date.now()}`,
      name,
      title,
      bio,
      photoUrl,
      isFeatured: false,
      createdAt: new Date().toISOString(),
    });
    await setCookieData("admin_teachers", items);
  } else {
    try {
      const collection = await getCollection<TeacherDoc>(COLLECTIONS.teachers);
      await collection.insertOne({
        name,
        title,
        bio,
        photoUrl,
        isFeatured: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    } catch (error) {
      console.error("❌ Error creating teacher:", error);
      const items = await getCookieData("admin_teachers");
      items.push({
        id: `t_${Date.now()}`,
        name,
        title,
        bio,
        photoUrl,
        isFeatured: false,
        createdAt: new Date().toISOString(),
      });
      await setCookieData("admin_teachers", items);
    }
  }
  revalidatePath("/");
  revalidatePath("/admin/teachers");
  redirect("/admin/teachers?success=true");
}

export async function updateTeacher(id: string, formData: FormData) {
  const name = String(formData.get("name") || "").trim();
  const title = String(formData.get("title") || "").trim() || null;
  const bio = String(formData.get("bio") || "").trim() || null;
  const photoUrl = String(formData.get("photoUrl") || "").trim() || null;

  if (!name) return;

  if (isDbDisabled()) {
    const items = await getCookieData("admin_teachers");
    const index = items.findIndex((x: any) => x.id === id);
    if (index !== -1) {
      items[index] = { ...items[index], name, title, bio, photoUrl };
      await setCookieData("admin_teachers", items);
    }
  } else {
    try {
      const collection = await getCollection<TeacherDoc>(COLLECTIONS.teachers);
      await collection.updateOne(
        { _id: toObjectId(id) },
        {
          $set: {
            name,
            title,
            bio,
            photoUrl,
            updatedAt: new Date(),
          },
        },
      );
    } catch (error) {
      console.error("❌ Error updating teacher:", error);
      const items = await getCookieData("admin_teachers");
      const index = items.findIndex((x: any) => x.id === id);
      if (index !== -1) {
        items[index] = { ...items[index], name, title, bio, photoUrl };
        await setCookieData("admin_teachers", items);
      }
    }
  }
  revalidatePath("/");
  revalidatePath("/admin/teachers");
 	redirect("/admin/teachers?success=true");
}

export async function toggleFeatureTeacher(id: string) {
  if (isDbDisabled()) {
    const items = await getCookieData("admin_teachers");
    const item = items.find((x: any) => x.id === id);
    if (item) item.isFeatured = !item.isFeatured;
    await setCookieData("admin_teachers", items);
  } else {
    try {
      const collection = await getCollection<TeacherDoc>(COLLECTIONS.teachers);
      const teacher = await collection.findOne({ _id: toObjectId(id) });
      if (teacher) {
        await collection.updateOne(
          { _id: teacher._id },
          { $set: { isFeatured: !teacher.isFeatured, updatedAt: new Date() } },
        );
      }
    } catch (error) {
      console.error("Error toggling teacher feature:", error);
      const items = await getCookieData("admin_teachers");
      const item = items.find((x: any) => x.id === id);
      if (item) item.isFeatured = !item.isFeatured;
      await setCookieData("admin_teachers", items);
    }
  }
  revalidatePath("/");
  revalidatePath("/admin/teachers");
}

export async function deleteTeacher(id: string) {
  if (isDbDisabled()) {
    const items = await getCookieData("admin_teachers");
    await setCookieData("admin_teachers", items.filter((x: any) => x.id !== id));
  } else {
    try {
      const collection = await getCollection<TeacherDoc>(COLLECTIONS.teachers);
      await collection.deleteOne({ _id: toObjectId(id) });
    } catch (error) {
      console.error("Error deleting teacher:", error);
      const items = await getCookieData("admin_teachers");
      await setCookieData("admin_teachers", items.filter((x: any) => x.id !== id));
    }
  }
  revalidatePath("/");
  revalidatePath("/admin/teachers");
}

// Results
export async function getResultsAdmin() {
  if (isDbDisabled()) {
    return await getCookieData("admin_results");
  }
  try {
    const collection = await getCollection<ResultDoc>(COLLECTIONS.results);
    const items = await collection.find().sort({ publishedAt: -1 }).toArray();
    return normalizeMany(items as WithId<ResultDoc>[]);
  } catch (error) {
    console.error("Error fetching results:", error);
    return await getCookieData("admin_results");
  }
}

export async function createResult(formData: FormData) {
  const examName = String(formData.get("examName") || "").trim();
  const className = String(formData.get("className") || "").trim() || null;
  const linkUrl = String(formData.get("linkUrl") || "").trim();

  if (!examName || !linkUrl) return;

  if (isDbDisabled()) {
    const items = await getCookieData("admin_results");
    items.push({
      id: `r_${Date.now()}`,
      examName,
      className,
      linkUrl,
      publishedAt: new Date().toISOString(),
    });
    await setCookieData("admin_results", items);
  } else {
    try {
      const collection = await getCollection<ResultDoc>(COLLECTIONS.results);
      await collection.insertOne({
        examName,
        className,
        linkUrl,
        publishedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    } catch (error) {
      console.error("❌ Error creating result:", error);
      const items = await getCookieData("admin_results");
      items.push({
        id: `r_${Date.now()}`,
        examName,
        className,
        linkUrl,
        publishedAt: new Date().toISOString(),
      });
      await setCookieData("admin_results", items);
    }
  }
  revalidatePath("/");
  revalidatePath("/admin/results");
  redirect("/admin/results?success=true");
}

export async function updateResult(id: string, formData: FormData) {
  const examName = String(formData.get("examName") || "").trim();
  const className = String(formData.get("className") || "").trim() || null;
  const linkUrl = String(formData.get("linkUrl") || "").trim();

  if (!examName || !linkUrl) return;

  if (isDbDisabled()) {
    const items = await getCookieData("admin_results");
    const index = items.findIndex((x: any) => x.id === id);
    if (index !== -1) {
      items[index] = { ...items[index], examName, className, linkUrl };
      await setCookieData("admin_results", items);
    }
  } else {
    try {
      const collection = await getCollection<ResultDoc>(COLLECTIONS.results);
      await collection.updateOne(
        { _id: toObjectId(id) },
        {
          $set: {
            examName,
            className,
            linkUrl,
            updatedAt: new Date(),
          },
        },
      );
    } catch (error) {
      console.error("❌ Error updating result:", error);
      const items = await getCookieData("admin_results");
      const index = items.findIndex((x: any) => x.id === id);
      if (index !== -1) {
        items[index] = { ...items[index], examName, className, linkUrl };
        await setCookieData("admin_results", items);
      }
    }
  }
  revalidatePath("/");
  revalidatePath("/admin/results");
  redirect("/admin/results?success=true");
}

export async function deleteResult(id: string) {
  if (isDbDisabled()) {
    const items = await getCookieData("admin_results");
    await setCookieData("admin_results", items.filter((x: any) => x.id !== id));
  } else {
    try {
      const collection = await getCollection<ResultDoc>(COLLECTIONS.results);
      await collection.deleteOne({ _id: toObjectId(id) });
    } catch (error) {
      console.error("Error deleting result:", error);
      const items = await getCookieData("admin_results");
      await setCookieData("admin_results", items.filter((x: any) => x.id !== id));
    }
  }
  revalidatePath("/");
  revalidatePath("/admin/results");
}

// Quotes
export async function getQuotesAdmin() {
  if (isDbDisabled()) {
    return await getCookieData("admin_quotes");
  }
  try {
    const collection = await getCollection<QuoteDoc>(COLLECTIONS.quotes);
    const items = await collection.find().sort({ displayOrder: 1, createdAt: 1 }).toArray();
    return normalizeMany(items as WithId<QuoteDoc>[]);
  } catch (error) {
    console.error("Error fetching quotes:", error);
    return await getCookieData("admin_quotes");
  }
}

export async function createQuote(formData: FormData) {
  const text = String(formData.get("text") || "").trim();
  const authorName = String(formData.get("authorName") || "").trim();

  if (!text || !authorName) return;

  if (isDbDisabled()) {
    const items = await getCookieData("admin_quotes");
    items.push({
      id: `q_${Date.now()}`,
      text,
      authorName,
      displayOrder: items.length,
    });
    await setCookieData("admin_quotes", items);
  } else {
    try {
      const collection = await getCollection<QuoteDoc>(COLLECTIONS.quotes);
      const count = await collection.countDocuments();
      await collection.insertOne({
        text,
        authorName,
        displayOrder: count,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    } catch (error) {
      console.error("❌ Error creating quote:", error);
      const items = await getCookieData("admin_quotes");
      items.push({
        id: `q_${Date.now()}`,
        text,
        authorName,
        displayOrder: items.length,
      });
      await setCookieData("admin_quotes", items);
    }
  }
  revalidatePath("/");
  revalidatePath("/admin/quotes");
  redirect("/admin/quotes?success=true");
}

export async function updateQuote(id: string, formData: FormData) {
  const text = String(formData.get("text") || "").trim();
  const authorName = String(formData.get("authorName") || "").trim();

  if (!text || !authorName) return;

  if (isDbDisabled()) {
    const items = await getCookieData("admin_quotes");
    const index = items.findIndex((x: any) => x.id === id);
    if (index !== -1) {
      items[index] = { ...items[index], text, authorName };
      await setCookieData("admin_quotes", items);
    }
  } else {
    try {
      const collection = await getCollection<QuoteDoc>(COLLECTIONS.quotes);
      await collection.updateOne(
        { _id: toObjectId(id) },
        {
          $set: {
            text,
            authorName,
            updatedAt: new Date(),
          },
        },
      );
    } catch (error) {
      console.error("❌ Error updating quote:", error);
      const items = await getCookieData("admin_quotes");
      const index = items.findIndex((x: any) => x.id === id);
      if (index !== -1) {
        items[index] = { ...items[index], text, authorName };
        await setCookieData("admin_quotes", items);
      }
    }
  }
  revalidatePath("/");
  revalidatePath("/admin/quotes");
  redirect("/admin/quotes?success=true");
}

export async function deleteQuote(id: string) {
  if (isDbDisabled()) {
    const items = await getCookieData("admin_quotes");
    await setCookieData("admin_quotes", items.filter((x: any) => x.id !== id));
  } else {
    try {
      const collection = await getCollection<QuoteDoc>(COLLECTIONS.quotes);
      await collection.deleteOne({ _id: toObjectId(id) });
    } catch (error) {
      console.error("Error deleting quote:", error);
      const items = await getCookieData("admin_quotes");
      await setCookieData("admin_quotes", items.filter((x: any) => x.id !== id));
    }
  }
  revalidatePath("/");
  revalidatePath("/admin/quotes");
}

// Events
export async function getEventsAdmin() {
  if (isDbDisabled()) {
    return await getCookieData("admin_events");
  }
  try {
    const collection = await getCollection<EventDoc>(COLLECTIONS.events);
    const items = await collection.find().sort({ startsAt: -1 }).toArray();
    return normalizeMany(items as WithId<EventDoc>[]);
  } catch (error) {
    console.error("Error fetching events:", error);
    return await getCookieData("admin_events");
  }
}

export async function createEvent(formData: FormData) {
  const title = String(formData.get("title") || "").trim();
  const description = String(formData.get("description") || "").trim() || null;
  const location = String(formData.get("location") || "").trim() || null;
  const startsAt = String(formData.get("startsAt") || "");
  const imageUrl = String(formData.get("imageUrl") || "").trim() || null;
  const published = Boolean(formData.get("published"));

  if (!title || !startsAt) return;

  if (isDbDisabled()) {
    const items = await getCookieData("admin_events");
    items.push({
      id: `e_${Date.now()}`,
      title,
      description,
      location,
      imageUrl,
      startsAt,
      published,
      createdAt: new Date().toISOString(),
    });
    await setCookieData("admin_events", items);
  } else {
    try {
      const collection = await getCollection<EventDoc>(COLLECTIONS.events);
      await collection.insertOne({
        title,
        description,
        location,
        imageUrl,
        startsAt: new Date(startsAt),
        published,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    } catch (error) {
      console.error("Error creating event:", error);
      const items = await getCookieData("admin_events");
      items.push({
        id: `e_${Date.now()}`,
        title,
        description,
        location,
        imageUrl,
        startsAt,
        published,
        createdAt: new Date().toISOString(),
      });
      await setCookieData("admin_events", items);
    }
  }
  revalidatePath("/");
  revalidatePath("/admin/events");
  redirect("/admin/events?success=true");
}

export async function updateEvent(id: string, formData: FormData) {
  const title = String(formData.get("title") || "").trim();
  const description = String(formData.get("description") || "").trim() || null;
  const location = String(formData.get("location") || "").trim() || null;
  const startsAt = String(formData.get("startsAt") || "");
  const imageUrl = String(formData.get("imageUrl") || "").trim() || null;
  const published = Boolean(formData.get("published"));

  if (!title || !startsAt) return;

  if (isDbDisabled()) {
    const items = await getCookieData("admin_events");
    const index = items.findIndex((x: any) => x.id === id);
    if (index !== -1) {
      items[index] = {
        ...items[index],
        title,
        description,
        location,
        imageUrl,
        startsAt,
        published,
      };
      await setCookieData("admin_events", items);
    }
  } else {
    try {
      const collection = await getCollection<EventDoc>(COLLECTIONS.events);
      await collection.updateOne(
        { _id: toObjectId(id) },
        {
          $set: {
            title,
            description,
            location,
            imageUrl,
            startsAt: new Date(startsAt),
            published,
            updatedAt: new Date(),
          },
        },
      );
    } catch (error) {
      console.error("❌ Error updating event:", error);
      const items = await getCookieData("admin_events");
      const index = items.findIndex((x: any) => x.id === id);
      if (index !== -1) {
        items[index] = {
          ...items[index],
          title,
          description,
          location,
          imageUrl,
          startsAt,
          published,
        };
        await setCookieData("admin_events", items);
      }
    }
  }
  revalidatePath("/");
  revalidatePath("/admin/events");
  redirect("/admin/events?success=true");
}

export async function deleteEvent(id: string) {
  if (isDbDisabled()) {
    const items = await getCookieData("admin_events");
    await setCookieData("admin_events", items.filter((x: any) => x.id !== id));
  } else {
    try {
      const collection = await getCollection<EventDoc>(COLLECTIONS.events);
      await collection.deleteOne({ _id: toObjectId(id) });
    } catch (error) {
      console.error("Error deleting event:", error);
      const items = await getCookieData("admin_events");
      await setCookieData("admin_events", items.filter((x: any) => x.id !== id));
    }
  }
  revalidatePath("/");
  revalidatePath("/admin/events");
}

// Achievements
export async function getAchievementsAdmin() {
  if (isDbDisabled()) {
    return await getCookieData("admin_achievements");
  }
  try {
    const collection = await getCollection<AchievementDoc>(COLLECTIONS.achievements);
    const items = await collection.find().sort({ createdAt: -1 }).toArray();
    return normalizeMany(items as WithId<AchievementDoc>[]);
  } catch (error) {
    console.error("Error fetching achievements:", error);
    return await getCookieData("admin_achievements");
  }
}

export async function createAchievement(formData: FormData) {
  const title = String(formData.get("title") || "").trim();
  const description = String(formData.get("description") || "").trim() || null;
  const imageUrl = String(formData.get("imageUrl") || "").trim() || null;
  const published = Boolean(formData.get("published"));

  if (!title) return;

  if (isDbDisabled()) {
    const items = await getCookieData("admin_achievements");
    items.push({
      id: `a_${Date.now()}`,
      title,
      description,
      imageUrl,
      published,
      createdAt: new Date().toISOString(),
    });
    await setCookieData("admin_achievements", items);
  } else {
    try {
      const collection = await getCollection<AchievementDoc>(COLLECTIONS.achievements);
      await collection.insertOne({
        title,
        description,
        imageUrl,
        published,
        displayOrder: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    } catch (error) {
      console.error("❌ Error creating achievement:", error);
      const items = await getCookieData("admin_achievements");
      items.push({
        id: `a_${Date.now()}`,
        title,
        description,
        imageUrl,
        published,
        createdAt: new Date().toISOString(),
      });
      await setCookieData("admin_achievements", items);
    }
  }
  revalidatePath("/");
  revalidatePath("/admin/achievements");
  redirect("/admin/achievements?success=true");
}

export async function updateAchievement(id: string, formData: FormData) {
  const title = String(formData.get("title") || "").trim();
  const description = String(formData.get("description") || "").trim() || null;
  const imageUrl = String(formData.get("imageUrl") || "").trim() || null;
  const published = Boolean(formData.get("published"));

  if (!title) return;

  if (isDbDisabled()) {
    const items = await getCookieData("admin_achievements");
    const index = items.findIndex((x: any) => x.id === id);
    if (index !== -1) {
      items[index] = { ...items[index], title, description, imageUrl, published };
      await setCookieData("admin_achievements", items);
    }
  } else {
    try {
      const collection = await getCollection<AchievementDoc>(COLLECTIONS.achievements);
      await collection.updateOne(
        { _id: toObjectId(id) },
        {
          $set: {
            title,
            description,
            imageUrl,
            published,
            updatedAt: new Date(),
          },
        },
      );
    } catch (error) {
      console.error("❌ Error updating achievement:", error);
      const items = await getCookieData("admin_achievements");
      const index = items.findIndex((x: any) => x.id === id);
      if (index !== -1) {
        items[index] = { ...items[index], title, description, imageUrl, published };
        await setCookieData("admin_achievements", items);
      }
    }
  }
  revalidatePath("/");
  revalidatePath("/admin/achievements");
  redirect("/admin/achievements?success=true");
}

export async function deleteAchievement(id: string) {
  if (isDbDisabled()) {
    const items = await getCookieData("admin_achievements");
    await setCookieData("admin_achievements", items.filter((x: any) => x.id !== id));
  } else {
    try {
      const collection = await getCollection<AchievementDoc>(COLLECTIONS.achievements);
      await collection.deleteOne({ _id: toObjectId(id) });
    } catch (error) {
      console.error("Error deleting achievement:", error);
      const items = await getCookieData("admin_achievements");
      await setCookieData("admin_achievements", items.filter((x: any) => x.id !== id));
    }
  }
  revalidatePath("/");
  revalidatePath("/admin/achievements");
}

// Notices
export async function getNoticesAdmin() {
  if (isDbDisabled()) {
    return await getCookieData("admin_notices");
  }
  try {
    const collection = await getCollection<NoticeDoc>(COLLECTIONS.notices);
    const items = await collection
      .find()
      .sort({ displayOrder: 1, createdAt: -1 })
      .toArray();
    return normalizeMany(items as WithId<NoticeDoc>[]);
  } catch (error) {
    console.error("Error fetching notices:", error);
    return await getCookieData("admin_notices");
  }
}

export async function createNotice(formData: FormData) {
  const title = String(formData.get("title") || "").trim();
  const body = String(formData.get("body") || "").trim() || null;
  const pdfUrl = String(formData.get("pdfUrl") || "").trim() || null;
  const displayOrder = Number(formData.get("displayOrder") || 0) || 0;
  const published = Boolean(formData.get("published"));

  if (!title) return;

  if (isDbDisabled()) {
    const items = await getCookieData("admin_notices");
    items.push({
      id: `no_${Date.now()}`,
      title,
      body,
      pdfUrl,
      displayOrder,
      published,
      createdAt: new Date().toISOString(),
    });
    await setCookieData("admin_notices", items);
  } else {
    try {
      const collection = await getCollection<NoticeDoc>(COLLECTIONS.notices);
      await collection.insertOne({
        title,
        body,
        pdfUrl,
        displayOrder,
        published,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    } catch (error) {
      console.error("❌ Error creating notice:", error);
      const items = await getCookieData("admin_notices");
      items.push({
        id: `no_${Date.now()}`,
        title,
        body,
        pdfUrl,
        displayOrder,
        published,
        createdAt: new Date().toISOString(),
      });
      await setCookieData("admin_notices", items);
    }
  }
  revalidatePath("/");
  revalidatePath("/admin/notices");
  redirect("/admin/notices?success=true");
}

export async function updateNotice(id: string, formData: FormData) {
  const title = String(formData.get("title") || "").trim();
  const body = String(formData.get("body") || "").trim() || null;
  const pdfUrl = String(formData.get("pdfUrl") || "").trim() || null;
  const displayOrder = Number(formData.get("displayOrder") || 0) || 0;
  const published = Boolean(formData.get("published"));

  if (!title) return;

  if (isDbDisabled()) {
    const items = await getCookieData("admin_notices");
    const index = items.findIndex((x: any) => x.id === id);
    if (index !== -1) {
      items[index] = { ...items[index], title, body, pdfUrl, displayOrder, published };
      await setCookieData("admin_notices", items);
    }
  } else {
    try {
      const collection = await getCollection<NoticeDoc>(COLLECTIONS.notices);
      await collection.updateOne(
        { _id: toObjectId(id) },
        {
          $set: {
            title,
            body,
            pdfUrl,
            displayOrder,
            published,
            updatedAt: new Date(),
          },
        },
      );
    } catch (error) {
      console.error("❌ Error updating notice:", error);
      const items = await getCookieData("admin_notices");
      const index = items.findIndex((x: any) => x.id === id);
      if (index !== -1) {
        items[index] = { ...items[index], title, body, pdfUrl, displayOrder, published };
        await setCookieData("admin_notices", items);
      }
    }
  }
  revalidatePath("/");
  revalidatePath("/admin/notices");
  redirect("/admin/notices?success=true");
}

export async function togglePublishNotice(id: string, value: boolean) {
  if (isDbDisabled()) {
    const items = await getCookieData("admin_notices");
    const item = items.find((x: any) => x.id === id);
    if (item) item.published = value;
    await setCookieData("admin_notices", items);
  } else {
    try {
      const collection = await getCollection<NoticeDoc>(COLLECTIONS.notices);
      await collection.updateOne(
        { _id: toObjectId(id) },
        { $set: { published: value, updatedAt: new Date() } },
      );
    } catch (error) {
      console.error("Error toggling notice publish:", error);
      const items = await getCookieData("admin_notices");
      const item = items.find((x: any) => x.id === id);
      if (item) item.published = value;
      await setCookieData("admin_notices", items);
    }
  }
  revalidatePath("/");
  revalidatePath("/admin/notices");
}

export async function deleteNotice(id: string) {
  if (isDbDisabled()) {
    const items = await getCookieData("admin_notices");
    await setCookieData("admin_notices", items.filter((x: any) => x.id !== id));
  } else {
    try {
      const collection = await getCollection<NoticeDoc>(COLLECTIONS.notices);
      await collection.deleteOne({ _id: toObjectId(id) });
    } catch (error) {
      console.error("Error deleting notice:", error);
      const items = await getCookieData("admin_notices");
      await setCookieData("admin_notices", items.filter((x: any) => x.id !== id));
    }
  }
  revalidatePath("/");
  revalidatePath("/admin/notices");
}

// Upcoming Cards (Right-side 6 cards)
export async function getUpcomingAdmin() {
  if (isDbDisabled()) {
    return await getCookieData("admin_upcoming");
  }
  try {
    const collection = await getCollection<UpcomingDoc>(COLLECTIONS.upcoming);
    const items = await collection.find().sort({ displayOrder: 1, createdAt: -1 }).toArray();
    return normalizeMany(items as WithId<UpcomingDoc>[]);
  } catch (error) {
    console.error("Error fetching upcoming cards:", error);
    return await getCookieData("admin_upcoming");
  }
}

export async function createUpcoming(formData: FormData) {
  const title = String(formData.get("title") || "").trim();
  const imageUrl = String(formData.get("imageUrl") || "").trim() || null;
  const fileUrl = String(formData.get("fileUrl") || "").trim() || null;
  const dueDate = String(formData.get("dueDate") || "");
  const displayOrder = Number(formData.get("displayOrder") || 0) || 0;
  const published = Boolean(formData.get("published"));

  if (!title || !dueDate) return;

  if (isDbDisabled()) {
    const items = await getCookieData("admin_upcoming");
    items.push({
      id: `u_${Date.now()}`,
      title,
      imageUrl,
      fileUrl,
      dueDate,
      displayOrder,
      published,
      createdAt: new Date().toISOString(),
    });
    await setCookieData("admin_upcoming", items);
  } else {
    try {
      const collection = await getCollection<UpcomingDoc>(COLLECTIONS.upcoming);
      await collection.insertOne({
        title,
        imageUrl,
        fileUrl,
        dueDate: new Date(dueDate),
        displayOrder,
        published,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    } catch (error) {
      console.error("❌ Error creating upcoming card:", error);
      const items = await getCookieData("admin_upcoming");
      items.push({
        id: `u_${Date.now()}`,
        title,
        imageUrl,
        fileUrl,
        dueDate,
        displayOrder,
        published,
        createdAt: new Date().toISOString(),
      });
      await setCookieData("admin_upcoming", items);
    }
  }
  revalidatePath("/");
  revalidatePath("/admin/upcoming");
  redirect("/admin/upcoming?success=true");
}

export async function updateUpcoming(id: string, formData: FormData) {
  const title = String(formData.get("title") || "").trim();
  const imageUrl = String(formData.get("imageUrl") || "").trim() || null;
  const fileUrl = String(formData.get("fileUrl") || "").trim() || null;
  const dueDate = String(formData.get("dueDate") || "");
  const displayOrder = Number(formData.get("displayOrder") || 0) || 0;
  const published = Boolean(formData.get("published"));

  if (!title || !dueDate) return;

  if (isDbDisabled()) {
    const items = await getCookieData("admin_upcoming");
    const index = items.findIndex((x: any) => x.id === id);
    if (index !== -1) {
      items[index] = { ...items[index], title, imageUrl, fileUrl, dueDate, displayOrder, published };
      await setCookieData("admin_upcoming", items);
    }
  } else {
    try {
      const collection = await getCollection<UpcomingDoc>(COLLECTIONS.upcoming);
      await collection.updateOne(
        { _id: toObjectId(id) },
        {
          $set: {
            title,
            imageUrl,
            fileUrl,
            dueDate: new Date(dueDate),
            displayOrder,
            published,
            updatedAt: new Date(),
          },
        },
      );
    } catch (error) {
      console.error("❌ Error updating upcoming card:", error);
      const items = await getCookieData("admin_upcoming");
      const index = items.findIndex((x: any) => x.id === id);
      if (index !== -1) {
        items[index] = { ...items[index], title, imageUrl, fileUrl, dueDate, displayOrder, published };
        await setCookieData("admin_upcoming", items);
      }
    }
  }
  revalidatePath("/");
  revalidatePath("/admin/upcoming");
  redirect("/admin/upcoming?success=true");
}

export async function deleteUpcoming(id: string) {
  if (isDbDisabled()) {
    const items = await getCookieData("admin_upcoming");
    await setCookieData("admin_upcoming", items.filter((x: any) => x.id !== id));
  } else {
    try {
      const collection = await getCollection<UpcomingDoc>(COLLECTIONS.upcoming);
      await collection.deleteOne({ _id: toObjectId(id) });
    } catch (error) {
      console.error("Error deleting upcoming card:", error);
      const items = await getCookieData("admin_upcoming");
      await setCookieData("admin_upcoming", items.filter((x: any) => x.id !== id));
    }
  }
  revalidatePath("/");
  revalidatePath("/admin/upcoming");
}

export async function togglePublishUpcoming(id: string, value: boolean) {
  if (isDbDisabled()) {
    const items = await getCookieData("admin_upcoming");
    const item = items.find((x: any) => x.id === id);
    if (item) item.published = value;
    await setCookieData("admin_upcoming", items);
  } else {
    try {
      const collection = await getCollection<UpcomingDoc>(COLLECTIONS.upcoming);
      await collection.updateOne(
        { _id: toObjectId(id) },
        { $set: { published: value, updatedAt: new Date() } },
      );
    } catch (error) {
      console.error("Error toggling upcoming publish:", error);
      const items = await getCookieData("admin_upcoming");
      const item = items.find((x: any) => x.id === id);
      if (item) item.published = value;
      await setCookieData("admin_upcoming", items);
    }
  }
  revalidatePath("/");
  revalidatePath("/admin/upcoming");
}

// Class Routine
export async function getClassRoutineAdmin() {
  if (isDbDisabled()) {
    return await getCookieData("admin_routine");
  }
  try {
    const collection = await getCollection<ClassRoutineDoc>(COLLECTIONS.classRoutine);
    const items = await collection
      .find()
      .sort({ dayOfWeek: 1, period: 1 })
      .toArray();
    return normalizeMany(items as WithId<ClassRoutineDoc>[]);
  } catch (error) {
    console.error("Error fetching class routine:", error);
    return [];
  }
}

export async function createClassRoutine(formData: FormData) {
  const className = String(formData.get("className") || "").trim();
  const dayOfWeek = Number(formData.get("dayOfWeek") || 0);
  const period = Number(formData.get("period") || 1);
  const subject = String(formData.get("subject") || "").trim();
  const teacher = String(formData.get("teacher") || "").trim() || null;
  const room = String(formData.get("room") || "").trim() || null;
  const fileUrl = String(formData.get("fileUrl") || "").trim() || null;

  if (!className || !subject) {
    redirect("/admin/routine?error=missing_fields");
    return;
  }

  if (isDbDisabled()) {
    const items = await getCookieData("admin_routine");
    items.push({
      id: `cr_${Date.now()}`,
      className,
      dayOfWeek,
      period,
      subject,
      teacher,
      room,
      fileUrl,
      createdAt: new Date().toISOString(),
    });
    await setCookieData("admin_routine", items);
  } else {
    try {
      const collection = await getCollection<ClassRoutineDoc>(COLLECTIONS.classRoutine);
      await collection.insertOne({
        className,
        dayOfWeek,
        period,
        subject,
        teacher,
        room,
        fileUrl,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    } catch (error) {
      console.error("❌ Error creating class routine:", error);
      redirect("/admin/routine?error=create_failed");
      return;
    }
  }
  revalidatePath("/");
  revalidatePath("/admin/routine");
  redirect("/admin/routine?success=true");
}

export async function updateClassRoutine(id: string, formData: FormData) {
  const className = String(formData.get("className") || "").trim();
  const dayOfWeek = Number(formData.get("dayOfWeek") || 0);
  const period = Number(formData.get("period") || 1);
  const subject = String(formData.get("subject") || "").trim();
  const teacher = String(formData.get("teacher") || "").trim() || null;
  const room = String(formData.get("room") || "").trim() || null;
  const fileUrl = String(formData.get("fileUrl") || "").trim() || null;

  if (!className || !subject) {
    redirect("/admin/routine?error=missing_fields");
    return;
  }

  if (isDbDisabled()) {
    const items = await getCookieData("admin_routine");
    const index = items.findIndex((x: any) => x.id === id);
    if (index !== -1) {
      items[index] = { ...items[index], className, dayOfWeek, period, subject, teacher, room, fileUrl };
      await setCookieData("admin_routine", items);
    }
  } else {
    try {
      const collection = await getCollection<ClassRoutineDoc>(COLLECTIONS.classRoutine);
      await collection.updateOne(
        { _id: toObjectId(id) },
        {
          $set: {
            className,
            dayOfWeek,
            period,
            subject,
            teacher,
            room,
            fileUrl,
            updatedAt: new Date(),
          },
        },
      );
    } catch (error) {
      console.error("❌ Error updating class routine:", error);
      redirect("/admin/routine?error=update_failed");
      return;
    }
  }
  revalidatePath("/");
  revalidatePath("/admin/routine");
  redirect("/admin/routine?success=true");
}

export async function deleteClassRoutine(id: string) {
  if (isDbDisabled()) {
    const items = await getCookieData("admin_routine");
    await setCookieData("admin_routine", items.filter((x: any) => x.id !== id));
  } else {
    try {
      const collection = await getCollection<ClassRoutineDoc>(COLLECTIONS.classRoutine);
      await collection.deleteOne({ _id: toObjectId(id) });
    } catch (error) {
      console.error("❌ Error deleting class routine:", error);
      redirect("/admin/routine?error=delete_failed");
      return;
    }
  }
  revalidatePath("/");
  revalidatePath("/admin/routine");
  redirect("/admin/routine?success=true");
}

// Exam Routine
export async function getExamRoutineAdmin() {
  if (isDbDisabled()) {
    return [];
  }
  try {
    const collection = await getCollection<ExamRoutineDoc>(COLLECTIONS.examRoutine);
    const items = await collection.find().sort({ date: 1 }).toArray();
    return normalizeMany(items as WithId<ExamRoutineDoc>[]);
  } catch (error) {
    console.error("Error fetching exam routine:", error);
    return [];
  }
}

export async function createExamRoutine(formData: FormData) {
  const examName = String(formData.get("examName") || "").trim();
  const date = String(formData.get("date") || "");
  const time = String(formData.get("time") || "").trim() || null;
  const subject = String(formData.get("subject") || "").trim();
  const room = String(formData.get("room") || "").trim() || null;

  if (!examName || !date || !subject) return;

  if (!isDbDisabled()) {
    try {
      const collection = await getCollection<ExamRoutineDoc>(COLLECTIONS.examRoutine);
      await collection.insertOne({
        examName,
        date: new Date(date),
        time,
        subject,
        room,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    } catch (error) {
      console.error("❌ Error creating exam routine:", error);
    }
  }
  revalidatePath("/");
  revalidatePath("/admin/exam-routine");
  redirect("/admin/exam-routine?success=true");
}

export async function deleteExamRoutine(id: string) {
  if (!isDbDisabled()) {
    try {
      const collection = await getCollection<ExamRoutineDoc>(COLLECTIONS.examRoutine);
      await collection.deleteOne({ _id: toObjectId(id) });
    } catch (error) {
      console.error("Error deleting exam routine:", error);
    }
  }
  revalidatePath("/");
  revalidatePath("/admin/exam-routine");
}


