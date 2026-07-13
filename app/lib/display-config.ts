/** Display board section keys and default visibility/theme configuration. */

export const DISPLAY_SECTIONS = [
  { key: "highlightNews",   label: "Highlight News",      location: "Top Hero",    color: "#ef4444" },
  { key: "bestAlumni",      label: "Dept. Achievers",     location: "Right Panel", color: "#f59e0b" },
  { key: "bestProgrammer",  label: "Programming Stars",   location: "Right Panel", color: "#10b981" },
  { key: "noticeBoard",     label: "Update Notice",       location: "Right Panel", color: "#f97316" },
  { key: "classRoutine",    label: "Class Routine (QR)",  location: "QR Row",      color: "#3b82f6" },
  { key: "examRoutine",     label: "Exam Routine (QR)",   location: "QR Row",      color: "#6366f1" },
  { key: "resultsQr",       label: "Result (QR)",         location: "QR Row",      color: "#059669" },
  { key: "teacherList",     label: "Teacher List (QR)",   location: "QR Row",      color: "#8b5cf6" },
  { key: "helpCenter",      label: "Help Center",         location: "QR Row",      color: "#14b8a6" },
  { key: "researchers",     label: "Project Showcase",    location: "Bottom Row",  color: "#a855f7" },
  { key: "roomInfo",        label: "Room Directory",      location: "Bottom Row",  color: "#0ea5e9" },
  { key: "achievements",    label: "Voice Announcement",  location: "Bottom Row",  color: "#eab308" },
  { key: "events",          label: "Events",              location: "Bottom Row",  color: "#22c55e" },
] as const;

export const SECTION_ADMIN_LINKS: Record<SectionKey, string> = {
  highlightNews:  "/admin/highlight-news",
  bestAlumni:     "/admin/best-alumni",
  bestProgrammer: "/admin/best-programmer",
  teacherList:    "/admin/teacher-list",
  researchers:    "/admin/researcher",
  noticeBoard:    "/admin/right-sidebar-notice",
  resultsQr:      "/admin/results",
  helpCenter:     "/admin/help-center",
  achievements:   "/admin/achievements",
  roomInfo:       "/admin/room-directory",
  classRoutine:   "/admin/class-routine-qr",
  examRoutine:    "/admin/exam-routine-qr",
  events:         "/admin/events-board",
};

export const HIGHLIGHT_BG_PRESETS = [
  { id: "ocean",   label: "Ocean Blue",         value: "linear-gradient(135deg, #0f172a 0%, #1e3a8a 50%, #312e81 100%)" },
  { id: "emerald", label: "Emerald",             value: "linear-gradient(135deg, #022c22 0%, #065f46 50%, #064e3b 100%)" },
  { id: "sunset",  label: "Sunset",              value: "linear-gradient(135deg, #431407 0%, #c2410c 50%, #9a3412 100%)" },
  { id: "royal",   label: "Royal Purple",        value: "linear-gradient(135deg, #1e1b4b 0%, #5b21b6 50%, #7c3aed 100%)" },
  { id: "slate",   label: "Professional Slate",  value: "linear-gradient(135deg, #0f172a 0%, #334155 50%, #475569 100%)" },
] as const;

export type SectionKey = (typeof DISPLAY_SECTIONS)[number]["key"];

export type SectionVisibility = Record<SectionKey, boolean>;

export type DisplayTheme = {
  accent: string;
  highlightBg: string;
  cardStyle: "glass" | "solid" | "gradient";
};

export type AdminThemeId = "ocean" | "midnight" | "emerald" | "sunset" | "slate";

export type AdminPreferences = {
  sectionVisibility: SectionVisibility;
  displayTheme: DisplayTheme;
  adminTheme: AdminThemeId;
  adminLanguage: "en" | "bn";
  voiceAnnouncementsEnabled: boolean;
  realtimeRefreshSeconds: number;
};

export const DEFAULT_SECTION_VISIBILITY: SectionVisibility = {
  highlightNews:  true,
  bestAlumni:     true,
  bestProgrammer: true,
  teacherList:    true,
  researchers:    true,
  noticeBoard:    true,
  resultsQr:      true,
  helpCenter:     true,
  achievements:   true,
  roomInfo:       true,
  classRoutine:   true,
  examRoutine:    true,
  events:         true,
};

export const DEFAULT_DISPLAY_THEME: DisplayTheme = {
  accent: "#2563eb",
  highlightBg: "linear-gradient(135deg, #0f172a 0%, #1e3a8a 50%, #312e81 100%)",
  cardStyle: "glass",
};

export const DEFAULT_ADMIN_PREFERENCES: AdminPreferences = {
  sectionVisibility: DEFAULT_SECTION_VISIBILITY,
  displayTheme: DEFAULT_DISPLAY_THEME,
  adminTheme: "ocean",
  adminLanguage: "en",
  voiceAnnouncementsEnabled: false,
  realtimeRefreshSeconds: 15,
};

export const ADMIN_THEMES: Record<
  AdminThemeId,
  { label: string; gradient: string; accent: string }
> = {
  ocean: {
    label: "Ocean Blue",
    gradient: "linear-gradient(135deg, #0c1e4a 0%, #1e3a8a 35%, #2563eb 65%, #1d4ed8 100%)",
    accent: "#3b82f6",
  },
  midnight: {
    label: "Midnight",
    gradient: "linear-gradient(135deg, #020617 0%, #0f172a 40%, #1e1b4b 100%)",
    accent: "#818cf8",
  },
  emerald: {
    label: "Emerald",
    gradient: "linear-gradient(135deg, #022c22 0%, #065f46 45%, #059669 100%)",
    accent: "#34d399",
  },
  sunset: {
    label: "Sunset",
    gradient: "linear-gradient(135deg, #431407 0%, #c2410c 45%, #ea580c 100%)",
    accent: "#fb923c",
  },
  slate: {
    label: "Professional Slate",
    gradient: "linear-gradient(135deg, #0f172a 0%, #334155 50%, #475569 100%)",
    accent: "#94a3b8",
  },
};

export function parseAdminPreferences(raw: unknown): AdminPreferences {
  if (!raw || typeof raw !== "object") return DEFAULT_ADMIN_PREFERENCES;
  const obj = raw as Partial<AdminPreferences>;
  return {
    sectionVisibility: {
      ...DEFAULT_SECTION_VISIBILITY,
      ...(obj.sectionVisibility ?? {}),
    },
    displayTheme: {
      ...DEFAULT_DISPLAY_THEME,
      ...(obj.displayTheme ?? {}),
    },
    adminTheme: obj.adminTheme ?? DEFAULT_ADMIN_PREFERENCES.adminTheme,
    adminLanguage: obj.adminLanguage ?? DEFAULT_ADMIN_PREFERENCES.adminLanguage,
    voiceAnnouncementsEnabled:
      obj.voiceAnnouncementsEnabled ?? DEFAULT_ADMIN_PREFERENCES.voiceAnnouncementsEnabled,
    realtimeRefreshSeconds:
      obj.realtimeRefreshSeconds ?? DEFAULT_ADMIN_PREFERENCES.realtimeRefreshSeconds,
  };
}
