"use client";

import { useState } from "react";

type Props = {
  title: string;
  fileUrl: string;
};

function detectFileType(url: string): "pdf" | "image" | "unknown" {
  const lower = url.toLowerCase();

  // Check extension
  if (lower.includes(".pdf")) return "pdf";
  if (
    lower.includes(".jpg") ||
    lower.includes(".jpeg") ||
    lower.includes(".png") ||
    lower.includes(".webp") ||
    lower.includes(".gif") ||
    lower.includes(".svg") ||
    lower.includes(".bmp")
  ) return "image";

  // Cloudinary URL patterns
  // e.g. https://res.cloudinary.com/xxx/image/upload/... → image
  // e.g. https://res.cloudinary.com/xxx/raw/upload/... → could be pdf
  if (lower.includes("cloudinary.com")) {
    if (lower.includes("/image/upload/")) return "image";
    if (lower.includes("/raw/upload/")) return "pdf"; // treat raw as pdf/downloadable
    if (lower.includes("/video/upload/")) return "unknown";
    // Default cloudinary to image if no other match
    return "image";
  }

  // Check query params or path segments for type hints
  if (lower.includes("type=pdf") || lower.includes("format=pdf")) return "pdf";
  if (lower.includes("type=image") || lower.includes("format=jpg") || lower.includes("format=png")) return "image";

  return "unknown";
}

export default function FileViewPage({ title, fileUrl }: Props) {
  const [imgError, setImgError] = useState(false);
  const fileType = detectFileType(fileUrl);

  return (
    <div className="flex min-h-screen flex-col" style={{ background: "#0f172a" }}>

      {/* Header */}
      <div className="flex-shrink-0 bg-[#1e3a8a] px-4 py-3 flex items-center justify-between shadow-lg">
        <div className="min-w-0 flex-1 mr-3">
          <h1 className="text-base font-bold text-white leading-tight truncate">{title}</h1>
          <p className="text-xs text-blue-200 mt-0.5">CSE — GSTU</p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <a
            href={fileUrl}
            download
            className="rounded-lg bg-white/20 px-3 py-1.5 text-xs font-semibold text-white hover:bg-white/30 transition"
          >
            ⬇ Save
          </a>
          <a
            href={fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg bg-white/20 px-3 py-1.5 text-xs font-semibold text-white hover:bg-white/30 transition"
          >
            Open ↗
          </a>
        </div>
      </div>

      {/* File content */}
      <div className="flex-1 overflow-hidden">

        {/* PDF — mobile browsers block PDF iframes; show viewer with direct open */}
        {fileType === "pdf" && (
          <PdfView title={title} fileUrl={fileUrl} />
        )}

        {/* Image */}
        {fileType === "image" && !imgError && (
          <div
            className="flex items-center justify-center p-3"
            style={{ minHeight: "calc(100vh - 56px)", background: "#1e293b" }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={fileUrl}
              alt={title}
              style={{ maxHeight: "calc(100vh - 80px)", maxWidth: "100%", borderRadius: 12, objectFit: "contain" }}
              onError={() => setImgError(true)}
            />
          </div>
        )}

        {/* Image load error — fallback to open link */}
        {fileType === "image" && imgError && (
          <FallbackView title={title} fileUrl={fileUrl} />
        )}

        {/* Unknown — show prominent open button */}
        {fileType === "unknown" && (
          <FallbackView title={title} fileUrl={fileUrl} />
        )}

      </div>
    </div>
  );
}

function PdfView({ title, fileUrl }: { title: string; fileUrl: string }) {
  return (
    <div
      className="flex flex-col items-center justify-center gap-5 p-6 text-center"
      style={{ minHeight: "calc(100vh - 56px)" }}
    >
      <div
        className="rounded-2xl p-8 w-full max-w-sm"
        style={{ background: "rgba(255,255,255,0.08)" }}
      >
        <p className="text-6xl mb-4">📑</p>
        <h2 className="text-lg font-bold text-white mb-1">{title}</h2>
        <p className="text-xs mb-6" style={{ color: "#93c5fd" }}>PDF Document</p>
        <a
          href={fileUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-full rounded-xl bg-white px-5 py-3.5 text-sm font-bold transition mb-3"
          style={{ color: "#1e3a8a" }}
        >
          👁 View PDF
        </a>
        <a
          href={fileUrl}
          download
          className="flex items-center justify-center gap-2 w-full rounded-xl border-2 px-5 py-3 text-sm font-semibold transition"
          style={{ borderColor: "rgba(255,255,255,0.3)", color: "white" }}
        >
          ⬇ Download PDF
        </a>
      </div>
    </div>
  );
}

function FallbackView({ title, fileUrl }: { title: string; fileUrl: string }) {
  return (
    <div
      className="flex flex-col items-center justify-center gap-5 p-6 text-center"
      style={{ minHeight: "calc(100vh - 56px)" }}
    >
      <div
        className="rounded-2xl p-8 w-full max-w-sm"
        style={{ background: "rgba(255,255,255,0.08)" }}
      >
        <p className="text-5xl mb-4">📄</p>
        <h2 className="text-lg font-bold text-white mb-2">{title}</h2>
        <p className="text-sm mb-6" style={{ color: "#93c5fd" }}>
          Tap the button below to view or download this file.
        </p>
        <a
          href={fileUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full rounded-xl bg-white px-5 py-3.5 text-sm font-bold transition"
          style={{ color: "#1e3a8a" }}
        >
          Open File ↗
        </a>
        <a
          href={fileUrl}
          download
          className="block w-full mt-3 rounded-xl border-2 px-5 py-3 text-sm font-semibold transition"
          style={{ borderColor: "rgba(255,255,255,0.3)", color: "white" }}
        >
          ⬇ Download
        </a>
      </div>
    </div>
  );
}
