"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import ImageUpload from "@/app/components/ImageUpload";
import FileUpload from "@/app/components/FileUpload";
import AdminPageHeader from "@/app/components/admin-panel/AdminPageHeader";
import AdminFlashMessage from "@/app/components/admin-panel/AdminFlashMessage";
import AdminItemActions from "@/app/components/admin-panel/AdminItemActions";
import { AdminFormCard, AdminListCard } from "@/app/components/admin-panel/AdminCard";
import { fetchJson } from "@/app/lib/fetch-json";

type Item = {
  id: string;
  roomName: string;
  description?: string | null;
  floor?: string | null;
  imageUrl?: string | null;
  fileUrl?: string | null;
  qrCodeUrl?: string | null;
  displayOrder: number;
  published?: boolean;
};

/** Generate QR that encodes a URL or text using free qrserver API */
function buildQrUrl(data: string): string {
  return `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(data.trim())}`;
}

export default function AdminRoomDirectoryPage() {
  const [items, setItems]           = useState<Item[]>([]);
  const [loading, setLoading]       = useState(true);
  const [formLoading, setFormLoading] = useState(false);
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [formKey, setFormKey]       = useState(0);
  const [message, setMessage]       = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Controlled form state
  const [roomName,    setRoomName]    = useState("");
  const [floor,       setFloor]       = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl,    setImageUrl]    = useState<string | null>(null);
  const [fileUrl,     setFileUrl]     = useState<string | null>(null);
  const [qrCodeUrl,   setQrCodeUrl]   = useState<string | null>(null);
  const [displayOrder, setDisplayOrder] = useState(0);
  const [published,   setPublished]   = useState(true);

  // ── auto-generate QR whenever imageUrl or fileUrl changes ──
  useEffect(() => {
    const target = fileUrl || imageUrl;
    if (target) {
      setQrCodeUrl(buildQrUrl(target));
    }
  }, [fileUrl, imageUrl]);

  useEffect(() => { fetchItems(); }, []);

  // Populate form when editing
  useEffect(() => {
    if (editingItem) {
      setRoomName(editingItem.roomName ?? "");
      setFloor(editingItem.floor ?? "");
      setDescription(editingItem.description ?? "");
      setImageUrl(editingItem.imageUrl ?? null);
      setFileUrl((editingItem as Item & { fileUrl?: string | null }).fileUrl ?? null);
      setQrCodeUrl(editingItem.qrCodeUrl ?? null);
      setDisplayOrder(editingItem.displayOrder ?? 0);
      setPublished(editingItem.published ?? true);
    } else {
      setRoomName(""); setFloor(""); setDescription("");
      setImageUrl(null); setFileUrl(null); setQrCodeUrl(null);
      setDisplayOrder(0); setPublished(true);
    }
  }, [editingItem, formKey]);

  async function fetchItems() {
    try {
      const result = await fetchJson<{ success: boolean; data: Item[] }>("/api/room-directory?all=1");
      if (result.success) setItems(result.data ?? []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!roomName.trim()) {
      setMessage({ type: "error", text: "Room name is required" });
      return;
    }
    setFormLoading(true);
    setMessage(null);

    const isEdit = Boolean(editingItem);
    const data = {
      roomName: roomName.trim(),
      description: description.trim() || null,
      floor: floor.trim() || null,
      imageUrl: imageUrl || null,
      fileUrl: fileUrl || null,
      qrCodeUrl: qrCodeUrl || null,
      displayOrder,
      published,
    };

    try {
      const result = await fetchJson<{ success: boolean; message?: string }>("/api/room-directory", {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(isEdit ? { ...data, id: editingItem!.id } : data),
      });
      if (result.success) {
        setMessage({ type: "success", text: result.message || "Saved!" });
        setEditingItem(null);
        setFormKey((k) => k + 1);
        fetchItems();
        setTimeout(() => setMessage(null), 3000);
      } else {
        setMessage({ type: "error", text: result.message || "Failed to save" });
      }
    } catch {
      setMessage({ type: "error", text: "Network error" });
    } finally {
      setFormLoading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this room?")) return;
    const r = await fetchJson<{ success: boolean; message?: string }>(`/api/room-directory?id=${id}`, { method: "DELETE" });
    if (r.success) fetchItems(); else alert(r.message || "Failed");
  }

  async function handleTogglePublish(id: string, cur: boolean) {
    const item = items.find((i) => i.id === id);
    if (!item) return;
    await fetchJson("/api/room-directory", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...item, published: !cur }),
    });
    fetchItems();
  }

  function startEdit(item: Item) {
    setEditingItem(item);
    setFormKey((k) => k + 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Room Directory"
        subtitle="Upload a room image or file — QR code is generated automatically. Students scan to view details."
      />

      {message && <AdminFlashMessage type={message.type} text={message.text} />}

      <AdminFormCard title={editingItem ? "Edit Room" : "Add New Room"}>
        <form key={formKey} onSubmit={handleSubmit} className="space-y-4">

          {/* Room name */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Room Name *</label>
            <input
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
              placeholder="e.g. CSE Lab-1"
              required
              className="w-full rounded border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-500 focus:outline-none"
              disabled={formLoading}
            />
          </div>

          {/* Floor */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Floor / Location (optional)</label>
            <input
              value={floor}
              onChange={(e) => setFloor(e.target.value)}
              placeholder="e.g. 3rd Floor, Block-B"
              className="w-full rounded border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-500 focus:outline-none"
              disabled={formLoading}
            />
          </div>

          {/* Description */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Description (optional)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. 30 computers, AC, capacity 40 students"
              rows={2}
              className="w-full rounded border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-500 focus:outline-none"
              disabled={formLoading}
            />
          </div>

          {/* ──────────────────────────────────────────
              QR AUTO-GENERATE ZONE
              Upload Image OR File → QR appears instantly
          ─────────────────────────────────────────── */}
          <div className="rounded-xl border-2 border-blue-200 bg-blue-50 p-4 space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-lg">⚡</span>
              <div>
                <p className="text-sm font-bold text-blue-800">Auto QR — Upload Image or File</p>
                <p className="text-xs text-blue-600">
                  Upload a room photo or PDF/file below — QR code generates automatically.
                  Students scan the QR to open the file.
                </p>
              </div>
            </div>

            {/* Option A: Image */}
            <div className="rounded-lg border border-blue-100 bg-white p-3">
              <p className="mb-2 text-xs font-semibold text-slate-600 uppercase tracking-wide">Option A — Room Image</p>
              <ImageUpload
                name="imageUrl"
                label="Room Photo"
                currentImage={imageUrl}
                onImageChange={(url) => {
                  setImageUrl(url);
                  if (url) setFileUrl(null); // prefer image over file for QR
                }}
              />
            </div>

            {/* Option B: File (PDF etc.) */}
            <div className="rounded-lg border border-blue-100 bg-white p-3">
              <p className="mb-2 text-xs font-semibold text-slate-600 uppercase tracking-wide">Option B — PDF / File</p>
              <FileUpload
                name="fileUrl"
                label="Room File (PDF, Word, etc.)"
                currentFile={fileUrl}
                accept="image/*,.pdf,.doc,.docx,.xls,.xlsx"
                onFileChange={(url) => {
                  setFileUrl(url);
                  if (url) setImageUrl(null); // prefer file for QR
                }}
              />
            </div>

            {/* QR Preview — auto updates */}
            {qrCodeUrl ? (
              <div className="flex items-center gap-4 rounded-lg border border-green-200 bg-green-50 p-3">
                <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-lg border bg-white shadow">
                  <Image src={qrCodeUrl} alt="Auto QR Preview" fill className="object-contain p-1" unoptimized />
                </div>
                <div className="space-y-1 text-sm">
                  <p className="font-bold text-green-700">✓ QR generated automatically!</p>
                  <p className="text-xs text-slate-500">Scan to verify before saving.</p>
                  <a href={qrCodeUrl} target="_blank" rel="noreferrer" className="text-xs text-blue-600 underline">Open full size ↗</a>
                  <button
                    type="button"
                    onClick={() => setQrCodeUrl(null)}
                    className="block text-xs text-red-500 hover:underline"
                  >
                    Remove QR
                  </button>
                </div>
              </div>
            ) : (
              <div className="rounded-lg border border-dashed border-blue-300 bg-white p-3 text-center text-xs text-slate-400">
                Upload an image or file above — QR will appear here automatically.
              </div>
            )}

            {/* Manual QR text override */}
            <details className="text-xs">
              <summary className="cursor-pointer text-slate-500 hover:text-slate-700">
                Or enter custom QR text / URL manually →
              </summary>
              <div className="mt-2 flex gap-2">
                <input
                  id="qrManualInput"
                  placeholder="Enter URL or text for QR"
                  className="flex-1 rounded border border-gray-300 px-3 py-2 text-gray-900 text-sm"
                  onBlur={(e) => {
                    const v = e.target.value.trim();
                    if (v) setQrCodeUrl(buildQrUrl(v));
                  }}
                />
                <button
                  type="button"
                  onClick={() => {
                    const input = document.getElementById("qrManualInput") as HTMLInputElement | null;
                    const v = input?.value.trim();
                    if (v) setQrCodeUrl(buildQrUrl(v));
                  }}
                  className="rounded bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                >
                  Generate
                </button>
              </div>
            </details>
          </div>

          {/* Display Order */}
          <div>
            <label className="mb-1 block text-xs text-gray-600">Display Order (lower = shown first)</label>
            <input
              type="number"
              value={displayOrder}
              onChange={(e) => setDisplayOrder(Number(e.target.value))}
              className="w-full rounded border border-gray-300 px-3 py-2 text-gray-900"
              disabled={formLoading}
            />
          </div>

          {/* Published */}
          <div className="flex items-center gap-2">
            <input
              id={`pub-rd-${formKey}`}
              type="checkbox"
              checked={published}
              onChange={(e) => setPublished(e.target.checked)}
              disabled={formLoading}
            />
            <label htmlFor={`pub-rd-${formKey}`} className="text-sm text-gray-700">
              Published (show on display board)
            </label>
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={formLoading}
              className="rounded bg-blue-600 px-5 py-2 font-medium text-white hover:bg-blue-700 disabled:bg-gray-400"
            >
              {formLoading ? "Saving..." : editingItem ? "Update" : "Save & Publish"}
            </button>
            {editingItem && (
              <button
                type="button"
                onClick={() => { setEditingItem(null); setFormKey((k) => k + 1); }}
                className="rounded border px-4 py-2 text-sm text-gray-700"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </AdminFormCard>

      {/* ── List ── */}
      <AdminListCard title={`All Rooms (${items.length})`}>
        {loading ? (
          <p className="text-gray-500">Loading...</p>
        ) : items.length === 0 ? (
          <p className="text-gray-500">No rooms yet. Add one above.</p>
        ) : (
          <div className="space-y-3">
            {items.map((item) => (
              <article key={item.id} className="rounded-lg border border-gray-200 bg-white p-4 hover:bg-gray-50">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex gap-3 flex-1 min-w-0">
                    {item.imageUrl && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={item.imageUrl} alt={item.roomName} className="h-14 w-20 flex-shrink-0 rounded object-cover" />
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-gray-900">{item.roomName}</p>
                      {item.floor && <p className="text-sm text-blue-700">{item.floor}</p>}
                      {item.description && <p className="text-sm text-gray-600 line-clamp-1">{item.description}</p>}
                      <p className="mt-1 text-xs text-gray-400">
                        Order: {item.displayOrder} ·{" "}
                        {item.published
                          ? <span className="text-green-600">Published</span>
                          : <span className="text-red-500">Draft</span>}
                        {item.qrCodeUrl && <span className="ml-2 text-blue-600 font-medium">✓ QR</span>}
                      </p>
                    </div>
                    {item.qrCodeUrl && (
                      <div className="relative h-14 w-14 flex-shrink-0 overflow-hidden rounded border bg-white shadow-sm">
                        <Image src={item.qrCodeUrl} alt="QR" fill className="object-contain p-0.5" unoptimized />
                      </div>
                    )}
                  </div>
                  <AdminItemActions
                    published={item.published}
                    onEdit={() => startEdit(item)}
                    onTogglePublish={() => handleTogglePublish(item.id, Boolean(item.published))}
                    onDelete={() => handleDelete(item.id)}
                  />
                </div>
              </article>
            ))}
          </div>
        )}
      </AdminListCard>
    </div>
  );
}
