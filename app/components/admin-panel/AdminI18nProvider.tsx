"use client";

import { createContext, useContext, useState, useCallback, type ReactNode } from "react";

type Lang = "en" | "bn";

const translations: Record<Lang, Record<string, string>> = {
  en: {
    dashboard: "Dashboard",
    controlCenter: "Control Center",
    settings: "Settings",
    account: "Account",
    livePreview: "Live Display Preview",
    publish: "Publish to Display",
    segmentControl: "Segment On/Off",
    voiceAnnouncement: "Voice Announcement",
    aiSummary: "AI Content Summary",
    qrAnalytics: "QR Scan Analytics",
    realtimeUpdates: "Real-time Updates",
    themeManagement: "Dynamic Theme",
    roleAccess: "Role Based Access",
    mobileControl: "Mobile Admin",
    advancedAnalytics: "Advanced Analytics",
    mediaGallery: "Smart Media Gallery",
    voiceCommand: "Voice Command",
    achievementRanking: "Achievement Ranking",
    locationNav: "Smart Location Nav",
    save: "Save & Publish",
    saving: "Saving...",
    enabled: "Enabled",
    disabled: "Disabled",
    adminPanel: "Admin Panel",
    welcome: "Welcome back",
    manageSections: "Manage Sections",
    viewDisplay: "View Display Board",
    signOut: "Sign Out",
    superAdmin: "Super Admin",
    editor: "Editor",
    viewer: "Viewer",
    scansToday: "Scans Today",
    totalScans: "Total Scans",
    activeSegments: "Active Segments",
    refreshRate: "Refresh Rate",
    speak: "Speak Announcement",
    stop: "Stop",
    listening: "Listening...",
    sayCommand: 'Say "open news", "open settings", "preview display"...',
    generateSummary: "Generate Summary",
    noData: "No data yet",
    on: "ON",
    off: "OFF",
  },
  bn: {
    dashboard: "ড্যাশবোর্ড",
    controlCenter: "কন্ট্রোল সেন্টার",
    settings: "সেটিংস",
    account: "অ্যাকাউন্ট",
    livePreview: "লাইভ ডিসপ্লে প্রিভিউ",
    publish: "ডিসপ্লেতে প্রকাশ করুন",
    segmentControl: "সেকশন চালু/বন্ধ",
    voiceAnnouncement: "ভয়েস ঘোষণা",
    aiSummary: "AI কনটেন্ট সারাংশ",
    qrAnalytics: "QR স্ক্যান Analytics",
    realtimeUpdates: "রিয়েল-টাইম আপডেট",
    themeManagement: "ডায়নামিক থিম",
    roleAccess: "রোল ভিত্তিক অ্যাক্সেস",
    mobileControl: "মোবাইল Admin",
    advancedAnalytics: "অ্যাডভান্সড Analytics",
    mediaGallery: "স্মার্ট Media Gallery",
    voiceCommand: "ভয়েস কমান্ড",
    achievementRanking: "Achievement Ranking",
    locationNav: "Smart Location Nav",
    save: "সেভ ও প্রকাশ",
    saving: "সেভ হচ্ছে...",
    enabled: "চালু",
    disabled: "বন্ধ",
    adminPanel: "Admin Panel",
    welcome: "স্বাগতম",
    manageSections: "সেকশন ম্যানেজ",
    viewDisplay: "ডিসপ্লে বোর্ড দেখুন",
    signOut: "সাইন আউট",
    superAdmin: "Super Admin",
    editor: "Editor",
    viewer: "Viewer",
    scansToday: "আজকের স্ক্যান",
    totalScans: "মোট স্ক্যান",
    activeSegments: "সক্রিয় সেকশন",
    refreshRate: "রিফ্রেশ রেট",
    speak: "ঘোষণা শুনুন",
    stop: "বন্ধ",
    listening: "শুনছি...",
    sayCommand: '"open news", "open settings", "preview display" বলুন...',
    generateSummary: "সারাংশ তৈরি",
    noData: "এখনো ডেটা নেই",
    on: "চালু",
    off: "বন্ধ",
  },
};

type AdminI18nContextValue = {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (key: string) => string;
};

const AdminI18nContext = createContext<AdminI18nContextValue | null>(null);

export function AdminI18nProvider({
  children,
  initialLang = "en",
}: {
  children: ReactNode;
  initialLang?: Lang;
}) {
  const [lang, setLang] = useState<Lang>(initialLang);

  const t = useCallback(
    (key: string) => translations[lang][key] ?? translations.en[key] ?? key,
    [lang],
  );

  return (
    <AdminI18nContext.Provider value={{ lang, setLang, t }}>
      {children}
    </AdminI18nContext.Provider>
  );
}

export function useAdminI18n() {
  const ctx = useContext(AdminI18nContext);
  if (!ctx) {
    return {
      lang: "en" as Lang,
      setLang: () => {},
      t: (key: string) => translations.en[key] ?? key,
    };
  }
  return ctx;
}
