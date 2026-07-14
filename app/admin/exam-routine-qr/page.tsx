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

function buildQrUrl(fileUrl: string): string {
  if (fileUrl.startsWith("http://") || fileUrl.startsWith("https://")) {
    return `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(fileUrl.trim())}`;
  }
  const base = typeof window !== "undefined"
    ? `${window.location.protocol}//${window.location.host}`
    : "";
  const fullUrl = base + fileUrl;
  return `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(fullUrl.trim())}`;
}

export default function AdminExamRoutineQrPage() {
  const [data, setData]       = useState<QrData>({ id: null, title: "Exam Routine", qrCodeUrl: null, fileUrl: null, published: true });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);
  const [editing, setEditing] = useState(false);
  const [formKey, setFormKey] = useState(0);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [fileUrl,   setFileUrl]   = useState<string | null>(null);
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);

  useEffect(() => { fetchData(); }, []);

  async function fetchData() {
    try {
      const result = await fetchJson<{ success: boolean; data: QrData | null }>("/api/exam-routine-qr?all=1");
      if (result.success && result.data) {
        setData(result.data as QrData);
        setFileUrl(result.data.fileUrl);
        setQrCodeUrl(result.data.qrCodeUrl);
      }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }

  function handleFileChange(url: string) {
    setFileUrl(url);
    if (url) setQrCodeUrl(buildQrUrl(url));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!fileUrl) { setMessage({ type: "error", text: "Please upload a file first." }); return; }
    setSaving(true); setMessage(null);

    const fd = new FormData(e.currentTarget);
    const payload = {
      title: fd.get("title")?.toString().trim() || "Exam Routine",
      qrCodeUrl: qrCodeUrl || null,
      fileUrl: fileUrl || null,
      published: fd.get("published") === "on" || fd.get("published") === "true",
    };

    try {
      const result = await fetchJson<{ success: boolean; message?: string }>("/api/exam-routine-qr", {
        method: data.id ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data.id ? { ...payload, id: data.id } : payload),
      });
      if (result.success) {
        setMessage({ type: "success", text: "Saved! QR is ready on the display board." });
        setEditing(false); setFormKey((k) => k + 1); fetchData();
        setTimeout(() => setMessage(null), 3000);
      } else { setMessage({ type: "error", text: result.message || "Failed to save" }); }
    } catch { setMessage({ type: "error", text: "Network error" }); }
    finally { setSaving(false); }
  }

  if (loading) return <p className="text-gray-500">Loading...</p>;

  return (
    <div className="space-y-6">
      <AdminPageHeader title="Exam Routine QR" subtitle="Upload the exam schedule — QR code is generated automatically. Students scan to view." />
      {message && <AdminFlashMessage type={message.type} text={message.text} />}

      {data.id && !editing && (
        <div className="rounded-xl border border-blue-200 bg-blue-50 p-5">
          <div className="flex flex-wrap items-start gap-6">
            {data.qrCodeUrl ? (
              <div className="relative h-32 w-32 overflow-hidden rounded border bg-white p-1 shadow">
                <Image src={data.qrCodeUrl} alt="Exam Routine QR" fill className="object-contain" unoptimized />
              </div>
            ) : (
              <div className="flex h-32 w-32 items-center justify-center rounded border bg-white text-xs text-gray-400 text-center p-2">No QR yet</div>
            )}
            <div className="flex-1 space-y-1">
              <p className="text-lg font-semibold text-gray-900">{data.title}</p>
              {data.fileUrl && <a href={data.fileUrl} target="_blank" rel="noreferrer" className="text-sm text-blue-600 underline">View Exam File ↗</a>}
              <p className="text-sm text-gray-500">Status: {data.published ? <span className="text-green-600 font-medium">Published</span> : <span className="text-red-500">Draft</span>}</p>
            </div>
            <button onClick={() => { setEditing(true); setFormKey((k) => k + 1); }}
              className="rounded border border-blue-300 bg-white px-4 py-2 text-sm font-medium text-blue-700 hover:bg-blue-50">Edit</button>
          </div>
        </div>
      )}

      {(!data.id || editing) && (
        <AdminFormCard title={data.id ? "Update Exam Routine" : "Setup Exam Routine"}>
          <form key={formKey} onSubmit={handleSubmit} className="max-w-lg space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Title</label>
              <input name="title" defaultValue={data.title}
                className="w-full rounded border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-500 focus:outline-none" disabled={saving} />
            </div>
            <div className="rounded-lg border-2 border-blue-200 bg-blue-50 p-4 space-y-3">
              <p className="text-sm font-semibold text-blue-800">Upload Exam Routine File, QR generates automatically</p>
              <FileUpload name="fileUrl" label="Exam Routine File (PDF or Image)"
                currentFile={editing ? data.fileUrl : null} accept="image/*,.pdf" onFileChange={handleFileChange} />
              {qrCodeUrl && (
                <div className="flex items-center gap-4 rounded-lg border border-green-200 bg-green-50 p-3">
                  <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded border bg-white shadow">
                    <Image src={qrCodeUrl} alt="QR Preview" fill className="object-contain p-1" unoptimized />
                  </div>
                  <div className="text-sm space-y-1">
                    <p className="font-bold text-green-700">✓ QR generated automatically!</p>
                    <p className="text-xs text-slate-500">Scan to verify before saving.</p>
                    <a href={qrCodeUrl} target="_blank" rel="noreferrer" className="text-xs text-blue-600 underline">Open full size ↗</a>
                  </div>
                </div>
              )}
            </div>
            <div className="flex items-center gap-2">
              <input id="pub-erqr" name="published" type="checkbox" defaultChecked={data.published} disabled={saving} />
              <label htmlFor="pub-erqr" className="text-sm text-gray-700">Published (show on display board)</label>
            </div>
            <div className="flex gap-2">
              <button type="submit" disabled={saving || !fileUrl}
                className="rounded bg-blue-600 px-5 py-2 font-medium text-white hover:bg-blue-700 disabled:bg-gray-400">
                {saving ? "Saving..." : data.id ? "Update" : "Save & Publish"}
              </button>
              {editing && <button type="button" onClick={() => setEditing(false)} className="rounded border px-4 py-2 text-sm">Cancel</button>}
            </div>
          </form>
        </AdminFormCard>
      )}
    </div>
  );
}
