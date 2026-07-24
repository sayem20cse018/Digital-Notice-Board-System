"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

type Props = {
  intervalSeconds?: number;
};

/**
 * Auto-refresh display board for real-time admin updates.
 * Uses a simple interval — NO window focus listener to avoid
 * triggering 16+ MongoDB queries every time a tab is switched.
 */
export default function DisplayRealtimeRefresh({ intervalSeconds = 60 }: Props) {
  const router = useRouter();

  useEffect(() => {
    // Minimum 60 seconds to avoid hammering the database
    const effectiveMs = Math.max(intervalSeconds, 60) * 1000;

    const id = setInterval(() => {
      router.refresh();
    }, effectiveMs);

    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [intervalSeconds]); // router excluded intentionally — it's stable but causes re-registration if included

  return null;
}
