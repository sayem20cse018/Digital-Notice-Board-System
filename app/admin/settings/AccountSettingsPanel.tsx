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
      newUsername: fd.get("newUsername")?.toString().trim() || "",
      newPassword: fd.get("newPassword")?.toString().trim() || "",
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
        text: result.message || (result.success ? "Updated" : "Failed"),
      });

      if (result.success) {
        e.currentTarget.reset();
        setTimeout(() => signOut({ callbackUrl: "/admin/login" }), 2000);
      }
    } catch {
      setMessage({ type: "error", text: "Network error" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <section id="account" className="space-y-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">Account & Security</h2>
        <p className="mt-1 text-sm text-gray-600">
          Logged in as <strong>{session?.user?.name || "Administrator"}</strong> — change username or password below.
        </p>
      </div>

      {message && <AdminFlashMessage type={message.type} text={message.text} />}

      <form onSubmit={handleSubmit} className="max-w-md space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium">Current Password</label>
          <input
            name="currentPassword"
            type="password"
            required
            className="w-full rounded border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={loading}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">New Username</label>
          <input
            name="newUsername"
            type="text"
            placeholder="Leave blank to keep current"
            className="w-full rounded border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={loading}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">New Password</label>
          <input
            name="newPassword"
            type="password"
            placeholder="Leave blank to keep current"
            className="w-full rounded border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={loading}
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="rounded bg-blue-600 px-5 py-2 font-medium text-white hover:bg-blue-700 disabled:bg-gray-400"
        >
          {loading ? "Updating..." : "Update Credentials"}
        </button>
      </form>
    </section>
  );
}
