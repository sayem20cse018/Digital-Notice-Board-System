"use client";

import { useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";

type Props = {
  intervalSeconds?: number;
};

/** Auto-refresh display board for real-time admin updates. */
export default function DisplayRealtimeRefresh({ intervalSeconds = 60 }: Props) {
  const router = useRouter();

  const refresh = useCallback(() => {
    router.refresh();
  }, [router]);

  useEffect(() => {
    if (intervalSeconds <= 0) return;

    const effectiveMs = Math.max(intervalSeconds, 30) * 1000;
    const id = setInterval(refresh, effectiveMs);
    window.addEventListener("focus", refresh);

    return () => {
      clearInterval(id);
      window.removeEventListener("focus", refresh);
    };
  }, [intervalSeconds, refresh]);

  return null;
}
