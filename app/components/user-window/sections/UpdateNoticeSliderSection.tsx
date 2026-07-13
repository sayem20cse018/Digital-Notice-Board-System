"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import type { RightSidebarNotice } from "@/app/lib/types";

export default function UpdateNoticeSliderSection({ items }: { items: RightSidebarNotice[] }) {
  const published = items
    .filter((n) => n.published)
    .sort((a, b) => a.displayOrder - b.displayOrder);

  const [idx, setIdx] = useState(0);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    if (published.length <= 1) return;
    const t = setInterval(() => {
      setFading(true);
      setTimeout(() => { setIdx((p) => (p + 1) % published.length); setFading(false); }, 300);
    }, 4500);
    return () => clearInterval(t);
  }, [published.length]);

  const cur = published[idx];

  return (
    <article className="flex h-full w-full flex-col overflow-hidden rounded-xl bg-white shadow-lg border border-slate-200" style={{ boxShadow: "0 4px 20px rgba(0,0,0,0.10), 0 1px 4px rgba(0,0,0,0.06)" }}>

      {/* ── FIXED section header ── */}
      <header className="flex-shrink-0 flex items-center justify-between bg-[#166534] px-4 py-2">
        <h3
          className="text-sm font-bold tracking-wide text-white"
          style={{ fontFamily: "var(--font-inter, Arial, sans-serif)" }}
        >
          Update Notice
        </h3>
      </header>

      {/* ── ANIMATED content ── */}
      <div
        className="flex flex-1 min-h-0 items-center gap-3 px-3 py-2 transition-all duration-300"
        style={{
          opacity: fading ? 0 : 1,
          transform: fading ? "translateX(20px)" : "translateX(0)",
        }}
      >
        {published.length === 0 ? (
          <p className="text-sm text-slate-400 w-full text-center">No notices yet.</p>
        ) : (
          <>
            {/* Icon/Image */}
            {cur?.imageUrl ? (
              <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-full border-2 border-orange-400 shadow-md">
                <Image src={cur.imageUrl} alt={cur.title} fill className="object-cover" unoptimized />
              </div>
            ) : (
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full border-2 border-orange-300 bg-orange-50 shadow-md">
                <span className="text-xl">📢</span>
              </div>
            )}

            {/* Text */}
            <div className="min-w-0 flex-1">
              <p className="line-clamp-2 text-sm font-bold leading-snug text-slate-900">
                {cur?.title}
              </p>
            </div>

            {/* Dots */}
            {published.length > 1 && (
              <div className="flex flex-col gap-1 flex-shrink-0">
                {published.map((_, i) => (
                  <span key={i} className={`block rounded-full transition-all ${i === idx ? "h-3 w-1.5 bg-orange-500" : "h-1.5 w-1.5 bg-slate-300"}`} />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </article>
  );
}
