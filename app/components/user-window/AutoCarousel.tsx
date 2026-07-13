"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { getHighlightTextScale, lineClampClass } from "@/app/lib/highlight-text-scale";

type Item = {
  id: string;
  imageUrl?: string | null;
  title: string;
  description?: string | null;
  linkUrl?: string | null;
  slideDuration?: number | null;
};

type Props = {
  items: Item[];
  defaultInterval?: number;
  variant?: "default" | "hero" | "hero-split";
  readOnly?: boolean;
};

export default function AutoCarousel({
  items,
  defaultInterval = 5,
  variant = "default",
  readOnly = true,
}: Props) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [animating, setAnimating] = useState(false);
  const isHero = variant === "hero";
  const isHeroSplit = variant === "hero-split";

  const goTo = useCallback((idx: number) => {
    if (readOnly) return;
    setAnimating(true);
    setTimeout(() => {
      setCurrentIndex(idx);
      setAnimating(false);
    }, 400);
  }, [readOnly]);

  useEffect(() => {
    if (items.length <= 1) return;

    const duration = (items[currentIndex]?.slideDuration || defaultInterval) * 1000;
    const timer = setTimeout(() => {
      setAnimating(true);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % items.length);
        setAnimating(false);
      }, 400);
    }, duration);

    return () => clearTimeout(timer);
  }, [items, currentIndex, defaultInterval]);

  if (items.length === 0) return null;

  const currentItem = items[currentIndex];
  const textScale = getHighlightTextScale(currentItem.title, currentItem.description);

  if (isHeroSplit) {
    return (
      <div className="relative h-full w-full overflow-hidden rounded-xl bg-slate-900">

        {/* ── Full-bleed image with slide transition ── */}
        {items.map((item, i) => (
          <div
            key={item.id}
            className="absolute inset-0 transition-all duration-700"
            style={{
              opacity: i === currentIndex ? 1 : 0,
              transform: i === currentIndex
                ? "scale(1)"
                : animating
                  ? "scale(1.03)"
                  : "scale(1)",
              zIndex: i === currentIndex ? 1 : 0,
            }}
          >
            {item.imageUrl ? (
              <Image
                src={item.imageUrl}
                alt={item.title}
                fill
                className="object-cover"
                unoptimized
                priority={i === 0}
              />
            ) : (
              <div className="h-full w-full bg-gradient-to-br from-[#0f172a] via-[#1e3a8a] to-[#312e81]" />
            )}
          </div>
        ))}

        {/* ── Vignette overlay ── */}
        <div className="pointer-events-none absolute inset-0 z-10" style={{
          background: "linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.2) 50%, rgba(0,0,0,0.1) 100%)"
        }} />

        {/* ── Title + description — slides in with content ── */}
        <div
          className="absolute inset-x-0 bottom-0 z-20 px-5 pb-5 pt-10 transition-all duration-500"
          style={{
            opacity: animating ? 0 : 1,
            transform: animating ? "translateY(8px)" : "translateY(0)",
          }}
        >
          <h3
            className="text-lg font-extrabold leading-tight text-white md:text-xl lg:text-2xl"
            style={{
              fontFamily: "var(--font-inter,'Inter',Arial,sans-serif)",
              textShadow: "0 2px 12px rgba(0,0,0,0.9)",
              letterSpacing: "-0.01em",
            }}
          >
            {currentItem.title}
          </h3>
          {currentItem.description && (
            <p
              className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-white/90 md:text-base"
              style={{
                fontFamily: "var(--font-inter,'Inter',Arial,sans-serif)",
                textShadow: "0 1px 6px rgba(0,0,0,0.8)",
                fontWeight: 400,
              }}
            >
              {currentItem.description}
            </p>
          )}
        </div>

        {/* ── Slide counter — top right ── */}
        {items.length > 1 && (
          <div className="absolute right-3 top-3 z-20">
            <span className="rounded-full bg-black/40 px-2.5 py-1 text-[10px] font-semibold text-white/80 backdrop-blur-sm">
              {currentIndex + 1} / {items.length}
            </span>
          </div>
        )}

        {/* ── Dot indicators ── */}
        {items.length > 1 && (
          <div className="absolute bottom-2 left-0 right-0 z-30 flex justify-center gap-1.5 pb-1">
            {items.map((_, i) => (
              <span
                key={i}
                className="block rounded-full transition-all duration-300"
                style={{
                  width: i === currentIndex ? 20 : 6,
                  height: 6,
                  background: i === currentIndex ? "#ffffff" : "rgba(255,255,255,0.35)",
                }}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex h-full w-full flex-col">
      <div
        className={`highlight-carousel-slide relative flex h-full w-full flex-col overflow-hidden ${
          isHero
            ? "display-highlight-hero rounded-xl"
            : "max-w-3xl rounded-xl border-2 border-blue-500/80"
        } bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 shadow-[0_8px_32px_rgba(30,58,138,0.35)] ${
          animating ? "carousel-slide-exit" : "carousel-slide-enter"
        }`}
        style={isHero ? { background: "var(--display-highlight-bg)" } : undefined}
      >
        {currentItem.imageUrl ? (
          <div className={`relative min-h-0 overflow-hidden ${isHero ? "flex-[4]" : "flex-1"}`}>
            <Image
              src={currentItem.imageUrl}
              alt={currentItem.title}
              fill
              className={isHero ? "object-contain p-3 md:p-6" : "object-contain p-2"}
              unoptimized
              priority
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent" />
          </div>
        ) : (
          <div className={`min-h-0 bg-gradient-to-br from-blue-800/40 to-indigo-900/60 ${isHero ? "flex-[4]" : "flex-1"}`} />
        )}

        <div
          className={`highlight-carousel-caption flex-shrink-0 border-t border-white/10 bg-slate-950/90 backdrop-blur-sm ${
            isHero ? "px-4 py-3 md:px-6 md:py-4" : "px-3 py-2.5"
          }`}
        >
          <div className="mb-1.5 flex items-center gap-2">
            <span
              className={`rounded-full bg-amber-400/90 font-bold uppercase tracking-wider text-slate-900 ${
                isHero ? "px-3 py-1 text-xs" : "px-2 py-0.5 text-[9px]"
              }`}
            >
              Highlight
            </span>
            {items.length > 1 && (
              <span className={`text-blue-200/80 ${isHero ? "text-sm" : "text-[10px]"}`}>
                {currentIndex + 1} / {items.length}
              </span>
            )}
          </div>
          <h3
            className={`${isHero ? "text-xl md:text-2xl lg:text-3xl" : textScale.titleClass} ${lineClampClass(isHero ? 2 : textScale.titleLines)} text-center font-bold leading-snug text-white drop-shadow-md`}
          >
            {currentItem.title}
          </h3>
          {currentItem.description && (
            <p
              className={`${isHero ? "text-base md:text-lg" : textScale.descClass} ${lineClampClass(isHero ? 3 : textScale.descLines)} mt-1.5 text-center leading-snug text-blue-100/95`}
            >
              {currentItem.description}
            </p>
          )}
        </div>
      </div>

      {items.length > 1 && (
        <div className={`flex justify-center gap-1.5 ${isHero ? "mt-2" : "mt-1.5"}`} aria-hidden="true">
          {items.map((_, idx) =>
            readOnly ? (
              <span
                key={idx}
                className={`rounded-full ${
                  idx === currentIndex
                    ? `bg-[var(--display-accent,#2563eb)] ${isHero ? "h-2 w-8" : "h-1.5 w-4"}`
                    : `${isHero ? "h-2 w-2" : "h-1.5 w-1.5"} bg-gray-400/60`
                }`}
              />
            ) : (
              <button
                key={idx}
                type="button"
                onClick={() => goTo(idx)}
                className={`rounded-full transition-all duration-300 ${
                  idx === currentIndex
                    ? `bg-[var(--display-accent,#2563eb)] ${isHero ? "h-2 w-8" : "h-1.5 w-4"}`
                    : `${isHero ? "h-2 w-2" : "h-1.5 w-1.5"} bg-gray-400/60 hover:bg-gray-300`
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ),
          )}
        </div>
      )}
    </div>
  );
}
