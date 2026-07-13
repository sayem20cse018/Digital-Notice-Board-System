"use client";

import { useState, useRef, useEffect } from "react";
import { parseJsonResponse } from "@/app/lib/fetch-json";

type Props = {
  name: string;
  label?: string;
  currentFile?: string | null;
  accept?: string;
  onFileChange?: (url: string) => void;
};

export default function FileUpload({
  name,
  label,
  currentFile,
  accept = "image/*,.pdf,.doc,.docx,.xls,.xlsx",
  onFileChange,
}: Props) {
  const [uploading, setUploading] = useState(false);
  const [fileUrl, setFileUrl] = useState<string>(currentFile || "");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync with external currentFile when editing a different item
  useEffect(() => {
    setFileUrl(currentFile || "");
  }, [currentFile]);

  function getFileName(url: string) {
    try {
      return url.split("/").pop() || url;
    } catch {
      return url;
    }
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      alert("File size should be less than 10MB");
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await parseJsonResponse<{ success?: boolean; url?: string; error?: string }>(res);

      if (!res.ok || !data.url) {
        throw new Error(data.error || "Upload failed");
      }

      setFileUrl(data.url);
      onFileChange?.(data.url);
    } catch (error) {
      console.error("Upload error:", error);
      alert(error instanceof Error ? error.message : "Failed to upload file. Please try again.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  function handleClear() {
    setFileUrl("");
    if (fileInputRef.current) fileInputRef.current.value = "";
    onFileChange?.("");
  }

  return (
    <div className="space-y-2">
      {label && <label className="block text-sm font-medium text-gray-700">{label}</label>}

      <div className="flex flex-wrap items-center gap-3">
        {fileUrl && (
          <div className="flex items-center gap-2 rounded border border-green-200 bg-green-50 px-3 py-1.5 text-sm text-green-700">
            <span>📎</span>
            <a href={fileUrl} target="_blank" rel="noopener noreferrer" className="underline truncate max-w-[180px]">
              {getFileName(fileUrl)}
            </a>
            <button
              type="button"
              onClick={handleClear}
              className="ml-1 text-red-500 hover:text-red-700 font-bold"
              title="Remove file"
            >
              ×
            </button>
          </div>
        )}

        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept={accept}
            onChange={handleFileChange}
            disabled={uploading}
            className="hidden"
            id={`file-${name}`}
          />
          <label
            htmlFor={`file-${name}`}
            className={`inline-block cursor-pointer rounded border px-4 py-2 text-sm ${
              uploading
                ? "cursor-not-allowed bg-gray-300"
                : "border-gray-300 bg-white hover:bg-gray-50"
            }`}
          >
            {uploading ? "Uploading..." : fileUrl ? "Replace File" : "Upload File"}
          </label>
        </div>
      </div>

      {/* Hidden field always holds the current value — controlled, survives form.reset() */}
      <input type="hidden" name={name} value={fileUrl} />
    </div>
  );
}
