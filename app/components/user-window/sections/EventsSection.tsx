"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import type { EventsBoardItem } from "@/app/lib/store";

export default function EventsSection({ items }: { items: EventsBoardItem[] }) {
  const [idx, setIdx] = useState(0);
  const [sliding, setSliding] = useState(false);

  useEffect(() => {
    if (items.length <= 1) return;
    const t = setInterval(() => {
      setSliding(true);
      setTimeout(() => {
        setIdx((p) => (p + 1) % items.length);
        setSliding(false);
      }, 300);
    }, 4500);
    return () => clearInterval(t);
  }, [items.length]);

  const cur = items[idx];

  return (
    <article
      className="flex h-full w-full flex-col overflow-hidden rounded-xl bg-white border border-slate-200"
      style={{ boxShadow: "0 4px 20px rgba(0,0,0,0.09), 0 1px 4px rgba(0,0,0,0.05)" }}
    >
      {/* Header */}
      <header
        className="flex-shrink-0 flex items-center gap-2 px-3 py-2"
        style={{ background: "linear-gradient(135deg,#14532d,#16a34a)" }}
      >
        <span className="text-base leading-none">📅</span>
        <p className="text-xs font-bold uppercase tracking-wider text-white">Upcoming Events</p>
      </header>

      {/* Content */}
      <div
        className="flex flex-1 min-h-0 items-center gap-3 px-3 py-2 transition-all duration-300"
        style={{
          opacity: sliding ? 0 : 1,
          transform: sliding ? "translateX(24px)" : "translateX(0)",
        }}
      >
        {items.length === 0 ? (
          <p className="text-xs text-slate-400 w-full text-center">No upcoming events.</p>
        ) : (
          <>
            {cur?.imageUrl && (
              <div className="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded border border-slate-200">
                <Image
                  src={cur.imageUrl}
                  alt={cur.title}
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>
            )}

            <div className="min-w-0 flex-1">
              <p className="line-clamp-1 text-sm font-bold leading-snug text-slate-900">
                {cur?.title}
              </p>
              {(cur?.date || cur?.time || cur?.venue) && (
                <p className="mt-0.5 line-clamp-1 text-[10px] text-slate-500">
                  {[cur?.date, cur?.time, cur?.venue].filter(Boolean).join(" · ")}
                </p>
              )}
              {cur?.description && (
                <p className="mt-0.5 line-clamp-1 text-[10px] text-slate-400">
                  {cur.description}
                </p>
              )}
            </div>

            {items.length > 1 && (
              <div className="flex flex-col gap-1 flex-shrink-0">
                {items.map((_, i) => (
                  <span
                    key={i}
                    className={`block rounded-full transition-all ${
                      i === idx ? "h-3 w-1.5 bg-green-500" : "h-1.5 w-1.5 bg-slate-300"
                    }`}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </article>
  );
}
