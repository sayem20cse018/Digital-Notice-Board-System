"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import type { RightSidebarNotice, ProjectShowcaseItem, RoomDirectoryItem } from "@/app/lib/types";
import type { EventsBoardItem } from "@/app/lib/store";

/* ── Shared card shell ── */
function CardShell({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="flex h-full flex-1 min-w-0 flex-col overflow-hidden rounded-xl border border-slate-200 bg-white"
      style={{ boxShadow: "0 4px 20px rgba(0,0,0,0.09), 0 1px 4px rgba(0,0,0,0.05)" }}
    >
      {children}
    </div>
  );
}

/* ── Fixed section header ── */
function SectionHeader({ icon, title, bg = "#166534" }: { icon: string; title: string; bg?: string }) {
  return (
    <header
      className="flex-shrink-0 flex items-center gap-2 px-3 py-2"
      style={{ background: bg }}
    >
      <span className="text-base leading-none">{icon}</span>
      <p className="text-xs font-bold uppercase tracking-wider text-white">{title}</p>
    </header>
  );
}

/* ── Slide wrapper ── */
function SlideContent({ sliding, children }: { sliding: boolean; children: React.ReactNode }) {
  return (
    <div
      className="flex flex-1 min-h-0 items-center gap-3 px-3 py-2 transition-all duration-300"
      style={{
        opacity: sliding ? 0 : 1,
        transform: sliding ? "translateX(24px)" : "translateX(0)",
      }}
    >
      {children}
    </div>
  );
}

/* ─── Project Showcase ─── */
function ProjectShowcaseTile({ items }: { items: ProjectShowcaseItem[] }) {
  const [idx, setIdx] = useState(0);
  const [sliding, setSliding] = useState(false);
  useEffect(() => {
    if (items.length <= 1) return;
    const t = setInterval(() => {
      setSliding(true);
      setTimeout(() => { setIdx((p) => (p + 1) % items.length); setSliding(false); }, 300);
    }, 4000);
    return () => clearInterval(t);
  }, [items.length]);
  const cur = items[idx];

  return (
    <CardShell>
      <SectionHeader icon="🚀" title="Project Showcase" bg="linear-gradient(135deg,#1e3a8a,#2563eb)" />
      <SlideContent sliding={sliding}>
        {items.length === 0 ? (
          <p className="text-xs text-slate-400">No projects yet.</p>
        ) : (
          <>
            {cur?.imageUrl && (
              <div className="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded border border-slate-200">
                <Image src={cur.imageUrl} alt={cur.title} fill className="object-cover" unoptimized />
              </div>
            )}
            <p className="line-clamp-2 text-sm font-bold text-slate-900">{cur?.title}</p>
          </>
        )}
      </SlideContent>
    </CardShell>
  );
}

/* ─── Room Directory ─── */
function RoomDirectoryTile({ rooms }: { rooms: RoomDirectoryItem[] }) {
  const [idx, setIdx] = useState(0);
  const [sliding, setSliding] = useState(false);
  useEffect(() => {
    if (rooms.length <= 1) return;
    const t = setInterval(() => {
      setSliding(true);
      setTimeout(() => { setIdx((p) => (p + 1) % rooms.length); setSliding(false); }, 300);
    }, 3500);
    return () => clearInterval(t);
  }, [rooms.length]);
  const cur = rooms[idx];

  return (
    <CardShell>
      <SectionHeader icon="🗺️" title="Room Directory" bg="linear-gradient(135deg,#0f766e,#0d9488)" />
      <SlideContent sliding={sliding}>
        {rooms.length === 0 ? (
          <p className="text-xs text-slate-400">No rooms added.</p>
        ) : (
          <>
            <div className="min-w-0 flex-1">
              <p className="line-clamp-1 text-sm font-bold text-slate-900">{cur?.roomName}</p>
              {cur?.floor && <p className="text-[10px] text-slate-500">{cur.floor}</p>}
            </div>
            {cur?.qrCodeUrl && (
              <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
                <Image src={cur.qrCodeUrl} alt="Room QR" fill className="object-contain p-0.5" unoptimized />
              </div>
            )}
          </>
        )}
      </SlideContent>
    </CardShell>
  );
}

/* ─── Events Board ─── */
function EventsBoardTile({ items }: { items: EventsBoardItem[] }) {
  const [idx, setIdx] = useState(0);
  const [sliding, setSliding] = useState(false);
  useEffect(() => {
    if (items.length <= 1) return;
    const t = setInterval(() => {
      setSliding(true);
      setTimeout(() => { setIdx((p) => (p + 1) % items.length); setSliding(false); }, 300);
    }, 4500);
    return () => clearInterval(t);
  }, [items.length]);
  const cur = items[idx];

  return (
    <CardShell>
      <SectionHeader icon="📅" title="Upcoming Events" bg="linear-gradient(135deg,#14532d,#16a34a)" />
      <SlideContent sliding={sliding}>
        {items.length === 0 ? (
          <p className="text-xs text-slate-400">No upcoming events.</p>
        ) : (
          <>
            {cur?.imageUrl && (
              <div className="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded border border-slate-200">
                <Image src={cur.imageUrl} alt={cur.title} fill className="object-cover" unoptimized />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="line-clamp-1 text-sm font-bold text-slate-900">{cur?.title}</p>
              {(cur?.date || cur?.time || cur?.venue) && (
                <p className="mt-0.5 line-clamp-1 text-[10px] text-slate-500">
                  {[cur?.date, cur?.time, cur?.venue].filter(Boolean).join(" · ")}
                </p>
              )}
              {cur?.description && (
                <p className="mt-0.5 line-clamp-1 text-[10px] text-slate-400">{cur.description}</p>
              )}
            </div>
            {items.length > 1 && (
              <div className="flex flex-col gap-1 flex-shrink-0">
                {items.map((_, i) => (
                  <span key={i} className={`block rounded-full transition-all ${i === idx ? "h-3 w-1.5 bg-green-500" : "h-1.5 w-1.5 bg-slate-300"}`} />
                ))}
              </div>
            )}
          </>
        )}
      </SlideContent>
    </CardShell>
  );
}

/* ─── Voice Announcement ─── */
function VoiceAnnouncementTile({ notices }: { notices: RightSidebarNotice[] }) {
  const [speaking, setSpeaking] = useState(false);
  const latest = notices.filter((n) => n.published)[0];

  function announce() {
    if (!latest || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(latest.title);
    u.lang = "bn-BD"; u.rate = 0.9;
    u.onstart = () => setSpeaking(true);
    u.onend = () => setSpeaking(false);
    u.onerror = () => setSpeaking(false);
    window.speechSynthesis.speak(u);
  }

  return (
    <CardShell>
      <SectionHeader icon="🔊" title="Voice Announcement" bg="linear-gradient(135deg,#92400e,#d97706)" />
      <div className="flex flex-1 min-h-0 items-center gap-3 px-3 py-2">
        {latest ? (
          <>
            <p className="line-clamp-2 flex-1 text-sm font-bold text-slate-900">{latest.title}</p>
            <button
              onClick={announce}
              disabled={speaking}
              className="flex-shrink-0 rounded-md bg-[#1e3a8a] px-3 py-1 text-[10px] font-bold text-white hover:bg-blue-700 disabled:opacity-50 transition"
            >
              {speaking ? "Speaking…" : "▶ Play"}
            </button>
          </>
        ) : (
          <p className="text-xs text-slate-400">No announcement yet.</p>
        )}
      </div>
    </CardShell>
  );
}

/* ─── Main ─── */
type Props = {
  showcaseItems: ProjectShowcaseItem[];
  notices: RightSidebarNotice[];
  rooms: RoomDirectoryItem[];
  events?: EventsBoardItem[];
  showShowcase?: boolean;
  showRooms?: boolean;
  showVoice?: boolean;
  showEvents?: boolean;
};

export default function BottomFeaturesRow({
  showcaseItems,
  notices,
  rooms,
  events = [],
  showShowcase = true,
  showRooms = true,
  showVoice = true,
  showEvents = true,
}: Props) {
  return (
    <div className="flex h-full w-full gap-2">
      {showShowcase && <ProjectShowcaseTile items={showcaseItems} />}
      {showRooms    && <RoomDirectoryTile rooms={rooms} />}
      {showEvents   && <EventsBoardTile items={events} />}
      {showVoice    && <VoiceAnnouncementTile notices={notices} />}
    </div>
  );
}
