"use client";

import { useState } from "react";
import { fetchJson } from "@/app/lib/fetch-json";

type Props = {
  type: "result" | "teacher-list";
  id: string;
  title: string;
};

export default function SecureViewClient({ type, id, title }: Props) {
  const [password, setPassword]     = useState("");
  const [fileUrl, setFileUrl]       = useState<string | null>(null);
  const [verifiedTitle, setVerifiedTitle] = useState("");
  const [error, setError]           = useState("");
  const [loading, setLoading]       = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const result = await fetchJson<{
        success: boolean;
        message?: string;
        data?: { title: string; fileUrl: string };
      }>("/api/secure-view", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, password, type }),
      });

      if (result.success && result.data) {
        setFileUrl(result.data.fileUrl);
        setVerifiedTitle(result.data.title);
      } else {
        setError(result.message || "Incorrect password");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const isPdf = fileUrl?.toLowerCase().includes(".pdf");

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-blue-900 to-indigo-900 p-4">
      <div className="mx-auto w-full max-w-2xl rounded-2xl bg-white shadow-2xl overflow-hidden">

        {/* Header */}
        <div className="bg-[#1e3a8a] px-6 py-4">
          <h1 className="text-lg font-bold text-white">{verifiedTitle || title}</h1>
          <p className="text-xs text-blue-200 mt-0.5">Department of Computer Science & Engineering</p>
        </div>

        <div className="p-6">
          {!fileUrl ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <p className="text-sm text-slate-600">Enter the password to view this result.</p>
              <input
                type="password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(""); }}
                placeholder="Enter password"
                required
                autoFocus
                className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 text-gray-900 focus:border-blue-500 focus:outline-none"
              />
              {error && (
                <p className="rounded-lg bg-red-50 border border-red-100 px-3 py-2 text-sm text-red-600">{error}</p>
              )}
              <button
                type="submit"
                disabled={loading || !password}
                className="w-full rounded-xl bg-[#1e3a8a] py-3 font-semibold text-white hover:bg-blue-700 disabled:bg-gray-400 transition"
              >
                {loading ? "Verifying..." : "View Result"}
              </button>
            </form>
          ) : (
            <div className="space-y-3">
              {isPdf ? (
                <iframe src={fileUrl} className="h-[70vh] w-full rounded-lg border" title={verifiedTitle} />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={fileUrl} alt={verifiedTitle} className="mx-auto max-h-[70vh] w-full rounded-lg object-contain" />
              )}
              <a href={fileUrl} target="_blank" rel="noopener noreferrer"
                className="block text-center text-sm text-blue-600 underline">
                Open in new tab ↗
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
