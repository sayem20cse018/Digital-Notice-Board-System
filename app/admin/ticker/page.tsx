"use client";

import { useState, useEffect } from "react";
import AdminPageHeader from "@/app/components/admin-panel/AdminPageHeader";
import AdminFlashMessage from "@/app/components/admin-panel/AdminFlashMessage";
import { AdminFormCard, AdminListCard } from "@/app/components/admin-panel/AdminCard";
import AdminItemActions from "@/app/components/admin-panel/AdminItemActions";
import { fetchJson } from "@/app/lib/fetch-json";

// Welcome text is stored in DepartmentSettings.marqueeText
// Emergency notices are stored in RightSidebarNotice — title starting with ⚠ or containing "emergency"

type NoticeItem = {
  id: string;
  title: string;
  imageUrl?: string | null;
  fileUrl?: string | null;
  displayOrder: number;
  published?: boolean;
};

export default function AdminTickerPage() {
  // ── Welcome text ──
  const [welcome, setWelcome] = useState("");
  const [welcomeLoading, setWelcomeLoading] = useState(true);
  const [welcomeSaving, setWelcomeSaving] = useState(false);
  const [welcomeMsg, setWelcomeMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // ── Emergency notices ──
  const [notices, setNotices] = useState<NoticeItem[]>([]);
  const [noticesLoading, setNoticesLoading] = useState(true);
  const [formLoading, setFormLoading] = useState(false);
  const [editingItem, setEditingItem] = useState<NoticeItem | null>(null);
  const [formKey, setFormKey] = useState(0);
  const [noticeMsg, setNoticeMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [emergencyTitle, setEmergencyTitle] = useState("");

  useEffect(() => {
    // Load welcome text from settings
    fetchJson<{ success: boolean; data?: { marqueeText?: string } }>("/api/display-settings")
      .then((r) => {
        if (r.success && r.data) {
          // marqueeText is in DepartmentSettings, not display-settings
          // load from separate endpoint
        }
      })
      .catch(() => {});

    // Load from window fetch to /api/settings or just use a simple GET
    fetch("/api/department-settings")
      .then((r) => r.json())
      .then((d) => {
        if (d?.marqueeText !== undefined) setWelcome(d.marqueeText);
      })
      .catch(() => {})
      .finally(() => setWelcomeLoading(false));

    fetchNotices();
  }, []);

  async function fetchNotices() {
    try {
      const result = await fetchJson<{ success: boolean; data: NoticeItem[] }>("/api/right-sidebar-notice");
      if (result.success) {
        // Show only emergency-type notices
        const all = result.data ?? [];
        setNotices(all);
      }
    } catch { /* ignore */ }
    finally { setNoticesLoading(false); }
  }

  async function saveWelcome() {
    setWelcomeSaving(true);
    setWelcomeMsg(null);
    try {
      const res = await fetch("/api/department-settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ marqueeText: welcome }),
      });
      const d = await res.json();
      if (d.success) {
        setWelcomeMsg({ type: "success", text: "Welcome text saved! Display board will update shortly." });
      } else {
        setWelcomeMsg({ type: "error", text: d.message || "Failed to save" });
      }
    } catch {
      setWelcomeMsg({ type: "error", text: "Network error" });
    } finally {
      setWelcomeSaving(false);
      setTimeout(() => setWelcomeMsg(null), 3000);
    }
  }

  async function handleEmergencySubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFormLoading(true);
    setNoticeMsg(null);
    const fd = new FormData(e.currentTarget);
    const rawTitle = fd.get("title")?.toString().trim() || "";
    // Ensure title starts with ⚠ so TickerBar detects it as emergency
    const title = rawTitle.startsWith("⚠") ? rawTitle : `⚠ ${rawTitle}`;
    const isEdit = Boolean(editingItem);
    const data = {
      title,
      displayOrder: 0,
      published: true,
    };
    try {
      const result = await fetchJson<{ success: boolean; message?: string }>("/api/right-sidebar-notice", {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(isEdit ? { ...data, id: editingItem!.id } : data),
      });
      if (result.success) {
        setNoticeMsg({ type: "success", text: "Emergency notice published!" });
        setEditingItem(null);
        setFormKey((k) => k + 1);
        setEmergencyTitle("");
        fetchNotices();
        setTimeout(() => setNoticeMsg(null), 3000);
      } else {
        setNoticeMsg({ type: "error", text: result.message || "Failed" });
      }
    } catch {
      setNoticeMsg({ type: "error", text: "Network error" });
    } finally {
      setFormLoading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this notice?")) return;
    const result = await fetchJson<{ success: boolean }>(`/api/right-sidebar-notice?id=${id}`, { method: "DELETE" });
    if (result.success) fetchNotices();
  }

  async function handleTogglePublish(id: string, currentPublished: boolean) {
    const item = notices.find((i) => i.id === id);
    if (!item) return;
    await fetchJson("/api/right-sidebar-notice", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...item, published: !currentPublished }),
    });
    fetchNotices();
  }

  return (
    <div className="space-y-8">
      <AdminPageHeader
        title="Welcome & Emergency Ticker"
        subtitle="Manage the scrolling welcome text and emergency notices shown on the display board ticker bar."
      />

      {/* ── Welcome Text ── */}
      <AdminFormCard title="Welcome Text">
        {welcomeMsg && <AdminFlashMessage type={welcomeMsg.type} text={welcomeMsg.text} />}
        <div className="space-y-3">
          <p className="text-sm text-slate-600">
            This text scrolls in the <strong>left side</strong> of the ticker bar on the display board.
          </p>
          <textarea
            value={welcome}
            onChange={(e) => setWelcome(e.target.value)}
            rows={3}
            placeholder="e.g. Welcome to Department of CSE, GSTU"
            className="w-full rounded border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-500 focus:outline-none"
            disabled={welcomeLoading || welcomeSaving}
          />
          <button
            type="button"
            onClick={saveWelcome}
            disabled={welcomeSaving || welcomeLoading}
            className="rounded bg-blue-600 px-5 py-2 font-medium text-white hover:bg-blue-700 disabled:bg-gray-400"
          >
            {welcomeSaving ? "Saving..." : "Save Welcome Text"}
          </button>
        </div>
      </AdminFormCard>

      {/* ── Emergency Notice ── */}
      <div>
        {noticeMsg && <AdminFlashMessage type={noticeMsg.type} text={noticeMsg.text} />}

        <AdminFormCard title={editingItem ? "Edit Emergency Notice" : "Post Emergency Notice"}>
          <div className="mb-3 rounded-lg border border-red-100 bg-red-50 p-3 text-sm text-red-700">
            Emergency notices appear on the <strong>right side</strong> of the ticker bar with a red flashing background.
          </div>
          <form key={formKey} onSubmit={handleEmergencySubmit} className="space-y-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Emergency Message <span className="text-red-500">*</span>
              </label>
              <input
                name="title"
                required
                value={emergencyTitle}
                onChange={(e) => setEmergencyTitle(e.target.value)}
                defaultValue={editingItem ? editingItem.title.replace(/^⚠\s*/, "") : ""}
                placeholder="e.g. Class suspended today — exam rescheduled"
                className="w-full rounded border border-red-300 px-3 py-2 text-gray-900 focus:border-red-500 focus:outline-none"
                disabled={formLoading}
              />
              <p className="mt-1 text-xs text-slate-500">
                The ⚠ symbol will be added automatically.
              </p>
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={formLoading}
                className="rounded bg-red-600 px-5 py-2 font-medium text-white hover:bg-red-700 disabled:bg-gray-400"
              >
                {formLoading ? "Publishing..." : editingItem ? "Update" : "Publish Emergency Notice"}
              </button>
              {editingItem && (
                <button
                  type="button"
                  onClick={() => { setEditingItem(null); setFormKey((k) => k + 1); setEmergencyTitle(""); }}
                  className="rounded border px-4 py-2 text-sm"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </AdminFormCard>

        <div className="mt-4">
          <AdminListCard title={`All Notices (${notices.length})`}>
            {noticesLoading ? (
              <p className="text-gray-500">Loading...</p>
            ) : notices.length === 0 ? (
              <p className="text-gray-500">No notices yet.</p>
            ) : (
              <div className="space-y-2">
                {notices.map((item) => (
                  <article key={item.id} className={`rounded-lg border p-3 ${
                    item.title.startsWith("⚠") ? "border-red-200 bg-red-50" : "border-gray-200 bg-white"
                  }`}>
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-gray-900 text-sm">{item.title}</p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {item.title.startsWith("⚠") ? (
                            <span className="text-red-600 font-medium">Emergency notice</span>
                          ) : (
                            <span className="text-blue-600">Regular notice</span>
                          )}
                          {" · "}{item.published ? <span className="text-green-600">Published</span> : <span className="text-red-500">Draft</span>}
                        </p>
                      </div>
                      <AdminItemActions
                        published={item.published}
                        onEdit={() => {
                          setEditingItem(item);
                          setEmergencyTitle(item.title.replace(/^⚠\s*/, ""));
                          setFormKey((k) => k + 1);
                          window.scrollTo({ top: 0, behavior: "smooth" });
                        }}
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
      </div>
    </div>
  );
}
