"use client";

import { useState } from "react";
import { signOut, useSession } from "next-auth/react";
import AdminFlashMessage from "@/app/components/admin-panel/AdminFlashMessage";
import { fetchJson } from "@/app/lib/fetch-json";

export default function AccountSettingsPanel() {
  const { data: session } = useSession();
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const fd = new FormData(e.currentTarget);
    const payload = {
      currentPassword: fd.get("currentPassword")?.toString().trim() || "",
      newUsername:     fd.get("newUsername")?.toString().trim()     || "",
      newPassword:     fd.get("newPassword")?.toString().trim()     || "",
    };

    try {
      const result = await fetchJson<{ success: boolean; message?: string }>(
        "/api/admin/change-credentials",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );

      setMessage({
        type: result.success ? "success" : "error",
        text: result.message || (result.success ? "Updated successfully." : "Failed to update."),
      });

      if (result.success) {
        e.currentTarget.reset();
        setTimeout(() => signOut({ callbackUrl: "/admin/login" }), 2000);
      }
    } catch {
      setMessage({ type: "error", text: "Network error — please try again." });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-slate-100 bg-slate-50 px-5 py-3">
        <span className="text-lg leading-none">🔐</span>
        <h2 className="text-sm font-semibold text-slate-800 uppercase tracking-wide">Account & Security</h2>
      </div>

      <div className="p-5 space-y-4">
        <div className="flex items-center gap-3 rounded-lg border border-slate-100 bg-slate-50 px-4 py-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 text-blue-700 font-bold text-sm uppercase">
            {(session?.user?.name ?? "A")[0]}
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-800">{session?.user?.name || "Administrator"}</p>
            <p className="text-xs text-slate-500">Currently signed in</p>
          </div>
        </div>

        {message && <AdminFlashMessage type={message.type} text={message.text} />}

        <form onSubmit={handleSubmit} className="max-w-sm space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Current Password *</label>
            <input
              name="currentPassword"
              type="password"
              required
              disabled={loading}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 disabled:bg-slate-50"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">New Username</label>
            <input
              name="newUsername"
              type="text"
              placeholder="Leave blank to keep current"
              disabled={loading}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 disabled:bg-slate-50"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">New Password</label>
            <input
              name="newPassword"
              type="password"
              placeholder="Leave blank to keep current"
              disabled={loading}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 disabled:bg-slate-50"
            />
          </div>

          <div className="flex items-center gap-3 pt-1">
            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 disabled:bg-slate-300 disabled:text-slate-500 transition"
            >
              {loading ? "Updating…" : "Update Credentials"}
            </button>
            {message?.type === "success" && (
              <p className="text-xs text-slate-500">Signing out in 2 seconds…</p>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
