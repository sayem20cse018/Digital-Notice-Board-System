"use client";

import { useState } from "react";
import { useAdminI18n } from "./AdminI18nProvider";
import { fetchJson } from "@/app/lib/fetch-json";
import type { AdminPreferences } from "@/app/lib/display-config";

export default function AdminLanguageToggle() {
  const { lang, setLang } = useAdminI18n();
  const [saving, setSaving] = useState(false);

  async function switchLang(next: "en" | "bn") {
    if (next === lang || saving) return;
    setLang(next);
    setSaving(true);
    try {
      const res = await fetchJson<{ success: boolean; data?: AdminPreferences }>("/api/display-settings");
      if (res.success && res.data) {
        await fetchJson("/api/display-settings", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...res.data, adminLanguage: next }),
        });
      }
    } catch {
      /* keep UI lang even if save fails */
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="admin-lang-toggle flex items-center rounded-lg bg-white/15 p-0.5 backdrop-blur-sm">
      <button
        type="button"
        onClick={() => switchLang("en")}
        disabled={saving}
        className={`rounded-md px-2.5 py-1 text-xs font-semibold transition ${
          lang === "en" ? "bg-white text-blue-700 shadow-sm" : "text-white/90 hover:bg-white/10"
        }`}
        aria-pressed={lang === "en"}
      >
        EN
      </button>
      <button
        type="button"
        onClick={() => switchLang("bn")}
        disabled={saving}
        className={`rounded-md px-2.5 py-1 text-xs font-semibold transition ${
          lang === "bn" ? "bg-white text-blue-700 shadow-sm" : "text-white/90 hover:bg-white/10"
        }`}
        aria-pressed={lang === "bn"}
      >
        বাং
      </button>
    </div>
  );
}
