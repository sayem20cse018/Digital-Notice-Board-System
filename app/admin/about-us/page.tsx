"use client";

import { useState, useEffect } from "react";
import ImageUpload from "@/app/components/ImageUpload";
import AdminPageHeader from "@/app/components/admin-panel/AdminPageHeader";
import AdminFlashMessage from "@/app/components/admin-panel/AdminFlashMessage";
import { AdminFormCard } from "@/app/components/admin-panel/AdminCard";
import { fetchJson } from "@/app/lib/fetch-json";
// about us
type AboutData = {
  id: string | null;
  heading: string;
  body: string;
  imageUrl: string | null;
  published: boolean;
};

export default function AdminAboutUsPage() {
  const [data, setData] = useState<AboutData>({
    id: null,
    heading: "About Our Department",
    body: "",
    imageUrl: null,
    published: true,
  });
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);
  const [editing, setEditing]   = useState(false);
  const [formKey, setFormKey]   = useState(0);
  const [message, setMessage]   = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [bodyText, setBodyText] = useState("");
  const [heading, setHeading]   = useState("About Our Department");

  useEffect(() => { fetchData(); }, []);

  async function fetchData() {
    try {
      const result = await fetchJson<{ success: boolean; data: AboutData | null }>("/api/about-us?all=1");
      if (result.success && result.data) {
        const d = result.data as AboutData;
        setData(d);
        setHeading(d.heading || "About Our Department");
        setBodyText(d.body || "");
        setImageUrl(d.imageUrl ?? null);
      }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!bodyText.trim()) {
      setMessage({ type: "error", text: "Body text is required." });
      return;
    }
    setSaving(true);
    setMessage(null);

    const payload = {
      heading: heading.trim() || "About Our Department",
      body: bodyText.trim(),
      imageUrl: imageUrl || null,
      published: true,
    };

    try {
      const result = await fetchJson<{ success: boolean; message?: string }>("/api/about-us", {
        method: data.id ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data.id ? { ...payload, id: data.id } : payload),
      });

      if (result.success) {
        setMessage({ type: "success", text: result.message || "Saved!" });
        setEditing(false);
        setFormKey((k) => k + 1);
        fetchData();
        setTimeout(() => setMessage(null), 3000);
      } else {
        setMessage({ type: "error", text: result.message || "Failed to save" });
      }
    } catch {
      setMessage({ type: "error", text: "Network error" });
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p className="text-gray-500 p-4">Loading...</p>;

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="About Us"
        subtitle="This text is shown on the display board beside Department Achievers and Programming Stars."
      />

      {message && <AdminFlashMessage type={message.type} text={message.text} />}

      {/* Preview — when saved and not editing */}
      {data.id && !editing && (
        <div className="rounded-xl border border-blue-200 bg-blue-50 p-5 space-y-3">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <h2 className="text-lg font-bold text-slate-900">{data.heading}</h2>
              <p className="mt-2 text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{data.body}</p>
            </div>
            {data.imageUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={data.imageUrl} alt="About" className="h-24 w-24 flex-shrink-0 rounded-lg object-cover border" />
            )}
          </div>
          <button
            onClick={() => { setEditing(true); setFormKey((k) => k + 1); }}
            className="rounded border border-blue-400 bg-white px-4 py-2 text-sm font-medium text-blue-700 hover:bg-blue-50"
          >
            Edit
          </button>
        </div>
      )}

      {(!data.id || editing) && (
        <AdminFormCard title={data.id ? "Edit About Us" : "Create About Us"}>
          <form key={formKey} onSubmit={handleSubmit} className="space-y-4 max-w-2xl">

            {/* Heading */}
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Heading</label>
              <input
                value={heading}
                onChange={(e) => setHeading(e.target.value)}
                placeholder="About Our Department"
                className="w-full rounded border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-500 focus:outline-none"
                disabled={saving}
              />
            </div>

            {/* Body */}
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Content <span className="text-red-500">*</span>
              </label>
              <textarea
                value={bodyText}
                onChange={(e) => setBodyText(e.target.value)}
                rows={8}
                placeholder={`Write about your department here...\n\nExample:\nThe Department of Computer Science & Engineering was established in 2010. We offer B.Sc. Engineering in CSE.\n\nOur mission is to produce quality engineers...`}
                className="w-full rounded border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-500 focus:outline-none leading-relaxed"
                disabled={saving}
              />
              <p className="mt-1 text-xs text-gray-500">
                {bodyText.length} characters · Line breaks are preserved on the display board.
              </p>
            </div>

            {/* Image */}
            <ImageUpload
              name="imageUrl"
              label="Department Image (optional — shown beside the text)"
              currentImage={imageUrl}
              onImageChange={(url) => setImageUrl(url || null)}
            />

            <div className="flex gap-2 pt-2">
              <button
                type="submit"
                disabled={saving || !bodyText.trim()}
                className="rounded bg-blue-600 px-6 py-2 font-medium text-white hover:bg-blue-700 disabled:bg-gray-400"
              >
                {saving ? "Saving..." : data.id ? "Update" : "Save & Publish"}
              </button>
              {editing && (
                <button
                  type="button"
                  onClick={() => setEditing(false)}
                  className="rounded border px-4 py-2 text-sm text-gray-600"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </AdminFormCard>
      )}

      <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-600">
        <p className="font-semibold mb-1">How it appears on the display board:</p>
        <p>The About Us text is shown as a card in the top-right panel of the display board, beside the Department Achievers and Programming Stars cards.</p>
      </div>
    </div>
  );
}
