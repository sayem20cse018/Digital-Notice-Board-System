import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { isDbDisabled } from "@/app/lib/config";
import { getDb } from "@/app/lib/mongodb";
import SettingsForm, { type SettingsValues } from "./SettingsForm";
import AccountSettingsPanel from "./AccountSettingsPanel";

const DEFAULT_SETTINGS: SettingsValues = {
  departmentName: "Computer Science And Engineering",
  logoUrl: "/images/cse_logo.jpg",
  universityName: "Gopalganj Science and Technology University",
  universityLogoUrl: "/images/GSTUlogo.png",
  marqueeText: "Welcome To Our Department",
  headerBackgroundImages: [],
  headerSlideshowInterval: 8,
  highlightSlideDuration: 5,
  publicSiteUrl: "",
};

async function loadSettings(): Promise<SettingsValues> {
  if (isDbDisabled()) {
    const cookieStore = await cookies();
    let headerBackgroundImages: string[] = [];
    try {
      const raw = cookieStore.get("header_bg")?.value;
      if (raw) headerBackgroundImages = JSON.parse(raw);
    } catch {
      /* ignore */
    }
    return {
      departmentName: cookieStore.get("dept_name")?.value ?? DEFAULT_SETTINGS.departmentName,
      logoUrl: cookieStore.get("dept_logo")?.value ?? DEFAULT_SETTINGS.logoUrl,
      universityName: cookieStore.get("uni_name")?.value ?? DEFAULT_SETTINGS.universityName,
      universityLogoUrl: cookieStore.get("uni_logo")?.value ?? DEFAULT_SETTINGS.universityLogoUrl,
      marqueeText: cookieStore.get("dept_welcome")?.value ?? DEFAULT_SETTINGS.marqueeText,
      headerBackgroundImages,
      headerSlideshowInterval: Number(cookieStore.get("header_interval")?.value) || 8,
      highlightSlideDuration: Number(cookieStore.get("highlight_duration")?.value) || 5,
      publicSiteUrl: cookieStore.get("public_site_url")?.value ?? "",
    };
  }

  try {
    const db = await getDb();
    const dbSettings = await db.collection("DepartmentSettings").findOne();
    if (dbSettings) {
      return {
        departmentName: String(dbSettings.departmentName ?? DEFAULT_SETTINGS.departmentName),
        logoUrl: String(dbSettings.logoUrl ?? DEFAULT_SETTINGS.logoUrl),
        universityName: String(dbSettings.universityName ?? DEFAULT_SETTINGS.universityName),
        universityLogoUrl: String(dbSettings.universityLogoUrl ?? DEFAULT_SETTINGS.universityLogoUrl),
        marqueeText: String(dbSettings.marqueeText ?? DEFAULT_SETTINGS.marqueeText),
        headerBackgroundImages: Array.isArray(dbSettings.headerBackgroundImages)
          ? dbSettings.headerBackgroundImages.map(String)
          : [],
        headerSlideshowInterval: Number(dbSettings.headerSlideshowInterval) || 8,
        highlightSlideDuration: Number(dbSettings.highlightSlideDuration) || 5,
        publicSiteUrl: String(dbSettings.publicSiteUrl ?? ""),
      };
    }
  } catch (error) {
    console.error("Error loading settings:", error);
  }

  return DEFAULT_SETTINGS;
}

function clearSettingsCookies(cookieStore: Awaited<ReturnType<typeof cookies>>) {
  for (const name of [
    "dept_name", "dept_logo", "dept_welcome", "uni_name", "uni_logo",
    "header_bg", "header_interval", "highlight_duration", "public_site_url",
  ]) {
    cookieStore.delete(name);
  }
}

export default async function SettingsPage() {
  const settings = await loadSettings();

  async function saveAction(formData: FormData) {
    "use server";

    const departmentName = String(formData.get("departmentName") ?? "").trim();
    const logoUrl = String(formData.get("logoUrl") ?? "").trim();
    const universityName = String(formData.get("universityName") ?? "").trim();
    const universityLogoUrl = String(formData.get("universityLogoUrl") ?? "").trim();
    const marqueeText = String(formData.get("marqueeText") ?? "").trim();
    const headerSlideshowInterval = Number(formData.get("headerSlideshowInterval")) || 8;
    const highlightSlideDuration = Number(formData.get("highlightSlideDuration")) || 5;
    const publicSiteUrl = String(formData.get("publicSiteUrl") ?? "").trim();
    let headerBackgroundImages: string[] = [];
    try {
      headerBackgroundImages = JSON.parse(String(formData.get("headerBackgroundImages") ?? "[]"));
    } catch {
      headerBackgroundImages = [];
    }

    if (!departmentName || !universityName) {
      return { success: false, message: "Department name and university name are required." };
    }

    try {
      const cookieStore = await cookies();
      clearSettingsCookies(cookieStore);

      const payload = {
        departmentName,
        logoUrl,
        universityName,
        universityLogoUrl,
        marqueeText,
        headerBackgroundImages,
        headerSlideshowInterval,
        highlightSlideDuration,
        publicSiteUrl: publicSiteUrl || null,
        updatedAt: new Date(),
      };

      if (isDbDisabled()) {
        cookieStore.set("dept_name", departmentName, { path: "/", maxAge: 60 * 60 * 24 * 365 });
        cookieStore.set("dept_logo", logoUrl, { path: "/", maxAge: 60 * 60 * 24 * 365 });
        cookieStore.set("dept_welcome", marqueeText, { path: "/", maxAge: 60 * 60 * 24 * 365 });
        cookieStore.set("uni_name", universityName, { path: "/", maxAge: 60 * 60 * 24 * 365 });
        cookieStore.set("uni_logo", universityLogoUrl, { path: "/", maxAge: 60 * 60 * 24 * 365 });
        cookieStore.set("header_bg", JSON.stringify(headerBackgroundImages), { path: "/", maxAge: 60 * 60 * 24 * 365 });
        cookieStore.set("header_interval", String(headerSlideshowInterval), { path: "/", maxAge: 60 * 60 * 24 * 365 });
        cookieStore.set("highlight_duration", String(highlightSlideDuration), { path: "/", maxAge: 60 * 60 * 24 * 365 });
        if (publicSiteUrl) {
          cookieStore.set("public_site_url", publicSiteUrl, { path: "/", maxAge: 60 * 60 * 24 * 365 });
        }
      } else {
        const db = await getDb();
        const collection = db.collection("DepartmentSettings");
        const existing = await collection.findOne();

        if (existing) {
          await collection.updateOne({ _id: existing._id }, { $set: payload });
        } else {
          await collection.insertOne({ ...payload, createdAt: new Date() });
        }
      }

      revalidatePath("/");
      revalidatePath("/admin/settings");
      return { success: true, message: "Settings saved successfully." };
    } catch (error) {
      console.error("Error saving settings:", error);
      return { success: false, message: "Failed to save settings. Check MongoDB connection." };
    }
  }

  async function deleteAction() {
    "use server";

    try {
      const cookieStore = await cookies();
      clearSettingsCookies(cookieStore);

      if (!isDbDisabled()) {
        const db = await getDb();
        await db.collection("DepartmentSettings").deleteMany({});
      }

      revalidatePath("/");
      revalidatePath("/admin/settings");
      return { success: true, message: "Settings reset to default values." };
    } catch (error) {
      console.error("Error resetting settings:", error);
      return { success: false, message: "Failed to reset settings." };
    }
  }

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold">Department Settings</h1>
        <p className="mt-1 text-sm text-gray-600">
          Department, logos, header background slideshow, highlight duration, এবং marquee manage করুন।
        </p>
      </div>

      <SettingsForm initial={settings} saveAction={saveAction} deleteAction={deleteAction} />

      <AccountSettingsPanel />
    </div>
  );
}
