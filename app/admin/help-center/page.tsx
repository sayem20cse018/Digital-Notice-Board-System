"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import FileUpload from "@/app/components/FileUpload";
import AdminPageHeader from "@/app/components/admin-panel/AdminPageHeader";
import AdminFlashMessage from "@/app/components/admin-panel/AdminFlashMessage";
import { fetchJson } from "@/app/lib/fetch-json";

type HelpItem = {
  id: string | null;
  officeName: string;
  phoneNumber: string;
  qrCodeUrl?: string | null;
  fileUrl?: string | null;
  contactType: "office" | "crs";
  displayOrder: number;
  published: boolean;
};

const SLOTS: { type: "office" | "crs"; label: string; subtitle: string }[] = [
  { type: "office", label: "Office", subtitle: "Upload office info file — students scan QR to view" },
  { type: "crs", label: "CRS", subtitle: "Upload CRS info file — students scan QR to view" },
];

function buildQrUrl(fileUrl: string): string {
  if (fileUrl.startsWith("http://") || fileUrl.startsWith("https://")) {
    return `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(fileUrl.trim())}`;
  }
  const base = typeof window !== "undefined"
    ? `${window.location.protocol}//${window.location.host}`
    : "";
  return `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent((base + fileUrl).trim())}`;
}

export default function AdminHelpCenterPage() {
  const [items, setItems]     = useState<HelpItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingType, setSavingType] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // per-slot state
  const [phones,    setPhones]    = useState<Record<string, string>>({});
  const [fileUrls,  setFileUrls]  = useState<Record<string, string>>({});
  const [qrUrls,    setQrUrls]    = useState<Record<string, string>>({});

  useEffect(() => { fetchItems(); }, []);

  async function fetchItems() {
    try {
      const result = await fetchJson<{ success: boolean; data: HelpItem[] }>("/api/help-center");
      if (result.success) {
        setItems(result.data);
        const ph: Record<string, string> = {};
        const fu: Record<string, string> = {};
        const qu: Record<string, string> = {};
        for (const item of result.data) {
          ph[item.contactType] = item.phoneNumber || "";
          fu[item.contactType] = item.fileUrl || "";
          qu[item.contactType] = item.qrCodeUrl || "";
        }
        setPhones(ph);
        setFileUrls(fu);
        setQrUrls(qu);
      }
    } catch (error) { console.error(error); }
    finally { setLoading(false); }
  }

  function handleFileChange(type: string, url: string) {
    setFileUrls((prev) => ({ ...prev, [type]: url }));
    if (url) setQrUrls((prev) => ({ ...prev, [type]: buildQrUrl(url) }));
  }

  async function saveSlot(type: "office" | "crs", label: string) {
    setSavingType(type);
    setMessage(null);
    const existing = items.find((i) => i.contactType === type);
    const payload = {
      officeName:   label,
      phoneNumber:  phones[type] || "",
      fileUrl:      fileUrls[type] || null,
      qrCodeUrl:    qrUrls[type] || null,
      contactType:  type,
      displayOrder: type === "office" ? 0 : 1,
      published:    true,
      ...(existing?.id ? { id: existing.id } : {}),
    };
    try {
      const result = await fetchJson("/api/help-center", {
        method: existing?.id ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (result.success) {
        setMessage({ type: "success", text: `${label} saved!` });
        fetchItems();
        setTimeout(() => setMessage(null), 2500);
      } else {
        setMessage({ type: "error", text: String(result.message || "Failed") });
      }
    } catch { setMessage({ type: "error", text: "Network error" }); }
    finally { setSavingType(null); }
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Help Center"
        subtitle="Upload a file or image for Office and CRS. QR generates automatically — students scan to view directly."
      />
      {message && <AdminFlashMessage type={message.type} text={message.text} />}

      {loading ? <p className="text-gray-600">Loading...</p> : (
        <div className="grid gap-6 md:grid-cols-2">
          {SLOTS.map((slot) => (
            <section key={slot.type} className="rounded-xl border bg-white p-5 shadow-sm space-y-4">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">{slot.label}</h2>
                <p className="text-sm text-slate-500">{slot.subtitle}</p>
              </div>

              {/* Phone number (optional) */}
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Phone / Contact (optional)</label>
                <input
                  value={phones[slot.type] || ""}
                  onChange={(e) => setPhones((prev) => ({ ...prev, [slot.type]: e.target.value }))}
                  placeholder="e.g. 01XXXXXXXXX"
                  className="w-full rounded border border-gray-300 px-3 py-2 text-gray-900"
                />
              </div>

              {/* File upload → auto QR */}
              <div className="rounded-lg border-2 border-blue-200 bg-blue-50 p-4 space-y-3">
                <p className="text-sm font-semibold text-blue-800">Upload File — QR generates automatically</p>
                <FileUpload
                  name={`file-${slot.type}`}
                  label="File (PDF or Image)"
                  currentFile={fileUrls[slot.type] || null}
                  accept="image/*,.pdf"
                  onFileChange={(url) => handleFileChange(slot.type, url)}
                />
                {qrUrls[slot.type] && (
                  <div className="flex items-center gap-4 rounded-lg border border-green-200 bg-green-50 p-3">
                    <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-lg border bg-white shadow">
                      <Image src={qrUrls[slot.type]} alt="QR" fill className="object-contain p-1" unoptimized />
                    </div>
                    <div className="text-xs space-y-1">
                      <p className="font-bold text-green-700">✓ QR ready</p>
                      <p className="text-slate-500">Scan to verify before saving.</p>
                      <a href={qrUrls[slot.type]} target="_blank" rel="noreferrer" className="text-blue-600 underline">Open full size ↗</a>
                    </div>
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={() => saveSlot(slot.type, slot.label)}
                disabled={savingType === slot.type}
                className="w-full rounded-lg bg-[#1e3a8a] px-4 py-2.5 font-medium text-white hover:bg-blue-800 disabled:bg-gray-400"
              >
                {savingType === slot.type ? "Saving..." : `Save ${slot.label}`}
              </button>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
