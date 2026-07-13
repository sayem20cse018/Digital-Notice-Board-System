"use client";

import { useEffect, useRef } from "react";
import type { AboutUsItem } from "@/app/lib/store";

type Props = {
  data: AboutUsItem | null;
};

export default function AboutUsSection({ data }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const innerRef     = useRef<HTMLDivElement>(null);
  const animRef      = useRef<Animation | null>(null);

  useEffect(() => {
    if (!data) return;

    function startScroll() {
      const container = containerRef.current;
      const inner     = innerRef.current;
      if (!container || !inner) return;

      const containerH = container.clientHeight;
      const contentH   = inner.scrollHeight;

      // Cancel any running animation
      animRef.current?.cancel();
      animRef.current = null;

      if (contentH <= containerH + 4) return; // fits — no scroll needed

      const overflow  = contentH - containerH;
      // ~35 px/s — smooth, readable
      const duration  = Math.max((overflow / 35) * 1000, 3000);

      animRef.current = inner.animate(
        [
          { transform: "translateY(0px)" },
          { transform: `translateY(-${overflow}px)` },
        ],
        {
          duration,
          delay:      2000,      // pause at top
          endDelay:   2500,      // pause at bottom
          iterations: Infinity,
          direction:  "alternate",
          easing:     "linear",
        },
      );
    }

    // Use ResizeObserver so we re-measure when the card gets real dimensions
    const ro = new ResizeObserver(startScroll);
    if (containerRef.current) ro.observe(containerRef.current);
    if (innerRef.current)     ro.observe(innerRef.current);

    // Also try immediately
    startScroll();

    return () => {
      ro.disconnect();
      animRef.current?.cancel();
    };
  }, [data]);

  return (
    <article
      className="flex h-full w-full flex-col overflow-hidden rounded-xl bg-white border border-slate-200"
      style={{ boxShadow: "0 4px 20px rgba(0,0,0,0.10), 0 1px 4px rgba(0,0,0,0.06)" }}
    >
      {/* Fixed header */}
      <header className="flex-shrink-0 flex items-center bg-[#166534] px-4 py-2">
        <h3
          className="text-sm font-bold tracking-wide text-white"
          style={{ fontFamily: "var(--font-inter,'Inter',Arial,sans-serif)" }}
        >
          {data?.heading || "About Us"}
        </h3>
      </header>

      {/* Scroll viewport — overflow hidden, pointer-events none */}
      <div
        ref={containerRef}
        className="relative min-h-0 flex-1 overflow-hidden"
        style={{ pointerEvents: "none", userSelect: "none" }}
      >
        {/* Inner content — animated via translateY */}
        <div ref={innerRef} className="px-3 py-2">
          {!data ? (
            <p className="text-sm text-slate-400 text-center py-4">No content yet.</p>
          ) : (
            <>
              {data.imageUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={data.imageUrl}
                  alt={data.heading}
                  className="mb-2 w-full rounded-lg object-cover"
                  style={{ maxHeight: 90 }}
                />
              )}
              <p
                className="text-[11px] leading-relaxed text-slate-700"
                style={{
                  whiteSpace: "pre-wrap",
                  fontFamily: "var(--font-inter,'Inter',Arial,sans-serif)",
                }}
              >
                {data.body}
              </p>
            </>
          )}
        </div>
      </div>
    </article>
  );
}
