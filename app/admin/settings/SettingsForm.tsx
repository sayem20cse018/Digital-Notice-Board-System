"use client";

import { useState } from "react";
import ImageUpload from "@/app/components/ImageUpload";
import AdminFlashMessage from "@/app/components/admin-panel/AdminFlashMessage";

export type SettingsValues = {
  departmentName: string;
  logoUrl: string;
  universityName: string;
  universityLogoUrl: string;
  marqueeText: string;
  headerBackgroundImages: string[];
  headerSlideshowInterval: number;
  highlightSlideDuration: number;
  publicSiteUrl: string;
};

type Props = {
  initial: SettingsValues;
  saveAction: (formData: FormData) => Promise<{ success: boolean; message: string }>;
  deleteAction: () => Promise<{ success: boolean; message: string }>;
};

export default function SettingsForm({ initial, saveAction, deleteAction }: Props) {
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [deptLogo, setDeptLogo] = useState(initial.logoUrl);
  const [uniLogo, setUniLogo] = useState(initial.universityLogoUrl);
  const [headerBgs, setHeaderBgs] = useState<string[]>(
    initial.headerBackgroundImages.length > 0
      ? initial.headerBackgroundImages
      : ["", "", "", ""],
  );

  function setHeaderBg(index: number, url: string) {
    setHeaderBgs((prev) => {
      const next = [...prev];
      next[index] = url;
      return next;
    });
  }

  async function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const formData = new FormData(e.currentTarget);
    formData.set("logoUrl", deptLogo);
    formData.set("universityLogoUrl", uniLogo);
    formData.set("headerBackgroundImages", JSON.stringify(headerBgs.filter((u) => u.trim())));

    try {
      const result = await saveAction(formData);
      setMessage({
        type: result.success ? "success" : "error",
        text: result.message,
      });
    } catch {
      setMessage({ type: "error", text: "Save failed. Please try again." });
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!confirm("Reset all department settings to default values?")) return;

    setLoading(true);
    setMessage(null);

    try {
      const result = await deleteAction();
      setMessage({
        type: result.success ? "success" : "error",
        text: result.message,
      });
      if (result.success) {
        window.location.reload();
      }
    } catch {
      setMessage({ type: "error", text: "Reset failed. Please try again." });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      {message && <AdminFlashMessage type={message.type} text={message.text} />}

      <form onSubmit={handleSave} className="rounded border  p-6 shadow-md space-y-5">
        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900 border-b pb-2">Department</h2>

          <div>
            <label className="block text-sm mb-1 font-medium">Department Name</label>
            <input
              name="departmentName"
              defaultValue={initial.departmentName}
              required
              className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={loading}
            />
          </div>

          <ImageUpload
            name="logoUrl"
            label="Department Logo"
            currentImage={initial.logoUrl || null}
            onImageChange={setDeptLogo}
          />
        </section>

        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900 border-b pb-2">University</h2>

          <div>
            <label className="block text-sm mb-1 font-medium">University Name</label>
            <input
              name="universityName"
              defaultValue={initial.universityName}
              required
              className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={loading}
            />
          </div>

          <ImageUpload
            name="universityLogoUrl"
            label="University Logo"
            currentImage={initial.universityLogoUrl || null}
            onImageChange={setUniLogo}
          />
        </section>

        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900 border-b pb-2">Header Background Slideshow</h2>
          <p className="text-sm text-gray-100">Upload up to 4 images for the header background slideshow.</p>

          {[0, 1, 2, 3].map((idx) => (
            <ImageUpload
              key={idx}
              name={`headerBg${idx}`}
              label={`Background Image ${idx + 1}`}
              currentImage={headerBgs[idx] || null}
              onImageChange={(url) => setHeaderBg(idx, url)}
            />
          ))}

          <div>
            <label className="block text-sm mb-1 font-medium">Slideshow Interval (seconds)</label>
            <input
              name="headerSlideshowInterval"
              type="number"
              min={3}
              max={60}
              defaultValue={initial.headerSlideshowInterval}
              className="w-full border rounded px-3 py-2"
              disabled={loading}
            />
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900 border-b pb-2">Highlight News Slideshow</h2>
          <div>
            <label className="block text-sm mb-1 font-medium">Default Slide Duration (seconds)</label>
            <input
              name="highlightSlideDuration"
              type="number"
              min={2}
              max={120}
              defaultValue={initial.highlightSlideDuration}
              className="w-full border rounded px-3 py-2"
              disabled={loading}
            />
            <p className="mt-1 text-xs text-gray-500">
              Each highlight news item can have its own duration — edit individual items in the Highlight News section.
            </p>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900 border-b pb-2">QR Code Settings</h2>
          <div>
            <label className="block text-sm mb-1 font-medium">Public Site URL (for QR codes)</label>
            <input
              name="publicSiteUrl"
              type="url"
              defaultValue={initial.publicSiteUrl}
              placeholder="http://192.168.1.5:3000"
              className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={loading}
            />
            <p className="mt-1 text-xs text-slate-600">
              When a QR code is scanned on a phone, it will open this URL. The PC and phone must be on the same Wi-Fi network. Dev server: <code className="text-xs">npm run dev</code>
            </p>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900 border-b pb-2">Marquee</h2>
          <div>
            <label className="block text-sm mb-1 font-medium">Welcome Marquee Text</label>
            <textarea
              name="marqueeText"
              defaultValue={initial.marqueeText}
              rows={3}
              className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={loading}
            />
            <p className="mt-1 text-xs text-gray-500">This text scrolls in the Welcome bar at the top of the display board.</p>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900 border-b pb-2 flex items-center gap-2">
            <span className="text-red-600">⚠</span> Emergency Notice
          </h2>
          <p className="text-sm text-gray-600">
            To post an emergency notice on the display board, go to{" "}
            <a href="/admin/right-sidebar-notice" className="text-blue-600 underline font-medium">
              Update Notice → Add Notice
            </a>{" "}
            and include the word <code className="bg-gray-100 px-1 rounded text-red-600 font-mono text-xs">emergency</code> or start with{" "}
            <code className="bg-gray-100 px-1 rounded text-red-600 font-mono text-xs">⚠</code> in the title. The ticker bar will automatically flash red and show it as an emergency.
          </p>
          <div className="rounded-lg border border-red-100 bg-red-50 p-3 text-sm text-red-700">
            <p className="font-semibold">Example:</p>
            <p className="mt-1 font-mono text-xs">⚠ Class suspended today due to exam</p>
            <p className="mt-1 font-mono text-xs">emergency: Lab closed for maintenance</p>
          </div>
        </section>

        <div className="flex flex-wrap gap-3 pt-2">
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-5 py-2 rounded font-medium"
          >
            {loading ? "Saving..." : "Save Settings"}
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={loading}
            className="border border-red-300 text-red-600 hover:bg-red-50 disabled:opacity-50 px-5 py-2 rounded font-medium"
          >
            Reset to Default
          </button>
        </div>
      </form>
    </div>
  );
}
