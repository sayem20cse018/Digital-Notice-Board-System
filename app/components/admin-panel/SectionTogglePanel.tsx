"use client";

import { useState } from "react";
import type { SectionVisibility } from "@/app/lib/display-config";

type SectionDef = {
  key: string;
  title: string;
  href: string;
  description: string;
  icon: string;
  location: string;
};

type Props = {
  initialVisibility: SectionVisibility;
  sections: readonly SectionDef[];
  countMap?: Record<string, number>;
};

export default function SectionTogglePanel({ initialVisibility, sections, countMap = {} }: Props) {
  const [visibility, setVisibility] = useState<Record<string, boolean>>(
    Object.fromEntries(
      sections.map((s) => [
        s.key,
        (initialVisibility as Record<string, boolean>)[s.key] !== false,
      ])
    )
  );
  const [saving, setSaving] = useState<string | null>(null);
  const [savedKey, setSavedKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function toggle(key: string) {
    const newVal = !visibility[key];
    const next = { ...visibility, [key]: newVal };
    setVisibility(next);
    setSaving(key);
    setError(null);

    try {
      // Load current full prefs first
      const getRes = await fetch("/api/display-settings");
      const getData = await getRes.json();
      const currentPrefs = getData.success ? getData.data : {};

      const merged = {
        ...currentPrefs,
        sectionVisibility: {
          ...(currentPrefs?.sectionVisibility ?? {}),
          ...next,
        },
      };

      const res = await fetch("/api/display-settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(merged),
      });
      const data = await res.json();

      if (!data.success) {
        // Revert on failure
        setVisibility((v) => ({ ...v, [key]: !newVal }));
        setError(`Failed to save: ${data.message}`);
      } else {
        setSavedKey(key);
        setTimeout(() => setSavedKey(null), 1500);
      }
    } catch {
      setVisibility((v) => ({ ...v, [key]: !newVal }));
      setError("Network error. Try again.");
    } finally {
      setSaving(null);
    }
  }

  return (
    <div className="space-y-3">
      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-2 text-sm text-red-700">
          {error}
        </div>
      )}
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {sections.map((section) => {
          const isOn = visibility[section.key] !== false;
          const isSaving = saving === section.key;
          const justSaved = savedKey === section.key;
          const count = countMap[section.key];

          return (
            <div
              key={section.key}
              className={`flex items-center justify-between gap-3 rounded-xl border-2 p-3 transition-all ${
                isOn
                  ? "border-emerald-300 bg-emerald-50"
                  : "border-slate-200 bg-slate-50"
              }`}
            >
              {/* Left: icon + info */}
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="text-xl leading-none">{section.icon}</span>
                <div className="min-w-0">
                  <p className={`text-sm font-bold leading-tight truncate ${isOn ? "text-slate-900" : "text-slate-500"}`}>
                    {section.title}
                  </p>
                  <p className="text-[10px] text-slate-400">{section.location}{count !== undefined ? ` · ${count} items` : ""}</p>
                </div>
              </div>

              {/* Right: toggle switch */}
              <button
                type="button"
                onClick={() => toggle(section.key)}
                disabled={isSaving}
                aria-label={`${isOn ? "Turn off" : "Turn on"} ${section.title}`}
                className={`relative flex-shrink-0 h-7 w-12 rounded-full transition-colors duration-200 focus:outline-none ${
                  isOn ? "bg-emerald-500" : "bg-slate-300"
                } ${isSaving ? "opacity-60 cursor-wait" : "cursor-pointer"}`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 h-6 w-6 rounded-full bg-white shadow transition-transform duration-200 ${
                    isOn ? "translate-x-5" : "translate-x-0"
                  }`}
                />
                {justSaved && (
                  <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-blue-500 text-[8px] text-white flex items-center justify-center">✓</span>
                )}
              </button>
            </div>
          );
        })}
      </div>

      <p className="text-xs text-slate-400 mt-1">
        Toggle করলে display board-এ সাথে সাথে reflect হবে (refresh হলে দেখাবে)।
      </p>
    </div>
  );
}
