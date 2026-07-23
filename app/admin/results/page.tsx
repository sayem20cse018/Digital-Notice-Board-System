"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import AdminPageHeader from "@/app/components/admin-panel/AdminPageHeader";
import AdminFlashMessage from "@/app/components/admin-panel/AdminFlashMessage";
import FileUpload from "@/app/components/FileUpload";
import { fetchJson } from "@/app/lib/fetch-json";

type Slot = {
  id: string | null;
  slotNumber: number;
  title: string;
  fileUrl: string | null;
  qrCodeUrl: string | null;
  published: boolean;
};

const SLOT_LABELS = ["Session 1", "Session 2", "Session 3", "Session 4"];

/** Master QR encodes /view/results — fetched from server to get correct public URL */
function buildMasterQrUrl(): string {
  const base = typeof window !== "undefined"
    ? `${window.location.protocol}//${window.location.host}`
    : "";
  const url = `${base}/view/results`;
  return `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(url)}`;
}

export default function AdminResultsPage() {
  const [slots, setSlots]     = useState<Slot[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState<number | null>(null);
  const [editing, setEditing] = useState<number | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [masterQr, setMasterQr] = useState<string | null>(null);
  const [masterQrUrl, setMasterQrUrl] = useState<string | null>(null);

  useEffect(() => {
    fetchSlots();
    // Fetch the correct public URL from server to avoid localhost in QR
    fetchJson<{ success: boolean; data?: { url: string; qrCodeUrl: string } }>("/api/master-qr")
      .then((r) => {
        if (r.success && r.data) {
          setMasterQr(r.data.qrCodeUrl);
          setMasterQrUrl(r.data.url);
        } else {
          // Fallback to client-side build
          setMasterQr(buildMasterQrUrl());
          setMasterQrUrl(`${window.location.protocol}//${window.location.host}/view/results`);
        }
      })
      .catch(() => {
        setMasterQr(buildMasterQrUrl());
        setMasterQrUrl(`${window.location.protocol}//${window.location.host}/view/results`);
      });
  }, []);

  async function fetchSlots() {
    try {
      const result = await fetchJson<{ success: boolean; data: Slot[] }>("/api/secure-results");
      if (result.success) setSlots(result.data);
    } catch (error) { console.error(error); }
    finally { setLoading(false); }
  }

  async function handleSave(slotNumber: number, form: HTMLFormElement, isEdit: boolean) {
    setSaving(slotNumber);
    setMessage(null);

    const fd = new FormData(form);
    const payload = {
      slotNumber,
      title:     fd.get("title")?.toString().trim() || "",
      fileUrl:   fd.get("fileUrl")?.toString().trim() || "",
      password:  fd.get("password")?.toString().trim() || "",
      published: fd.get("published") === "on" || fd.get("published") === "true",
    };

    const slot = slots.find((s) => s.slotNumber === slotNumber);

    try {
      const result = await fetchJson<{ success: boolean; message?: string }>("/api/secure-results", {
        method: isEdit && slot?.id ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          isEdit && slot?.id
            ? { ...payload, id: slot.id, password: payload.password || undefined }
            : payload,
        ),
      });

      if (result.success) {
        setMessage({ type: "success", text: result.message || "Saved!" });
        setEditing(null);
        fetchSlots();
        setTimeout(() => setMessage(null), 3000);
      } else {
        setMessage({ type: "error", text: result.message || "Save failed" });
      }
    } catch {
      setMessage({ type: "error", text: "Network error" });
    } finally {
      setSaving(null);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this result slot?")) return;
    await fetchJson(`/api/secure-results?id=${id}`, { method: "DELETE" });
    fetchSlots();
  }

  if (loading) return <p className="text-gray-600">Loading...</p>;

  const publishedCount = slots.filter((s) => s.id && s.published).length;

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Results (QR Protected)"
        subtitle="One master QR shows all sessions. Students scan → select session → enter password → view result."
      />

      {message && <AdminFlashMessage type={message.type} text={message.text} />}

      {/* Master QR */}
      <div className="rounded-xl border-2 border-blue-300 bg-gradient-to-r from-blue-50 to-indigo-50 p-5">
        <h2 className="mb-3 text-lg font-bold text-blue-900">Master QR Code</h2>
        <div className="flex flex-wrap items-center gap-6">
          {masterQr && (
            <div className="relative h-36 w-36 overflow-hidden rounded-xl border-2 border-blue-200 bg-white p-1 shadow-md flex-shrink-0">
              <Image src={masterQr} alt="Master Result QR" fill className="object-contain" unoptimized />
            </div>
          )}
          <div className="flex-1 space-y-2">
            <p className="text-sm font-semibold text-blue-800">
              This QR encodes: <code className="rounded bg-blue-100 px-2 py-0.5 text-xs">/view/results</code>
            </p>
            <p className="text-sm text-slate-600">
              Students scan this one QR → see all published sessions → select session → enter password → view result.
            </p>
            <p className="text-sm text-slate-600">
              Currently <strong>{publishedCount}</strong> session{publishedCount !== 1 ? "s" : ""} published.
            </p>
            <div className="flex gap-3">
              <a
                href="/view/results"
                target="_blank"
                rel="noreferrer"
                className="rounded-lg border border-blue-300 bg-white px-4 py-1.5 text-sm font-medium text-blue-700 hover:bg-blue-50"
              >
                Preview page ↗
              </a>
              {masterQr && (
                <a
                  href={masterQr}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-lg border border-blue-300 bg-white px-4 py-1.5 text-sm font-medium text-blue-700 hover:bg-blue-50"
                >
                  Download QR ↗
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Session slots */}
      <div>
        <h2 className="mb-3 text-lg font-bold text-slate-900">Sessions (4 slots)</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {slots.map((slot, idx) => {
            const isEditing = editing === slot.slotNumber;
            const hasData   = Boolean(slot.id);

            return (
              <div key={slot.slotNumber}
                className={`rounded-xl border-2 p-4 ${hasData && slot.published ? "border-green-300 bg-green-50/50" : hasData ? "border-orange-200 bg-orange-50/30" : "border-slate-200 bg-slate-50"}`}>

                <div className="mb-3 flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-slate-900">{SLOT_LABELS[idx]}</h3>
                    {hasData && (
                      <p className={`text-xs mt-0.5 ${slot.published ? "text-green-600" : "text-orange-500"}`}>
                        {slot.published ? "● Published" : "○ Draft"}
                      </p>
                    )}
                    {!hasData && <p className="text-xs text-slate-400 mt-0.5">Empty — add content</p>}
                  </div>
                  {hasData && (
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setEditing(isEditing ? null : slot.slotNumber)}
                        className="rounded border border-blue-300 bg-white px-2.5 py-1 text-xs text-blue-700 hover:bg-blue-50"
                      >
                        {isEditing ? "Cancel" : "Edit"}
                      </button>
                      <button
                        type="button"
                        onClick={() => slot.id && handleDelete(slot.id)}
                        className="rounded border border-red-200 bg-white px-2.5 py-1 text-xs text-red-600 hover:bg-red-50"
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>

                {hasData && !isEditing && (
                  <div className="flex items-center gap-3">
                    <p className="font-medium text-slate-800 text-sm">{slot.title}</p>
                    {slot.fileUrl && (
                      <a href={slot.fileUrl} target="_blank" rel="noreferrer"
                        className="text-xs text-blue-600 underline">View file ↗</a>
                    )}
                  </div>
                )}

                {(!hasData || isEditing) && (
                  <form
                    onSubmit={(e) => { e.preventDefault(); handleSave(slot.slotNumber, e.currentTarget, hasData); }}
                    className="space-y-2.5"
                  >
                    <input
                      name="title"
                      defaultValue={slot.title}
                      placeholder="Session name (e.g. BSc 2020 Result)"
                      required
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none"
                    />
                    <FileUpload
                      name="fileUrl"
                      label="Result File (PDF or Image)"
                      currentFile={slot.fileUrl}
                      accept="image/*,.pdf"
                    />
                    <input
                      name="password"
                      type="password"
                      placeholder={hasData ? "New password (leave blank to keep current)" : "Set password for this session"}
                      required={!hasData}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none"
                    />
                    <label className="flex items-center gap-2 text-sm text-gray-700">
                      <input name="published" type="checkbox" defaultChecked={slot.published || !hasData} />
                      Published (visible to students)
                    </label>
                    <button
                      type="submit"
                      disabled={saving === slot.slotNumber}
                      className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:bg-gray-400"
                    >
                      {saving === slot.slotNumber ? "Saving..." : hasData ? "Update Session" : "Add Session"}
                    </button>
                  </form>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
