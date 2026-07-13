"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

type Props = {
  intervalSeconds?: number;
};

/** Auto-refresh display board for real-time admin updates. */
export default function DisplayRealtimeRefresh({ intervalSeconds = 15 }: Props) {
  const router = useRouter();
  const lastRefreshRef = useRef(0);

  useEffect(() => {
    const refreshNow = () => {
      const now = Date.now();
      if (now - lastRefreshRef.current < 1000) return;
      lastRefreshRef.current = now;
      router.refresh();
    };

    if (intervalSeconds <= 0) return;

    const timer = window.setInterval(refreshNow, intervalSeconds * 1000);
    window.addEventListener("focus", refreshNow);

    return () => {
      window.clearInterval(timer);
      window.removeEventListener("focus", refreshNow);
    };
  }, [intervalSeconds, router]);

  return null;
}
