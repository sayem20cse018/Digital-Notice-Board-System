"use client";

import { useState } from "react";
import ImageUpload from "@/app/components/ImageUpload";
import AdminFlashMessage from "@/app/components/admin-panel/AdminFlashMessage";

export type SettingsValues = {
  departmentName: string;
  logoUrl: string;
  universityName: string;
  universityLogoUrl: string;
  marqueeText: string;
  headerBackgroundImages: string[];
  headerSlideshowInterval: number;
  highlightSlideDuration: number;
  publicSiteUrl: string;
};

type Props = {
  initial: SettingsValues;
  saveAction: (formData: FormData) => Promise<{ success: boolean; message: string }>;
  deleteAction: () => Promise<{ success: boolean; message: string }>;
};

function SectionCard({
  icon,
  title,
  children,
}: {
  icon: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      <div className="flex items-center gap-3 border-b border-slate-100 bg-slate-50 px-5 py-3">
        <span className="text-lg leading-none">{icon}</span>
        <h2 className="text-sm font-semibold text-slate-800 uppercase tracking-wide">{title}</h2>
      </div>
      <div className="space-y-4 p-5">{children}</div>
    </div>
  );
}

function FieldLabel({ children, hint }: { children: React.ReactNode; hint?: string }) {
  return (
    <div className="mb-1">
      <label className="block text-sm font-medium text-slate-700">{children}</label>
      {hint && <p className="mt-0.5 text-xs text-slate-500">{hint}</p>}
    </div>
  );
}

function TextInput({
  name,
  defaultValue,
  disabled,
  placeholder,
  type = "text",
  required,
}: {
  name: string;
  defaultValue?: string | number;
  disabled?: boolean;
  placeholder?: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <input
      name={name}
      type={type}
      defaultValue={defaultValue}
      placeholder={placeholder}
      required={required}
      disabled={disabled}
      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 disabled:bg-slate-50 disabled:text-slate-400"
    />
  );
}

export default function SettingsForm({ initial, saveAction, deleteAction }: Props) {
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [deptLogo, setDeptLogo] = useState(initial.logoUrl);
  const [uniLogo, setUniLogo] = useState(initial.universityLogoUrl);

  async function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const formData = new FormData(e.currentTarget);
    formData.set("logoUrl", deptLogo);
    formData.set("universityLogoUrl", uniLogo);
    // Keep these fields with existing values so they aren't lost
    formData.set("headerBackgroundImages", JSON.stringify(initial.headerBackgroundImages));
    formData.set("publicSiteUrl", initial.publicSiteUrl || "");

    try {
      const result = await saveAction(formData);
      setMessage({ type: result.success ? "success" : "error", text: result.message });
      if (result.success) window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      setMessage({ type: "error", text: "Save failed. Please try again." });
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!confirm("Reset all department settings to default values?")) return;
    setLoading(true);
    setMessage(null);
    try {
      const result = await deleteAction();
      setMessage({ type: result.success ? "success" : "error", text: result.message });
      if (result.success) window.location.reload();
    } catch {
      setMessage({ type: "error", text: "Reset failed. Please try again." });
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSave} className="space-y-5">
      {message && <AdminFlashMessage type={message.type} text={message.text} />}

      {/* ── Department ── */}
      <SectionCard icon="🏫" title="Department">
        <div>
          <FieldLabel>Department Name</FieldLabel>
          <TextInput name="departmentName" defaultValue={initial.departmentName} required disabled={loading} />
        </div>
        <div>
          <FieldLabel hint="Shown in the display board header.">Department Logo</FieldLabel>
          <ImageUpload
            name="logoUrl"
            label="Department Logo"
            currentImage={initial.logoUrl || null}
            onImageChange={setDeptLogo}
          />
        </div>
      </SectionCard>

      {/* ── University ── */}
      <SectionCard icon="🎓" title="University">
        <div>
          <FieldLabel>University Name</FieldLabel>
          <TextInput name="universityName" defaultValue={initial.universityName} required disabled={loading} />
        </div>
        <div>
          <FieldLabel hint="Shown alongside the department logo.">University Logo</FieldLabel>
          <ImageUpload
            name="universityLogoUrl"
            label="University Logo"
            currentImage={initial.universityLogoUrl || null}
            onImageChange={setUniLogo}
          />
        </div>
      </SectionCard>

      {/* ── Highlight News Duration ── */}
      <SectionCard icon="📰" title="Highlight News">
        <div>
          <FieldLabel hint="Each highlight news item can override this with its own duration.">
            Slide Duration (seconds)
          </FieldLabel>
          <TextInput
            name="highlightSlideDuration"
            type="number"
            defaultValue={initial.highlightSlideDuration}
            disabled={loading}
          />
        </div>
      </SectionCard>

      {/* ── Welcome Marquee ── */}
      <SectionCard icon="📣" title="Welcome Marquee">
        <div>
          <FieldLabel hint="This text scrolls in the ticker bar at the top of the display board.">
            Marquee Text
          </FieldLabel>
          <textarea
            name="marqueeText"
            defaultValue={initial.marqueeText}
            rows={3}
            disabled={loading}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 disabled:bg-slate-50"
          />
        </div>
      </SectionCard>

      {/* ── Actions ── */}
      <div className="flex flex-wrap items-center gap-3 pt-1">
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 disabled:bg-slate-300 disabled:text-slate-500 transition"
        >
          {loading ? "Saving…" : "Save Settings"}
        </button>
        <button
          type="button"
          onClick={handleDelete}
          disabled={loading}
          className="rounded-lg border border-red-200 px-5 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50 transition"
        >
          Reset to Default
        </button>
      </div>
    </form>
  );
}
