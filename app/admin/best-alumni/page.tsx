"use client";

import { useState, useEffect } from "react";
import ImageUpload from "@/app/components/ImageUpload";
import AdminPageHeader from "@/app/components/admin-panel/AdminPageHeader";
import AdminFlashMessage from "@/app/components/admin-panel/AdminFlashMessage";
import { AdminFormCard, AdminListCard } from "@/app/components/admin-panel/AdminCard";
import AdminItemActions from "@/app/components/admin-panel/AdminItemActions";
import { fetchJson } from "@/app/lib/fetch-json";

type Item = {
  id: string;
  title: string;
  imageUrl?: string | null;
  linkUrl?: string | null;
  note?: string | null;
  displayOrder: number;
  published?: boolean;
};

export default function AdminBestAlumniPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [formLoading, setFormLoading] = useState(false);
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [formKey, setFormKey] = useState(0);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => { fetchItems(); }, []);

  async function fetchItems() {
    try {
      const result = await fetchJson<{ success: boolean; data: Item[] }>("/api/best-alumni");
      if (result.success && result.data) setItems(result.data);
    } catch (error) {
      console.error("Error fetching best alumni:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFormLoading(true);
    setMessage(null);

    // Capture BEFORE any await
    const formData = new FormData(e.currentTarget);
    const isEdit = Boolean(editingItem);
    const data = {
      title: formData.get("title")?.toString().trim() || "",
      imageUrl: formData.get("imageUrl")?.toString().trim() || null,
      linkUrl: formData.get("linkUrl")?.toString().trim() || null,
      note: formData.get("note")?.toString().trim() || null,
      displayOrder: Number(formData.get("displayOrder")) || 0,
      published: formData.get("published") === "on" || formData.get("published") === "true",
    };

    if (!data.title) {
      setMessage({ type: "error", text: "Title is required" });
      setFormLoading(false);
      return;
    }

    try {
      const result = await fetchJson<{ success: boolean; message?: string }>("/api/best-alumni", {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(isEdit ? { ...data, id: editingItem!.id } : data),
      });

      if (result.success) {
        setMessage({ type: "success", text: result.message || "Saved successfully!" });
        setEditingItem(null);
        setFormKey((k) => k + 1);
        fetchItems();
        setTimeout(() => setMessage(null), 3000);
      } else {
        setMessage({ type: "error", text: result.message || "Failed to save" });
      }
    } catch (error) {
      setMessage({ type: "error", text: error instanceof Error ? error.message : "Network error." });
    } finally {
      setFormLoading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this item?")) return;
    const result = await fetchJson<{ success: boolean; message?: string }>(`/api/best-alumni?id=${id}`, { method: "DELETE" });
    if (result.success) fetchItems();
    else alert(result.message || "Failed to delete");
  }

  async function handleTogglePublish(id: string, currentPublished: boolean) {
    const item = items.find((i) => i.id === id);
    if (!item) return;
    const result = await fetchJson<{ success: boolean }>("/api/best-alumni", {
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
      <AdminPageHeader
        title="Manage Department Achievers"
        subtitle="Display board-এ Department Achievers section-এ দেখাবে।"
      />

      {message && <AdminFlashMessage type={message.type} text={message.text} />}

      <AdminFormCard title={editingItem ? "Edit Department Achiever" : "Create New Department Achiever"}>
        <form key={formKey} onSubmit={handleSubmit} className="space-y-3">
          <input
            name="title"
            placeholder="Name (e.g. John Doe) *"
            required
            defaultValue={editingItem?.title ?? ""}
            className="w-full rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
            disabled={formLoading}
          />
          <ImageUpload name="imageUrl" label="Photo" currentImage={editingItem?.imageUrl} />
          <textarea
            name="note"
            placeholder="Achievement / Note (e.g. Software Engineer at Google, ICPC Finalist...)"
            rows={2}
            defaultValue={editingItem?.note ?? ""}
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
          <div className="flex items-center gap-2">
            <input
              id={`pub-ba-${formKey}`}
              name="published"
              type="checkbox"
              defaultChecked={editingItem?.published ?? true}
              disabled={formLoading}
            />
            <label htmlFor={`pub-ba-${formKey}`} className="text-sm text-gray-700">
              Published (display board-এ দেখাবে)
            </label>
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

      <AdminListCard title={`All Department Achievers (${items.length})`}>
        {loading ? (
          <p className="text-gray-500">Loading...</p>
        ) : items.length === 0 ? (
          <p className="text-gray-500">No achievers yet. Add one above.</p>
        ) : (
          <div className="space-y-3">
            {items.map((item) => (
              <article key={item.id} className="rounded-lg border border-gray-200 bg-white p-4 hover:bg-gray-50">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex gap-3 flex-1 min-w-0">
                    {item.imageUrl && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={item.imageUrl} alt={item.title} className="h-16 w-16 flex-shrink-0 rounded-full object-cover" />
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-gray-900">{item.title}</p>
                      {item.note && (
                        <p className="text-xs text-gray-600 mt-0.5">{item.note}</p>
                      )}
                      {item.linkUrl && (
                        <a href={item.linkUrl} target="_blank" rel="noreferrer" className="text-xs text-blue-600 underline">{item.linkUrl}</a>
                      )}
                      <p className="mt-1 text-xs text-gray-400">
                        Order: {item.displayOrder} · {item.published ? <span className="text-green-600">Published</span> : <span className="text-red-500">Draft</span>}
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
