"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  DISPLAY_SECTIONS,
  ADMIN_THEMES,
  type AdminPreferences,
  type SectionKey,
  type AdminThemeId,
} from "@/app/lib/display-config";
import { useAdminI18n } from "./AdminI18nProvider";
import AdminFlashMessage from "./AdminFlashMessage";

type Props = {
  initialPreferences: AdminPreferences;
  contentSummary: {
    alumni: number;
    programmers: number;
    news: number;
    researchers: number;
    notices: number;
    results: number;
    help: number;
  };
  mediaUrls: string[];
  userRole?: "super" | "editor" | "viewer";
};

const QR_STORAGE_KEY = "notis_qr_analytics";

type QrEvent = { type: string; id: string; title: string; scannedAt: string };

function loadQrAnalytics(): QrEvent[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(QR_STORAGE_KEY) ?? "[]");
  } catch {
    return [];
  }
}

function saveQrAnalytics(events: QrEvent[]) {
  localStorage.setItem(QR_STORAGE_KEY, JSON.stringify(events.slice(-200)));
}

export default function ControlCenterClient({
  initialPreferences,
  contentSummary,
  mediaUrls,
  userRole = "super",
}: Props) {
  const { t, lang, setLang } = useAdminI18n();
  const [prefs, setPrefs] = useState(initialPreferences);
  const [saving, setSaving] = useState(false);
  const [toggleSaving, setToggleSaving] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [previewKey, setPreviewKey] = useState(0);
  const [qrEvents, setQrEvents] = useState<QrEvent[]>([]);
  const [aiSummary, setAiSummary] = useState("");
  const [voiceListening, setVoiceListening] = useState(false);
  const [announcementText, setAnnouncementText] = useState("");
  const speechRef = useRef<SpeechSynthesisUtterance | null>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    setQrEvents(loadQrAnalytics());
  }, []);

  const activeCount = Object.values(prefs.sectionVisibility).filter(Boolean).length;
  const todayScans = qrEvents.filter((e) => {
    const d = new Date(e.scannedAt);
    const now = new Date();
    return d.toDateString() === now.toDateString();
  }).length;

  const canEdit = userRole !== "viewer";

  async function handleSave() {
    if (!canEdit) return;
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch("/api/display-settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(prefs),
      });
      const data = await res.json();
      setMessage({
        type: data.success ? "success" : "error",
        text: data.message ?? (data.success ? "Saved!" : "Failed"),
      });
      if (data.success) {
        setPreviewKey((k) => k + 1);
        document.documentElement.setAttribute("data-admin-theme", prefs.adminTheme);
      }
    } catch {
      setMessage({ type: "error", text: "Network error" });
    } finally {
      setSaving(false);
    }
  }

  function toggleSection(key: SectionKey) {
    if (!canEdit) return;
    const newPrefs = {
      ...prefs,
      sectionVisibility: {
        ...prefs.sectionVisibility,
        [key]: !prefs.sectionVisibility[key],
      },
    };
    setPrefs(newPrefs);

    // Auto-save immediately
    setToggleSaving(key);
    fetch("/api/display-settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newPrefs),
    })
      .then((r) => r.json())
      .then((data) => {
        if (!data.success) setMessage({ type: "error", text: "Failed to save toggle" });
      })
      .catch(() => setMessage({ type: "error", text: "Network error saving toggle" }))
      .finally(() => setToggleSaving(null));
  }

  function setAdminTheme(theme: AdminThemeId) {
    if (!canEdit) return;
    setPrefs((p) => ({ ...p, adminTheme: theme }));
    document.documentElement.setAttribute("data-admin-theme", theme);
  }

  function speakAnnouncement() {
    if (!announcementText.trim()) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(announcementText);
    utterance.lang = lang === "bn" ? "bn-BD" : "en-US";
    utterance.rate = 0.9;
    speechRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  }

  function stopSpeech() {
    window.speechSynthesis.cancel();
  }

  const generateAISummary = useCallback(() => {
    const parts = [
      `Department display has ${activeCount} active sections.`,
      `${contentSummary.news} highlight news items, ${contentSummary.alumni} alumni, ${contentSummary.programmers} programmers.`,
      `${contentSummary.researchers} researchers, ${contentSummary.notices} notices, ${contentSummary.results} result slots.`,
      `${contentSummary.help} help center entries.`,
      qrEvents.length > 0
        ? `QR codes scanned ${qrEvents.length} times total (${todayScans} today).`
        : "No QR scans recorded yet.",
      `Display refreshes every ${prefs.realtimeRefreshSeconds} seconds.`,
    ];
    setAiSummary(parts.join(" "));
  }, [activeCount, contentSummary, qrEvents.length, todayScans, prefs.realtimeRefreshSeconds]);

  function startVoiceCommand() {
    type SRConstructor = new () => SpeechRecognition;
    const SR: SRConstructor | undefined =
      (window as unknown as { SpeechRecognition?: SRConstructor; webkitSpeechRecognition?: SRConstructor })
        .SpeechRecognition ??
      (window as unknown as { webkitSpeechRecognition?: SRConstructor }).webkitSpeechRecognition;

    if (!SR) {
      setMessage({ type: "error", text: "Voice commands not supported in this browser." });
      return;
    }

    const recognition = new SR();
    recognition.lang = lang === "bn" ? "bn-BD" : "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => setVoiceListening(true);
    recognition.onend = () => setVoiceListening(false);
    recognition.onerror = () => setVoiceListening(false);

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const transcript = event.results[0][0].transcript.toLowerCase();
      if (transcript.includes("news") || transcript.includes("highlight")) {
        window.location.href = "/admin/highlight-news";
      } else if (transcript.includes("setting")) {
        window.location.href = "/admin/settings";
      } else if (transcript.includes("preview") || transcript.includes("display")) {
        window.open("/", "_blank");
      } else if (transcript.includes("dashboard") || transcript.includes("home")) {
        window.location.href = "/admin";
      } else if (transcript.includes("alumni")) {
        window.location.href = "/admin/best-alumni";
      } else if (transcript.includes("notice")) {
        window.location.href = "/admin/right-sidebar-notice";
      } else {
        setMessage({ type: "error", text: `Unknown command: "${transcript}"` });
      }
    };

    recognitionRef.current = recognition;
    recognition.start();
  }

  function simulateQrScan(type: string, id: string, title: string) {
    const event: QrEvent = { type, id, title, scannedAt: new Date().toISOString() };
    const next = [...loadQrAnalytics(), event];
    saveQrAnalytics(next);
    setQrEvents(next);
    fetch("/api/analytics/qr-scan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(event),
    }).catch(() => {});
  }

  return (
    <div className="control-center space-y-6">
      {message && <AdminFlashMessage type={message.type} text={message.text} />}

      {/* Stats row */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-6">
        <StatCard label={t("activeSegments")} value={String(activeCount)} icon="📊" />
        <StatCard label={t("scansToday")} value={String(todayScans)} icon="📱" />
        <StatCard label={t("totalScans")} value={String(qrEvents.length)} icon="🔍" />
        <StatCard label={t("refreshRate")} value={`${prefs.realtimeRefreshSeconds}s`} icon="⚡" />
        <StatCard label="News" value={String(contentSummary.news)} icon="📰" />
        <StatCard label={t("roleAccess")} value={userRole === "super" ? t("superAdmin") : userRole === "editor" ? t("editor") : t("viewer")} icon="🔐" />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        {/* Live Preview */}
        <section className="admin-feature-card">
          <div className="admin-feature-header">
            <span className="admin-feature-icon">🖥️</span>
            <div>
              <h2 className="admin-feature-title">{t("livePreview")}</h2>
              <p className="admin-feature-desc">Preview the display board before publishing</p>
            </div>
            <button
              type="button"
              onClick={() => setPreviewKey((k) => k + 1)}
              className="admin-btn-secondary text-xs"
            >
              ↻ Refresh
            </button>
          </div>
          <div className="relative mt-4 overflow-hidden rounded-xl border-2 border-slate-200 bg-slate-900 shadow-inner">
            <iframe
              key={previewKey}
              src="/"
              title="Live Display Preview"
              className="h-[320px] w-full md:h-[400px]"
              sandbox="allow-same-origin allow-scripts"
            />
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <a href="/" target="_blank" rel="noopener noreferrer" className="admin-btn-primary text-sm">
              {t("viewDisplay")} ↗
            </a>
            {canEdit && (
              <button type="button" onClick={handleSave} disabled={saving} className="admin-btn-accent text-sm">
                {saving ? t("saving") : t("publish")}
              </button>
            )}
          </div>
        </section>

        {/* Segment Control */}
        <section className="admin-feature-card">
          <div className="admin-feature-header">
            <span className="admin-feature-icon">🎛️</span>
            <div>
              <h2 className="admin-feature-title">{t("segmentControl")}</h2>
              <p className="admin-feature-desc">Turn any display section ON or OFF</p>
            </div>
          </div>
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            {DISPLAY_SECTIONS.map((section) => {
              const on = prefs.sectionVisibility[section.key];
              const isSaving = toggleSaving === section.key;
              return (
                <button
                  key={section.key}
                  type="button"
                  disabled={!canEdit || isSaving}
                  onClick={() => toggleSection(section.key)}
                  className={`segment-toggle flex items-center justify-between rounded-xl border-2 px-4 py-3 transition-all ${
                    on
                      ? "border-emerald-400 bg-emerald-50 text-emerald-900"
                      : "border-slate-200 bg-slate-50 text-slate-500"
                  } ${(!canEdit || isSaving) ? "cursor-not-allowed opacity-60" : "hover:scale-[1.01]"}`}
                >
                  <div className="flex items-center gap-2 text-left">
                    <span className="h-3 w-3 rounded-full" style={{ backgroundColor: section.color }} />
                    <div>
                      <p className="text-sm font-semibold">{section.label}</p>
                      <p className="text-xs opacity-70">{section.location}</p>
                    </div>
                  </div>
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                    on ? "bg-emerald-500 text-white" : "bg-slate-300 text-slate-600"
                  }`}>
                    {isSaving ? "…" : on ? "ON" : "OFF"}
                  </span>
                </button>
              );
            })}
          </div>
        </section>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Theme Management */}
        <section className="admin-feature-card">
          <div className="admin-feature-header">
            <span className="admin-feature-icon">🎨</span>
            <h2 className="admin-feature-title">{t("themeManagement")}</h2>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2">
            {(Object.keys(ADMIN_THEMES) as AdminThemeId[]).map((id) => (
              <button
                key={id}
                type="button"
                disabled={!canEdit}
                onClick={() => setAdminTheme(id)}
                className={`rounded-xl border-2 p-3 text-left transition-all ${
                  prefs.adminTheme === id
                    ? "border-blue-500 ring-2 ring-blue-200"
                    : "border-slate-200 hover:border-slate-300"
                }`}
              >
                <div
                  className="mb-2 h-8 rounded-lg"
                  style={{ background: ADMIN_THEMES[id].gradient }}
                />
                <p className="text-xs font-semibold text-slate-800">{ADMIN_THEMES[id].label}</p>
              </button>
            ))}
          </div>
          <div className="mt-4 space-y-2">
            <label className="text-xs font-medium text-slate-600">Display Accent Color</label>
            <input
              type="color"
              value={prefs.displayTheme.accent}
              disabled={!canEdit}
              onChange={(e) =>
                setPrefs((p) => ({
                  ...p,
                  displayTheme: { ...p.displayTheme, accent: e.target.value },
                }))
              }
              className="h-10 w-full cursor-pointer rounded-lg border"
            />
          </div>
        </section>

        {/* Voice Announcement */}
        <section className="admin-feature-card">
          <div className="admin-feature-header">
            <span className="admin-feature-icon">🔊</span>
            <div>
              <h2 className="admin-feature-title">Voice Announcement</h2>
              <p className="admin-feature-desc">Enable or disable voice announcement on the display board</p>
            </div>
            {/* ON/OFF toggle for display board */}
            <button
              type="button"
              disabled={!canEdit}
              onClick={() => setPrefs((p) => ({ ...p, voiceAnnouncementsEnabled: !p.voiceAnnouncementsEnabled }))}
              className={`ml-auto flex-shrink-0 relative h-7 w-12 rounded-full transition-colors focus:outline-none ${
                prefs.voiceAnnouncementsEnabled ? "bg-emerald-500" : "bg-slate-300"
              } ${!canEdit ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
              aria-label="Toggle voice announcement on display board"
            >
              <span className={`absolute top-0.5 left-0.5 h-6 w-6 rounded-full bg-white shadow transition-transform ${
                prefs.voiceAnnouncementsEnabled ? "translate-x-5" : "translate-x-0"
              }`} />
            </button>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Display board voice button: <span className={`font-semibold ${prefs.voiceAnnouncementsEnabled ? "text-emerald-600" : "text-red-500"}`}>
              {prefs.voiceAnnouncementsEnabled ? "Visible (ON)" : "Hidden (OFF)"}
            </span>
          </p>
          <textarea
            value={announcementText}
            onChange={(e) => setAnnouncementText(e.target.value)}
            placeholder="Type announcement text to preview..."
            rows={3}
            className="mt-3 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
          />
          <div className="mt-2 flex gap-2">
            <button type="button" onClick={speakAnnouncement} className="admin-btn-primary flex-1 text-sm">
              Speak
            </button>
            <button type="button" onClick={stopSpeech} className="admin-btn-secondary text-sm">
              Stop
            </button>
          </div>
        </section>

        {/* Voice Command */}
        <section className="admin-feature-card">
          <div className="admin-feature-header">
            <span className="admin-feature-icon">🎤</span>
            <h2 className="admin-feature-title">Voice Command</h2>
          </div>
          <p className="mt-2 text-xs text-slate-500">Say "open news", "open settings", "preview display"...</p>
          <button
            type="button"
            onClick={startVoiceCommand}
            className={`admin-btn-accent mt-4 w-full text-sm ${voiceListening ? "animate-pulse" : ""}`}
          >
            {voiceListening ? "Listening..." : "🎙 Start Voice Command"}
          </button>
        </section>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* AI Summary */}
        <section className="admin-feature-card">
          <div className="admin-feature-header">
            <span className="admin-feature-icon">🤖</span>
            <h2 className="admin-feature-title">Content Summary</h2>
          </div>
          <button type="button" onClick={generateAISummary} className="admin-btn-primary mt-3 text-sm">
            Generate Summary
          </button>
          {aiSummary && (
            <p className="mt-3 rounded-lg bg-blue-50 p-4 text-sm leading-relaxed text-slate-700">
              {aiSummary}
            </p>
          )}
        </section>

        {/* QR Analytics */}
        <section className="admin-feature-card">
          <div className="admin-feature-header">
            <span className="admin-feature-icon">📊</span>
            <h2 className="admin-feature-title">QR Scan Analytics</h2>
          </div>
          {qrEvents.length === 0 ? (
            <p className="mt-3 text-sm text-slate-500">No scan data yet.</p>
          ) : (
            <ul className="mt-3 max-h-40 space-y-1 overflow-y-auto text-sm">
              {qrEvents
                .slice()
                .reverse()
                .slice(0, 8)
                .map((e, i) => (
                  <li key={i} className="flex justify-between rounded-lg bg-slate-50 px-3 py-1.5">
                    <span className="truncate font-medium">{e.title}</span>
                    <span className="text-xs text-slate-400">
                      {new Date(e.scannedAt).toLocaleTimeString()}
                    </span>
                  </li>
                ))}
            </ul>
          )}
          <button
            type="button"
            onClick={() => simulateQrScan("result", "demo", "Demo Result QR")}
            className="admin-btn-secondary mt-3 text-xs"
          >
            + Simulate QR Scan
          </button>
        </section>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Real-time Updates */}
        <section className="admin-feature-card">
          <div className="admin-feature-header">
            <span className="admin-feature-icon">⚡</span>
            <h2 className="admin-feature-title">Real-time Updates</h2>
          </div>
          <label className="mt-3 block text-sm text-slate-600">Auto-refresh interval</label>
          <input
            type="range"
            min={5}
            max={60}
            step={5}
            value={prefs.realtimeRefreshSeconds}
            disabled={!canEdit}
            onChange={(e) =>
              setPrefs((p) => ({
                ...p,
                realtimeRefreshSeconds: Number(e.target.value),
              }))
            }
            className="mt-2 w-full"
          />
          <p className="mt-1 text-center text-lg font-bold text-blue-600">
            {prefs.realtimeRefreshSeconds}s
          </p>
        </section>

        {/* Media Gallery */}
        <section className="admin-feature-card">
          <div className="admin-feature-header">
            <span className="admin-feature-icon">🖼️</span>
            <h2 className="admin-feature-title">Media Gallery</h2>
          </div>
          {mediaUrls.length === 0 ? (
            <p className="mt-3 text-sm text-slate-500">No media uploaded yet.</p>
          ) : (
            <div className="mt-3 grid grid-cols-4 gap-2">
              {mediaUrls.slice(0, 12).map((url, i) => (
                <div key={i} className="relative aspect-square overflow-hidden rounded-lg border bg-slate-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={url} alt="" className="h-full w-full object-cover" />
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {canEdit && (
        <div className="sticky bottom-4 flex justify-center">
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="admin-btn-accent shadow-xl px-8 py-3 text-base font-bold"
          >
            {saving ? t("saving") : `💾 ${t("save")}`}
          </button>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, icon }: { label: string; value: string; icon: string }) {
  return (
    <div className="admin-stat-card">
      <span className="text-2xl">{icon}</span>
      <p className="mt-1 text-2xl font-bold text-slate-900">{value}</p>
      <p className="text-xs text-slate-500">{label}</p>
    </div>
  );
}

// SpeechRecognition type for browser
interface SpeechRecognition extends EventTarget {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  start(): void;
  stop(): void;
  onstart: ((this: SpeechRecognition, ev: Event) => void) | null;
  onend: ((this: SpeechRecognition, ev: Event) => void) | null;
  onerror: ((this: SpeechRecognition, ev: Event) => void) | null;
  onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => void) | null;
}

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}
