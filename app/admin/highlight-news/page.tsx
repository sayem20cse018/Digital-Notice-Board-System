"use client";

import { useState, useEffect, useRef } from "react";
import ImageUpload from "@/app/components/ImageUpload";
import AdminPageHeader from "@/app/components/admin-panel/AdminPageHeader";
import AdminFlashMessage from "@/app/components/admin-panel/AdminFlashMessage";
import AdminItemActions from "@/app/components/admin-panel/AdminItemActions";
import { AdminFormCard, AdminListCard } from "@/app/components/admin-panel/AdminCard";
import { fetchJson } from "@/app/lib/fetch-json";

type Item = {
  id: string;
  title: string;
  imageUrl?: string | null;
  description?: string | null;
  linkUrl?: string | null;
  displayOrder: number;
  slideDuration?: number | null;
  published?: boolean;
};

export default function AdminHighlightNewsPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [formLoading, setFormLoading] = useState(false);
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [formKey, setFormKey] = useState(0);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => { fetchItems(); }, []);

  async function fetchItems() {
    try {
      const result = await fetchJson<{ success: boolean; data: Item[] }>("/api/highlight-news");
      if (result.success) setItems(result.data);
    } catch (error) {
      console.error("Error fetching highlight news:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFormLoading(true);
    setMessage(null);

    // Capture formData BEFORE any await — currentTarget becomes null after async
    const formData = new FormData(e.currentTarget);
    const isEdit = Boolean(editingItem);
    const data = {
      title: formData.get("title")?.toString().trim() || "",
      imageUrl: formData.get("imageUrl")?.toString().trim() || null,
      description: formData.get("description")?.toString().trim() || null,
      linkUrl: formData.get("linkUrl")?.toString().trim() || null,
      displayOrder: Number(formData.get("displayOrder")) || 0,
      slideDuration: Number(formData.get("slideDuration")) || null,
      published: formData.get("published") === "on" || formData.get("published") === "true",
    };

    if (!data.title) {
      setMessage({ type: "error", text: "Title is required" });
      setFormLoading(false);
      return;
    }

    try {
      const result = await fetchJson<{ success: boolean; message?: string }>("/api/highlight-news", {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(isEdit ? { ...data, id: editingItem!.id } : data),
      });

      if (result.success) {
        setMessage({ type: "success", text: result.message || "Saved successfully!" });
        setEditingItem(null);
        setFormKey((k) => k + 1); // reset form by remounting
        fetchItems();
        setTimeout(() => setMessage(null), 3000);
      } else {
        setMessage({ type: "error", text: result.message || "Failed to save" });
      }
    } catch (error) {
      const text = error instanceof Error ? error.message : "Network error.";
      setMessage({ type: "error", text });
    } finally {
      setFormLoading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this item?")) return;
    const result = await fetchJson<{ success: boolean; message?: string }>(`/api/highlight-news?id=${id}`, { method: "DELETE" });
    if (result.success) fetchItems();
    else alert(result.message || "Failed to delete");
  }

  async function handleTogglePublish(id: string, currentPublished: boolean) {
    const item = items.find((i) => i.id === id);
    if (!item) return;
    const result = await fetchJson<{ success: boolean }>("/api/highlight-news", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...item, published: !currentPublished }),
    });
    if (result.success) fetchItems();
  }

  function startEdit(item: Item) {
    setEditingItem(item);
    setFormKey((k) => k + 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader title="Manage Highlight News" subtitle="Display board-এ top hero section-এ দেখাবে। Published items দেখাবে।" />

      {message && <AdminFlashMessage type={message.type} text={message.text} />}

      <AdminFormCard title={editingItem ? "Edit Highlight News" : "Create New Highlight News"}>
        <form key={formKey} onSubmit={handleSubmit} className="space-y-3">
          <input
            name="title"
            placeholder="Title *"
            required
            defaultValue={editingItem?.title ?? ""}
            className="w-full rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
            disabled={formLoading}
          />
          <ImageUpload name="imageUrl" label="Image (optional)" currentImage={editingItem?.imageUrl} />
          <textarea
            name="description"
            placeholder="Description (optional)"
            rows={3}
            defaultValue={editingItem?.description ?? ""}
            className="w-full rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
            disabled={formLoading}
          />
          <input
            name="linkUrl"
            placeholder="Link URL (optional)"
            defaultValue={editingItem?.linkUrl ?? ""}
            className="w-full rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
            disabled={formLoading}
          />
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs text-gray-600">Display Order</label>
              <input
                name="displayOrder"
                type="number"
                defaultValue={editingItem?.displayOrder ?? 0}
                className="w-full rounded border border-gray-300 px-3 py-2"
                disabled={formLoading}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-gray-600">Slide Duration (seconds)</label>
              <input
                name="slideDuration"
                type="number"
                min={2}
                max={120}
                placeholder="e.g. 5"
                defaultValue={editingItem?.slideDuration ?? ""}
                className="w-full rounded border border-gray-300 px-3 py-2"
                disabled={formLoading}
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <input
              id={`pub-hn-${formKey}`}
              name="published"
              type="checkbox"
              defaultChecked={editingItem?.published ?? true}
              disabled={formLoading}
            />
            <label htmlFor={`pub-hn-${formKey}`} className="text-sm text-gray-700">Published (display board-এ দেখাবে)</label>
          </div>
          <div className="flex gap-2 pt-1">
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
                className="rounded border px-4 py-2 text-sm"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </AdminFormCard>

      <AdminListCard title={`All Highlight News (${items.length})`}>
        {loading ? (
          <p className="text-gray-500">Loading...</p>
        ) : items.length === 0 ? (
          <p className="text-gray-500">No highlight news yet. Add one above.</p>
        ) : (
          <div className="space-y-3">
            {items.map((item) => (
              <article key={item.id} className="rounded-lg border border-gray-200 bg-white p-4 hover:bg-gray-50">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex gap-3 flex-1 min-w-0">
                    {item.imageUrl && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={item.imageUrl} alt={item.title} className="h-16 w-24 flex-shrink-0 rounded object-cover" />
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-gray-900">{item.title}</p>
                      {item.description && <p className="mt-0.5 text-sm text-gray-600 line-clamp-2">{item.description}</p>}
                      <p className="mt-1 text-xs text-gray-400">
                        Order: {item.displayOrder}
                        {item.slideDuration ? ` · ${item.slideDuration}s` : ""}
                        {" · "}{item.published ? <span className="text-green-600">Published</span> : <span className="text-red-500">Draft</span>}
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
