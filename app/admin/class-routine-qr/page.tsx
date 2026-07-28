"use client";

import { useState, useEffect } from "react";
import FileUpload from "@/app/components/FileUpload";
import AdminPageHeader from "@/app/components/admin-panel/AdminPageHeader";
import AdminFlashMessage from "@/app/components/admin-panel/AdminFlashMessage";
import { AdminFormCard } from "@/app/components/admin-panel/AdminCard";
import { fetchJson } from "@/app/lib/fetch-json";
import Image from "next/image";

type QrData = {
  id: string | null;
  title: string;
  qrCodeUrl: string | null;
  fileUrl: string | null;
  published: boolean;
};

export default function AdminClassRoutineQrPage() {
  const [data, setData]       = useState<QrData>({ id: null, title: "Class Routine", qrCodeUrl: null, fileUrl: null, published: true });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);
  const [regen, setRegen]     = useState(false);
  const [editing, setEditing] = useState(false);
  const [formKey, setFormKey] = useState(0);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [fileUrl,   setFileUrl]   = useState<string | null>(null);
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);

  useEffect(() => { fetchData(); }, []);

  async function fetchData() {
    try {
      const result = await fetchJson<{ success: boolean; data: QrData | null }>("/api/class-routine-qr?all=1");
      if (result.success && result.data) {
        setData(result.data);
        setFileUrl(result.data.fileUrl);
        setQrCodeUrl(result.data.qrCodeUrl);
      }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }

  // Clear the preview QR when a new file is picked — server generates the real one on save.
  function handleFileChange(url: string) {
    setFileUrl(url);
    setQrCodeUrl(null);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!fileUrl) { setMessage({ type: "error", text: "Please upload a file first." }); return; }
    setSaving(true);
    setMessage(null);

    const fd = new FormData(e.currentTarget);
    const payload = {
      title: fd.get("title")?.toString().trim() || "Class Routine",
      fileUrl,
      published: fd.get("published") === "on" || fd.get("published") === "true",
    };

    try {
      const result = await fetchJson<{ success: boolean; message?: string; qrCodeUrl?: string | null }>(
        "/api/class-routine-qr",
        {
          method: data.id ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data.id ? { ...payload, id: data.id } : payload),
        },
      );
      if (result.success) {
        if (result.qrCodeUrl) setQrCodeUrl(result.qrCodeUrl);
        setMessage({ type: "success", text: "Saved! QR is ready on the display board." });
        setEditing(false);
        setFormKey((k) => k + 1);
        fetchData();
        setTimeout(() => setMessage(null), 4000);
      } else {
        setMessage({ type: "error", text: result.message || "Failed to save" });
      }
    } catch {
      setMessage({ type: "error", text: "Network error" });
    } finally {
      setSaving(false);
    }
  }

  // Regenerate QR from stored fileUrl using current publicSiteUrl — no re-upload needed.
  async function handleRegenerate() {
    if (!data.id) return;
    setRegen(true);
    setMessage(null);
    try {
      const result = await fetchJson<{ success: boolean; message?: string; qrCodeUrl?: string | null }>(
        "/api/class-routine-qr",
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: data.id }),
        },
      );
      if (result.success) {
        if (result.qrCodeUrl) setQrCodeUrl(result.qrCodeUrl);
        setMessage({ type: "success", text: "QR regenerated! It now uses the current Public Site URL." });
        fetchData();
        setTimeout(() => setMessage(null), 4000);
      } else {
        setMessage({ type: "error", text: result.message || "Regeneration failed" });
      }
    } catch {
      setMessage({ type: "error", text: "Network error" });
    } finally {
      setRegen(false);
    }
  }

  if (loading) return <p className="text-gray-500">Loading...</p>;

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Class Routine QR"
        subtitle="Upload the routine file — QR code is generated server-side with the correct public URL so phones can scan it."
      />
      {message && <AdminFlashMessage type={message.type} text={message.text} />}

      {/* Preview card */}
      {data.id && !editing && (
        <div className="rounded-xl border border-blue-200 bg-blue-50 p-5">
          <div className="flex flex-wrap items-start gap-6">
            {/* QR image */}
            {qrCodeUrl ? (
              <div className="relative h-32 w-32 flex-shrink-0 overflow-hidden rounded-lg border bg-white p-1 shadow">
                <Image src={qrCodeUrl} alt="Class Routine QR" fill className="object-contain" unoptimized />
              </div>
            ) : (
              <div className="flex h-32 w-32 flex-shrink-0 items-center justify-center rounded-lg border bg-white text-center text-xs text-gray-400 p-2">
                No QR yet
              </div>
            )}

            {/* Info */}
            <div className="flex-1 space-y-1 min-w-0">
              <p className="text-lg font-semibold text-gray-900">{data.title}</p>
              {data.fileUrl && (
                <a href={data.fileUrl} target="_blank" rel="noreferrer" className="text-sm text-blue-600 underline">
                  View Routine File ↗
                </a>
              )}
              <p className="text-sm text-gray-500">
                Status:{" "}
                {data.published
                  ? <span className="font-medium text-green-600">Published</span>
                  : <span className="text-red-500">Draft</span>}
              </p>
              {/* Regenerate hint */}
              <p className="text-xs text-slate-400 pt-1">
                If the QR doesn&apos;t open on your phone, click &quot;Regenerate QR&quot; after setting the correct Public Site URL in Settings.
              </p>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-2">
              <button
                onClick={() => { setEditing(true); setFormKey((k) => k + 1); }}
                className="rounded-lg border border-blue-300 bg-white px-4 py-2 text-sm font-medium text-blue-700 hover:bg-blue-50 transition"
              >
                Edit
              </button>
              <button
                onClick={handleRegenerate}
                disabled={regen || !data.fileUrl}
                className="rounded-lg border border-teal-300 bg-white px-4 py-2 text-sm font-medium text-teal-700 hover:bg-teal-50 disabled:opacity-50 transition"
                title="Regenerate QR using the current Public Site URL from Settings"
              >
                {regen ? "Regenerating…" : "🔄 Regenerate QR"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Form */}
      {(!data.id || editing) && (
        <AdminFormCard title={data.id ? "Update Class Routine" : "Setup Class Routine"}>
          <form key={formKey} onSubmit={handleSubmit} className="max-w-lg space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Title</label>
              <input
                name="title"
                defaultValue={data.title}
                className="w-full rounded border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-500 focus:outline-none"
                disabled={saving}
              />
            </div>

            <div className="rounded-lg border-2 border-blue-200 bg-blue-50 p-4 space-y-3">
              <p className="text-sm font-semibold text-blue-800">Upload Routine File — QR is generated server-side on save</p>
              <FileUpload
                name="fileUrl"
                label="Routine File (PDF or Image)"
                currentFile={editing ? data.fileUrl : null}
                accept="image/*,.pdf"
                onFileChange={handleFileChange}
              />
              {qrCodeUrl && (
                <div className="flex items-center gap-4 rounded-lg border border-green-200 bg-green-50 p-3">
                  <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded border bg-white shadow">
                    <Image src={qrCodeUrl} alt="QR Preview" fill className="object-contain p-1" unoptimized />
                  </div>
                  <div className="text-sm space-y-1">
                    <p className="font-bold text-green-700">✓ QR ready — scannable from phone!</p>
                    <p className="text-xs text-slate-500">Uses the Public Site URL from Settings.</p>
                    <a href={qrCodeUrl} target="_blank" rel="noreferrer" className="text-xs text-blue-600 underline">
                      Open full size ↗
                    </a>
                  </div>
                </div>
              )}
              {!qrCodeUrl && fileUrl && (
                <p className="text-xs text-slate-500">QR will be generated when you click Save.</p>
              )}
            </div>

            <div className="flex items-center gap-2">
              <input id="pub-crqr" name="published" type="checkbox" defaultChecked={data.published} disabled={saving} />
              <label htmlFor="pub-crqr" className="text-sm text-gray-700">Published (show on display board)</label>
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                disabled={saving || !fileUrl}
                className="rounded bg-blue-600 px-5 py-2 font-medium text-white hover:bg-blue-700 disabled:bg-gray-400"
              >
                {saving ? "Saving..." : data.id ? "Update" : "Save & Publish"}
              </button>
              {editing && (
                <button type="button" onClick={() => setEditing(false)} className="rounded border px-4 py-2 text-sm text-gray-700">
                  Cancel
                </button>
              )}
            </div>
          </form>
        </AdminFormCard>
      )}
    </div>
  );
}
