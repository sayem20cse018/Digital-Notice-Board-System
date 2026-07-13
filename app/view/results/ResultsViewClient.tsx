"use client";

import { useState } from "react";
import { fetchJson } from "@/app/lib/fetch-json";

type Session = { id: string; slotNumber: number; title: string };

type Props = {
  sessions: Session[];
};

export default function ResultsViewClient({ sessions }: Props) {
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [password, setPassword]   = useState("");
  const [fileUrl, setFileUrl]     = useState<string | null>(null);
  const [fileTitle, setFileTitle] = useState("");
  const [error, setError]         = useState("");
  const [loading, setLoading]     = useState(false);

  function handleSelectSession(session: Session) {
    setSelectedSession(session);
    setPassword("");
    setFileUrl(null);
    setError("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedSession) return;
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
        body: JSON.stringify({ id: selectedSession.id, password, type: "result" }),
      });

      if (result.success && result.data) {
        setFileUrl(result.data.fileUrl);
        setFileTitle(result.data.title);
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
      <div className="mx-auto w-full max-w-2xl">

        {/* Header */}
        <div className="mb-4 rounded-2xl bg-white/10 px-6 py-4 text-center backdrop-blur">
          <h1 className="text-xl font-bold text-white">Exam Results</h1>
          <p className="text-sm text-blue-200">Department of Computer Science & Engineering</p>
        </div>

        {/* File view */}
        {fileUrl ? (
          <div className="rounded-2xl bg-white overflow-hidden shadow-2xl">
            <div className="bg-[#1e3a8a] px-6 py-3 flex items-center justify-between">
              <div>
                <p className="font-bold text-white">{fileTitle}</p>
                <button
                  onClick={() => { setFileUrl(null); setPassword(""); }}
                  className="text-xs text-blue-200 hover:text-white mt-0.5"
                >
                  ← Back to sessions
                </button>
              </div>
              <a href={fileUrl} target="_blank" rel="noreferrer"
                className="rounded-lg bg-white/15 px-3 py-1.5 text-xs font-semibold text-white hover:bg-white/25">
                Open full ↗
              </a>
            </div>
            <div className="h-[75vh]">
              {isPdf ? (
                <iframe src={fileUrl} className="h-full w-full" title={fileTitle} />
              ) : (
                <div className="flex h-full items-center justify-center bg-slate-50 p-4">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={fileUrl} alt={fileTitle} className="max-h-full max-w-full rounded-lg object-contain" />
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="rounded-2xl bg-white p-6 shadow-2xl space-y-5">

            {/* Empty state */}
            {sessions.length === 0 && (
              <div className="py-8 text-center">
                <p className="text-2xl mb-2">📋</p>
                <p className="text-gray-500 font-medium">No results published yet.</p>
                <p className="text-sm text-gray-400">Please check back later.</p>
              </div>
            )}

            {/* Session selection */}
            {sessions.length > 0 && !selectedSession && (
              <>
                <div>
                  <h2 className="text-lg font-bold text-gray-900 mb-1">Select Session</h2>
                  <p className="text-sm text-gray-500">Choose your exam session to view results.</p>
                </div>
                <div className="space-y-2">
                  {sessions.map((session) => (
                    <button
                      key={session.id}
                      type="button"
                      onClick={() => handleSelectSession(session)}
                      className="w-full flex items-center justify-between rounded-xl border-2 border-slate-200 bg-slate-50 px-4 py-3 text-left hover:border-blue-400 hover:bg-blue-50 transition-all"
                    >
                      <div>
                        <p className="font-semibold text-gray-900">{session.title}</p>
                        <p className="text-xs text-slate-400">Session {session.slotNumber}</p>
                      </div>
                      <span className="text-blue-500 text-lg">→</span>
                    </button>
                  ))}
                </div>
              </>
            )}

            {/* Password entry */}
            {selectedSession && (
              <>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setSelectedSession(null)}
                    className="rounded-lg border px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50"
                  >
                    ← Back
                  </button>
                  <div>
                    <h2 className="font-bold text-gray-900">{selectedSession.title}</h2>
                    <p className="text-xs text-gray-400">Enter password to view</p>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-3">
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setError(""); }}
                    placeholder="Enter password"
                    required
                    autoFocus
                    className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                  />
                  {error && (
                    <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 border border-red-100">{error}</p>
                  )}
                  <button
                    type="submit"
                    disabled={loading || !password}
                    className="w-full rounded-xl bg-[#1e3a8a] py-3 font-semibold text-white hover:bg-blue-700 disabled:bg-gray-400 transition"
                  >
                    {loading ? "Verifying..." : "View Result"}
                  </button>
                </form>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
