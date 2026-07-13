"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import ImageUpload from "@/app/components/ImageUpload";
import AdminPageHeader from "@/app/components/admin-panel/AdminPageHeader";
import AdminFlashMessage from "@/app/components/admin-panel/AdminFlashMessage";
import AdminItemActions from "@/app/components/admin-panel/AdminItemActions";
import { AdminFormCard, AdminListCard } from "@/app/components/admin-panel/AdminCard";
import { fetchJson } from "@/app/lib/fetch-json";

type EventItem = {
  id: string;
  title: string;
  description?: string | null;
  date?: string | null;
  time?: string | null;
  venue?: string | null;
  imageUrl?: string | null;
  displayOrder: number;
  published?: boolean;
};

export default function AdminEventsBoardPage() {
  const [items, setItems]           = useState<EventItem[]>([]);
  const [loading, setLoading]       = useState(true);
  const [formLoading, setFormLoading] = useState(false);
  const [editingItem, setEditingItem] = useState<EventItem | null>(null);
  const [formKey, setFormKey]       = useState(0);
  const [message, setMessage]       = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [imageUrl, setImageUrl]     = useState<string | null>(null);

  useEffect(() => { fetchItems(); }, []);

  useEffect(() => {
    setImageUrl(editingItem?.imageUrl ?? null);
  }, [editingItem, formKey]);

  async function fetchItems() {
    try {
      const r = await fetchJson<{ success: boolean; data: EventItem[] }>("/api/events-board?all=1");
      if (r.success) setItems(r.data ?? []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFormLoading(true);
    setMessage(null);
    const fd = new FormData(e.currentTarget);
    const isEdit = Boolean(editingItem);
    const data = {
      title:       fd.get("title")?.toString().trim() || "",
      description: fd.get("description")?.toString().trim() || null,
      date:        fd.get("date")?.toString().trim() || null,
      time:        fd.get("time")?.toString().trim() || null,
      venue:       fd.get("venue")?.toString().trim() || null,
      imageUrl:    imageUrl || null,
      published:   fd.get("published") === "on" || fd.get("published") === "true",
    };
    if (!data.title) {
      setMessage({ type: "error", text: "Title is required" });
      setFormLoading(false);
      return;
    }
    try {
      const result = await fetchJson<{ success: boolean; message?: string }>("/api/events-board", {
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
        setMessage({ type: "error", text: result.message || "Failed" });
      }
    } catch { setMessage({ type: "error", text: "Network error" }); }
    finally { setFormLoading(false); }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this event?")) return;
    const r = await fetchJson<{ success: boolean }>(`/api/events-board?id=${id}`, { method: "DELETE" });
    if (r.success) fetchItems();
  }

  async function handleTogglePublish(id: string, cur: boolean) {
    const item = items.find((i) => i.id === id);
    if (!item) return;
    await fetchJson("/api/events-board", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...item, published: !cur }),
    });
    fetchItems();
  }

  function startEdit(item: EventItem) {
    setEditingItem(item);
    setFormKey((k) => k + 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Events"
        subtitle="Add upcoming department events. These can be shown on the display board."
      />
      {message && <AdminFlashMessage type={message.type} text={message.text} />}

      <AdminFormCard title={editingItem ? "Edit Event" : "Add New Event"}>
        <form key={formKey} onSubmit={handleSubmit} className="space-y-3 max-w-2xl">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Event Title *</label>
            <input
              name="title"
              required
              defaultValue={editingItem?.title ?? ""}
              placeholder="e.g. Annual Sports Day 2025"
              className="w-full rounded border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-500 focus:outline-none"
              disabled={formLoading}
            />
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Date</label>
              <input
                name="date"
                type="date"
                defaultValue={editingItem?.date ?? ""}
                className="w-full rounded border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-500 focus:outline-none"
                disabled={formLoading}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Time</label>
              <input
                name="time"
                type="time"
                defaultValue={editingItem?.time ?? ""}
                className="w-full rounded border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-500 focus:outline-none"
                disabled={formLoading}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Venue</label>
              <input
                name="venue"
                defaultValue={editingItem?.venue ?? ""}
                placeholder="e.g. CSE Building"
                className="w-full rounded border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-500 focus:outline-none"
                disabled={formLoading}
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Description</label>
            <textarea
              name="description"
              rows={3}
              defaultValue={editingItem?.description ?? ""}
              placeholder="Event details..."
              className="w-full rounded border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-500 focus:outline-none"
              disabled={formLoading}
            />
          </div>

          <ImageUpload
            name="imageUrl"
            label="Event Image (optional)"
            currentImage={imageUrl}
            onImageChange={(url) => setImageUrl(url || null)}
          />

          <div className="flex items-center gap-2">
            <input
              id={`pub-ev-${formKey}`}
              name="published"
              type="checkbox"
              defaultChecked={editingItem?.published ?? true}
              disabled={formLoading}
            />
            <label htmlFor={`pub-ev-${formKey}`} className="text-sm text-gray-700">
              Published
            </label>
          </div>

          <div className="flex gap-2 pt-1">
            <button
              type="submit"
              disabled={formLoading}
              className="rounded bg-blue-600 px-5 py-2 font-medium text-white hover:bg-blue-700 disabled:bg-gray-400"
            >
              {formLoading ? "Saving..." : editingItem ? "Update" : "Save Event"}
            </button>
            {editingItem && (
              <button
                type="button"
                onClick={() => { setEditingItem(null); setFormKey((k) => k + 1); }}
                className="rounded border px-4 py-2 text-sm text-gray-600"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </AdminFormCard>

      <AdminListCard title={`All Events (${items.length})`}>
        {loading ? (
          <p className="text-gray-500">Loading...</p>
        ) : items.length === 0 ? (
          <p className="text-gray-500">No events yet. Add one above.</p>
        ) : (
          <div className="space-y-3">
            {items.map((item) => (
              <article key={item.id} className="rounded-lg border border-gray-200 bg-white p-4 hover:bg-gray-50">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex gap-3 flex-1 min-w-0">
                    {item.imageUrl && (
                      <div className="relative h-16 w-20 flex-shrink-0 overflow-hidden rounded-lg border">
                        <Image src={item.imageUrl} alt={item.title} fill className="object-cover" unoptimized />
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-gray-900">{item.title}</p>
                      <div className="mt-0.5 flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-slate-500">
                        {item.date && <span>📅 {item.date}</span>}
                        {item.time && <span>🕐 {item.time}</span>}
                        {item.venue && <span>📍 {item.venue}</span>}
                      </div>
                      {item.description && (
                        <p className="mt-1 line-clamp-1 text-sm text-gray-600">{item.description}</p>
                      )}
                      <p className="mt-1 text-xs text-gray-400">
                        {item.published
                          ? <span className="text-green-600">Published</span>
                          : <span className="text-red-500">Draft</span>}
                      </p>
                    </div>
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
