"use client";

import { useState, useEffect } from "react";
import ImageUpload from "@/app/components/ImageUpload";
import AdminPageHeader from "@/app/components/admin-panel/AdminPageHeader";
import AdminFlashMessage from "@/app/components/admin-panel/AdminFlashMessage";
import AdminItemActions from "@/app/components/admin-panel/AdminItemActions";
import { AdminFormCard, AdminListCard } from "@/app/components/admin-panel/AdminCard";
import { fetchJson } from "@/app/lib/fetch-json";

type Item = {
  id: string;
  title: string;
  description?: string | null;
  imageUrl?: string | null;
  linkUrl?: string | null;
  displayOrder: number;
  published?: boolean;
};

export default function AdminProjectShowcasePage() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [formLoading, setFormLoading] = useState(false);
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [formKey, setFormKey] = useState(0);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => { fetchItems(); }, []);

  async function fetchItems() {
    try {
      const result = await fetchJson<{ success: boolean; data: Item[] }>("/api/project-showcase?all=1");
      if (result.success) setItems(result.data ?? []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFormLoading(true);
    setMessage(null);

    const formData = new FormData(e.currentTarget);
    const isEdit = Boolean(editingItem);
    const data = {
      title: formData.get("title")?.toString().trim() || "",
      description: formData.get("description")?.toString().trim() || null,
      imageUrl: formData.get("imageUrl")?.toString().trim() || null,
      linkUrl: formData.get("linkUrl")?.toString().trim() || null,
      displayOrder: Number(formData.get("displayOrder")) || 0,
      published: formData.get("published") === "on" || formData.get("published") === "true",
    };

    if (!data.title) {
      setMessage({ type: "error", text: "Title is required" });
      setFormLoading(false);
      return;
    }

    try {
      const result = await fetchJson<{ success: boolean; message?: string }>("/api/project-showcase", {
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
    if (!confirm("Delete this project?")) return;
    const result = await fetchJson<{ success: boolean; message?: string }>(`/api/project-showcase?id=${id}`, { method: "DELETE" });
    if (result.success) fetchItems();
    else alert(result.message || "Failed to delete");
  }

  async function handleTogglePublish(id: string, currentPublished: boolean) {
    const item = items.find((i) => i.id === id);
    if (!item) return;
    const result = await fetchJson<{ success: boolean }>("/api/project-showcase", {
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
        title="Project Showcase"
        subtitle="Display board-এ 'Project Showcase' tile-এ auto slide করে দেখাবে। Department-এর notable projects add করুন।"
      />

      {message && <AdminFlashMessage type={message.type} text={message.text} />}

      <AdminFormCard title={editingItem ? "Edit Project" : "Add New Project"}>
        <form key={formKey} onSubmit={handleSubmit} className="space-y-3">
          <input
            name="title"
            placeholder="Project Title *"
            required
            defaultValue={editingItem?.title ?? ""}
            className="w-full rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
            disabled={formLoading}
          />
          <textarea
            name="description"
            placeholder="Short description (optional)"
            rows={2}
            defaultValue={editingItem?.description ?? ""}
            className="w-full rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
            disabled={formLoading}
          />
          <ImageUpload
            name="imageUrl"
            label="Project Image (optional)"
            currentImage={editingItem?.imageUrl}
          />
          <input
            name="linkUrl"
            placeholder="Project Link / GitHub URL (optional)"
            defaultValue={editingItem?.linkUrl ?? ""}
            className="w-full rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
            disabled={formLoading}
          />
          <div>
            <label className="mb-1 block text-xs text-gray-600">Display Order (ছোট সংখ্যা আগে দেখাবে)</label>
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
              id={`pub-ps-${formKey}`}
              name="published"
              type="checkbox"
              defaultChecked={editingItem?.published ?? true}
              disabled={formLoading}
            />
            <label htmlFor={`pub-ps-${formKey}`} className="text-sm text-gray-700">
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

      <AdminListCard title={`All Projects (${items.length})`}>
        {loading ? (
          <p className="text-gray-500">Loading...</p>
        ) : items.length === 0 ? (
          <p className="text-gray-500">No projects yet. Add one above.</p>
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
                      {item.linkUrl && (
                        <a href={item.linkUrl} target="_blank" rel="noreferrer" className="text-xs text-blue-600 underline">{item.linkUrl}</a>
                      )}
                      <p className="mt-1 text-xs text-gray-400">
                        Order: {item.displayOrder} ·{" "}
                        {item.published ? <span className="text-green-600">Published</span> : <span className="text-red-500">Draft</span>}
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
