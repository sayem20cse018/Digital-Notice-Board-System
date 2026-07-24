"use client";

import { useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";

type Props = {
  intervalSeconds?: number;
};

/** Auto-refresh display board for real-time admin updates. */
export default function DisplayRealtimeRefresh({ intervalSeconds = 60 }: Props) {
  const router = useRouter();
  const lastRefreshRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const refreshNow = useCallback(() => {
    const now = Date.now();
    // Debounce — don't refresh more than once per 5 seconds
    if (now - lastRefreshRef.current < 5000) return;
    lastRefreshRef.current = now;
    router.refresh();
  }, [router]);

  useEffect(() => {
    if (intervalSeconds <= 0) return;

    // Use the larger of the provided interval or 30 seconds minimum
    const effectiveInterval = Math.max(intervalSeconds, 30) * 1000;

    timerRef.current = window.setInterval(refreshNow, effectiveInterval);
    window.addEventListener("focus", refreshNow);

    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
      window.removeEventListener("focus", refreshNow);
    };
  }, [intervalSeconds, refreshNow]);

  return null;
}
