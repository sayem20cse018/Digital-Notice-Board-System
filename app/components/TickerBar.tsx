"use client";

import { useEffect, useRef } from "react";
import type { RightSidebarNotice } from "@/app/lib/types";

type Props = {
  welcome: string;
  notices: RightSidebarNotice[];
};

function TickerLane({ text, color = "text-white", speed = 80 }: { text: string; color?: string; speed?: number }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const spanRef = useRef<HTMLSpanElement>(null);
  const animRef = useRef<Animation | null>(null);

  useEffect(() => {
    function start() {
      const wrap = wrapRef.current;
      const span = spanRef.current;
      if (!wrap || !span) return;
      animRef.current?.cancel();
      const containerW = wrap.offsetWidth;
      const textW = span.scrollWidth;
      const totalDist = containerW + textW;
      const durationMs = (totalDist / speed) * 1000;
      animRef.current = span.animate(
        [
          { transform: `translateX(${containerW}px)` },
          { transform: `translateX(${-textW}px)` },
        ],
        { duration: durationMs, iterations: Infinity, easing: "linear" },
      );
    }
    start();
    const ro = new ResizeObserver(start);
    if (wrapRef.current) ro.observe(wrapRef.current);
    return () => { ro.disconnect(); animRef.current?.cancel(); };
  }, [text, speed]);

  return (
    <div ref={wrapRef} className="relative overflow-hidden flex-1 h-full min-w-0">
      <span
        ref={spanRef}
        className={`absolute top-1/2 -translate-y-1/2 whitespace-nowrap text-[0.72rem] font-semibold tracking-wide ${color}`}
      >
        {text}
      </span>
    </div>
  );
}

export default function TickerBar({ welcome, notices }: Props) {
  const published = notices.filter((n) => n.published);

  const emergency = published.find(
    (n) =>
      n.title.startsWith("⚠") ||
      n.title.toLowerCase().includes("emergency") ||
      n.title.toLowerCase().includes("জরুরি"),
  ) ?? null;

  const hasEmergency = Boolean(emergency);
  const emergencyText = emergency?.title ?? "No Emergency Notice Available";

  // Repeat text 3× for seamless loop
  const welcomeText = `${welcome}     •     ${welcome}     •     ${welcome}`;
  const noticeText = hasEmergency
    ? `${emergencyText}     •     ${emergencyText}     •     ${emergencyText}`
    : `Emergency Notice: ${emergencyText}     •     Emergency Notice: ${emergencyText}`;

  return (
    <div className="display-ticker-bar flex-shrink-0 w-full flex items-stretch" style={{ minHeight: 34 }}>

      {/* ── LEFT: scrolling welcome text (no fixed label) ── */}
      <div className="display-ticker-welcome flex items-center min-w-0 overflow-hidden" style={{ flex: 1 }}>
        <TickerLane text={welcomeText} color="text-white" speed={65} />
      </div>

      {/* Divider */}
      <div className="w-px bg-white/20 flex-shrink-0" />

      {/* ── RIGHT: scrolling emergency text (no fixed label) ── */}
      <div
        className={`flex items-center min-w-0 overflow-hidden transition-colors duration-500 ${
          hasEmergency ? "bg-red-600 emergency-flash" : "bg-[#1a2a5e]"
        }`}
        style={{ flex: 1 }}
      >
        <TickerLane
          text={noticeText}
          color={hasEmergency ? "text-white font-bold" : "text-red-300"}
          speed={55}
        />
      </div>
    </div>
  );
}
