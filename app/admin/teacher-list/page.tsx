"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import AdminPageHeader from "@/app/components/admin-panel/AdminPageHeader";
import AdminFlashMessage from "@/app/components/admin-panel/AdminFlashMessage";
import FileUpload from "@/app/components/FileUpload";
import { fetchJson } from "@/app/lib/fetch-json";

type TeacherListData = {
  id: string | null;
  title: string;
  fileUrl: string | null;
  qrCodeUrl: string | null;
  published: boolean;
};

export default function AdminTeacherListPage() {
  const [data, setData]     = useState<TeacherListData>({ id: null, title: "Teacher List", fileUrl: null, qrCodeUrl: null, published: true });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);
  const [editing, setEditing] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => { fetchData(); }, []);

  async function fetchData() {
    try {
      const result = await fetchJson<{ success: boolean; data: TeacherListData }>("/api/teacher-list");
      if (result.success) setData(result.data);
    } catch (error) { console.error(error); }
    finally { setLoading(false); }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    const fd = new FormData(e.currentTarget);
    const payload = {
      title:     fd.get("title")?.toString().trim() || "Teacher List",
      fileUrl:   fd.get("fileUrl")?.toString().trim() || "",
      published: fd.get("published") === "on" || fd.get("published") === "true",
    };

    if (!payload.fileUrl) {
      setMessage({ type: "error", text: "Please upload a file." });
      setSaving(false);
      return;
    }

    try {
      const result = await fetchJson<{ success: boolean; message?: string }>("/api/teacher-list", {
        method: data.id ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data.id ? { ...payload, id: data.id } : payload),
      });

      if (result.success) {
        setMessage({ type: "success", text: result.message || "Saved! QR generated." });
        setEditing(false);
        fetchData();
        setTimeout(() => setMessage(null), 3000);
      } else {
        setMessage({ type: "error", text: result.message || "Save failed" });
      }
    } catch {
      setMessage({ type: "error", text: "Network error" });
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p className="text-gray-600">Loading...</p>;

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Department Teachers (QR)"
        subtitle="Upload teacher list PDF or image. Students scan the QR code to view directly — no password needed."
      />

      {message && <AdminFlashMessage type={message.type} text={message.text} />}

      <div className="rounded-xl border border-blue-200 bg-blue-50/50 p-6">
        {/* Preview */}
        {data.id && data.qrCodeUrl && !editing && (
          <div className="mb-6 flex flex-wrap items-start gap-6">
            <div className="relative h-36 w-36 overflow-hidden rounded-lg border bg-white p-1 shadow-md">
              <Image src={data.qrCodeUrl} alt="Teacher List QR" fill className="object-contain" unoptimized />
            </div>
            <div className="flex-1 space-y-2">
              <p className="text-lg font-semibold text-gray-900">{data.title}</p>
              {data.fileUrl && (
                <a href={data.fileUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-sm text-blue-600 underline">
                  View file ↗
                </a>
              )}
              <p className="text-sm text-gray-500">
                Status:{" "}
                {data.published
                  ? <span className="font-medium text-green-600">Published — scan QR to view directly</span>
                  : <span className="text-red-500">Draft (not visible on display board)</span>}
              </p>
              <button
                type="button"
                onClick={() => setEditing(true)}
                className="rounded border border-blue-300 bg-white px-4 py-1.5 text-sm text-blue-700 hover:bg-blue-50"
              >
                Edit / Replace
              </button>
            </div>
          </div>
        )}

        {/* Form */}
        {(!data.id || editing) && (
          <form onSubmit={handleSubmit} className="max-w-lg space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Title</label>
              <input
                name="title"
                defaultValue={data.title}
                placeholder="e.g. Department Teachers"
                className="w-full rounded border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-500 focus:outline-none"
                disabled={saving}
              />
            </div>

            <FileUpload
              name="fileUrl"
              label="Teacher List File (PDF or Image)"
              currentFile={data.fileUrl}
              accept="image/*,.pdf"
            />

            <div className="rounded-lg border border-blue-100 bg-blue-50 p-3 text-sm text-blue-700">
              No password required — students scan QR and see the file directly.
            </div>

            <label className="flex items-center gap-2 text-sm">
              <input name="published" type="checkbox" defaultChecked={data.published} disabled={saving} />
              Published (show on display board)
            </label>

            <div className="flex gap-2">
              <button
                type="submit"
                disabled={saving}
                className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:bg-gray-400"
              >
                {saving ? "Saving..." : data.id ? "Update & Regenerate QR" : "Save & Generate QR"}
              </button>
              {editing && (
                <button type="button" onClick={() => setEditing(false)} className="rounded border px-4 py-2 text-sm">
                  Cancel
                </button>
              )}
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
