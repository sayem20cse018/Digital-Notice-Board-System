"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";

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
};

export default function AutoCarousel({ items, defaultInterval = 5 }: Props) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [animating, setAnimating] = useState(false);

  const goTo = useCallback((idx: number) => {
    setAnimating(true);
    setTimeout(() => {
      setCurrentIndex(idx);
      setAnimating(false);
    }, 400);
  }, []);

  useEffect(() => {
    if (items.length <= 1) return;

    const duration = (items[currentIndex]?.slideDuration || defaultInterval) * 1000;
    const timer = setTimeout(() => {
      goTo((currentIndex + 1) % items.length);
    }, duration);

    return () => clearTimeout(timer);
  }, [items, currentIndex, defaultInterval, goTo]);

  if (items.length === 0) return null;

  const currentItem = items[currentIndex];

  return (
    <div className="flex h-full w-full flex-col items-center">
      <div
        className={`relative flex h-full w-full max-w-2xl items-center justify-center overflow-hidden rounded-lg border-4 border-blue-600 bg-white shadow-2xl ${
          animating ? "carousel-slide-exit" : "carousel-slide-enter"
        }`}
      >
        {currentItem.imageUrl && (
          <div className="relative flex h-full w-full items-center justify-center p-2">
            <Image
              src={currentItem.imageUrl}
              alt={currentItem.title}
              fill
              className="object-contain"
              unoptimized
            />
          </div>
        )}
        <div className="absolute right-0 bottom-0 left-0 bg-gradient-to-t from-black/90 via-black/70 to-transparent p-3">
          <h3 className="mb-1 line-clamp-1 text-center text-base font-bold text-white drop-shadow-lg md:text-lg">
            {currentItem.title}
          </h3>
          {currentItem.description && (
            <p className="line-clamp-1 text-center text-xs text-white/95 drop-shadow-md">
              {currentItem.description}
            </p>
          )}
        </div>
      </div>
      {items.length > 1 && (
        <div className="mt-2 flex justify-center gap-1.5">
          {items.map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => goTo(idx)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                idx === currentIndex ? "w-5 bg-blue-600" : "w-1.5 bg-gray-300"
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
