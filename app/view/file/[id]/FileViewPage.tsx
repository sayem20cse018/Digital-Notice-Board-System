"use client";

import { useState } from "react";

type Props = {
  title: string;
  fileUrl: string;
};

export default function FileViewPage({ title, fileUrl }: Props) {
  const [loaded, setLoaded] = useState(false);
  const lower = fileUrl.toLowerCase();
  const isPdf = lower.includes(".pdf") || lower.includes("application/pdf");
  const isImage =
    lower.includes(".jpg") ||
    lower.includes(".jpeg") ||
    lower.includes(".png") ||
    lower.includes(".webp") ||
    lower.includes(".gif") ||
    lower.includes("image/");

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-blue-900 to-indigo-900">
      {/* Header */}
      <div className="flex-shrink-0 bg-[#1e3a8a] px-4 py-3 flex items-center justify-between shadow-lg">
        <div>
          <h1 className="text-base font-bold text-white leading-tight">{title}</h1>
          <p className="text-xs text-blue-200 mt-0.5">CSE — GSTU</p>
        </div>
        <div className="flex items-center gap-2">
          <a
            href={fileUrl}
            download
            className="rounded-lg bg-white/15 px-3 py-1.5 text-xs font-semibold text-white hover:bg-white/25 transition"
          >
            ⬇ Download
          </a>
          <a
            href={fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg bg-white/15 px-3 py-1.5 text-xs font-semibold text-white hover:bg-white/25 transition"
          >
            Open ↗
          </a>
        </div>
      </div>

      {/* File content */}
      <div className="flex-1 overflow-hidden">
        {isPdf ? (
          <iframe
            src={fileUrl}
            className="h-[calc(100vh-56px)] w-full border-0"
            title={title}
            onLoad={() => setLoaded(true)}
          />
        ) : isImage ? (
          <div className="flex h-[calc(100vh-56px)] items-center justify-center p-4 bg-slate-900">
            {!loaded && (
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-white text-sm animate-pulse">Loading…</span>
              </div>
            )}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={fileUrl}
              alt={title}
              className="max-h-full max-w-full rounded-lg object-contain shadow-xl"
              onLoad={() => setLoaded(true)}
            />
          </div>
        ) : (
          /* Unknown type — show download prompt */
          <div className="flex h-[calc(100vh-56px)] flex-col items-center justify-center gap-6 p-8 text-center">
            <div className="rounded-2xl bg-white/10 p-8 max-w-sm w-full">
              <p className="text-5xl mb-4">📄</p>
              <h2 className="text-lg font-bold text-white mb-2">{title}</h2>
              <p className="text-sm text-blue-200 mb-6">This file cannot be previewed directly. Use the button below to open or download it.</p>
              <a
                href={fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full rounded-xl bg-white px-5 py-3 text-sm font-bold text-blue-900 hover:bg-blue-50 transition"
              >
                Open File ↗
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
