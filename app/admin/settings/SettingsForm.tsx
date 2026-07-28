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
  const [headerBgs, setHeaderBgs] = useState<string[]>(
    initial.headerBackgroundImages.length > 0
      ? initial.headerBackgroundImages
      : ["", "", "", ""],
  );

  function setHeaderBg(index: number, url: string) {
    setHeaderBgs((prev) => {
      const next = [...prev];
      next[index] = url;
      return next;
    });
  }

  async function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const formData = new FormData(e.currentTarget);
    formData.set("logoUrl", deptLogo);
    formData.set("universityLogoUrl", uniLogo);
    formData.set("headerBackgroundImages", JSON.stringify(headerBgs.filter((u) => u.trim())));

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

      {/* ── Header Background Slideshow ── */}
      <SectionCard icon="🖼️" title="Header Background Slideshow">
        <p className="text-sm text-slate-500">
          Upload up to 4 images that cycle as the header background on the display board.
        </p>
        {[0, 1, 2, 3].map((idx) => (
          <div key={idx}>
            <FieldLabel>Background Image {idx + 1}</FieldLabel>
            <ImageUpload
              name={`headerBg${idx}`}
              label={`Background Image ${idx + 1}`}
              currentImage={headerBgs[idx] || null}
              onImageChange={(url) => setHeaderBg(idx, url)}
            />
          </div>
        ))}
        <div>
          <FieldLabel hint="How long each background image is displayed (3–60 seconds).">
            Slideshow Interval (seconds)
          </FieldLabel>
          <TextInput
            name="headerSlideshowInterval"
            type="number"
            defaultValue={initial.headerSlideshowInterval}
            disabled={loading}
          />
        </div>
      </SectionCard>

      {/* ── Highlight News Slideshow ── */}
      <SectionCard icon="📰" title="Highlight News Slideshow">
        <div>
          <FieldLabel hint="Each highlight news item can override this with its own duration.">
            Default Slide Duration (seconds)
          </FieldLabel>
          <TextInput
            name="highlightSlideDuration"
            type="number"
            defaultValue={initial.highlightSlideDuration}
            disabled={loading}
          />
        </div>
      </SectionCard>

      {/* ── QR Code Settings ── */}
      <SectionCard icon="📱" title="QR Code Settings">
        <div>
          <FieldLabel>Public Site URL</FieldLabel>
          <TextInput
            name="publicSiteUrl"
            type="url"
            defaultValue={initial.publicSiteUrl}
            placeholder="http://192.168.1.5:3000"
            disabled={loading}
          />
          <div className="mt-2 rounded-lg border border-blue-100 bg-blue-50 p-3 text-xs text-slate-700 space-y-1">
            <p className="font-semibold text-blue-800">Why this matters</p>
            <p>
              When a QR code is scanned on a phone, it opens this URL. The PC running the server
              and the phone <strong>must be on the same Wi-Fi network</strong>.
            </p>
            <p>
              Set this to your PC&apos;s LAN IP address, e.g.{" "}
              <code className="rounded bg-blue-100 px-1 font-mono">http://192.168.1.5:3000</code>.
              Leave blank to let the server auto-detect.
            </p>
            <p>
              After changing this URL, re-save any QR pages (Class Routine, Exam Routine, etc.)
              so they regenerate with the new URL.
            </p>
          </div>
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
