import { cookies } from "next/headers";
import { isDbDisabled } from "./config";
import { getDb } from "./mongodb";
import {
  DEFAULT_ADMIN_PREFERENCES,
  parseAdminPreferences,
  type AdminPreferences,
} from "./display-config";

const COOKIE_KEY = "admin_preferences";

export async function getAdminPreferences(): Promise<AdminPreferences> {
  if (isDbDisabled()) {
    try {
      const cookieStore = await cookies();
      const raw = cookieStore.get(COOKIE_KEY)?.value;
      if (raw) {
        return parseAdminPreferences(JSON.parse(raw));
      }
    } catch {
      /* ignore */
    }
    return DEFAULT_ADMIN_PREFERENCES;
  }

  try {
    const db = await getDb();
    const doc = await db.collection("AdminPreferences").findOne();
    if (doc?.preferences) {
      return parseAdminPreferences(doc.preferences);
    }
  } catch (error) {
    console.error("Error loading admin preferences:", error);
  }

  return DEFAULT_ADMIN_PREFERENCES;
}

export async function saveAdminPreferences(
  preferences: AdminPreferences,
): Promise<{ success: boolean; message: string }> {
  try {
    if (isDbDisabled()) {
      const cookieStore = await cookies();
      cookieStore.set(COOKIE_KEY, JSON.stringify(preferences), {
        path: "/",
        maxAge: 60 * 60 * 24 * 365,
      });
    } else {
      const db = await getDb();
      const collection = db.collection("AdminPreferences");
      const existing = await collection.findOne();
      const payload = { preferences, updatedAt: new Date() };
      if (existing) {
        await collection.updateOne({ _id: existing._id }, { $set: payload });
      } else {
        await collection.insertOne({ ...payload, createdAt: new Date() });
      }
    }
    return { success: true, message: "Display settings saved." };
  } catch (error) {
    console.error("Error saving admin preferences:", error);
    return { success: false, message: "Failed to save display settings." };
  }
}
