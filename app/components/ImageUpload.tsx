"use client";

import { useState, useRef, useEffect } from "react";
import { parseJsonResponse } from "@/app/lib/fetch-json";

type Props = {
  name: string;
  label?: string;
  currentImage?: string | null;
  onImageChange?: (url: string) => void;
};

export default function ImageUpload({ name, label, currentImage, onImageChange }: Props) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(currentImage || null);
  const [imageUrl, setImageUrl] = useState<string>(currentImage || "");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync with external currentImage when editing a different item
  useEffect(() => {
    setPreview(currentImage || null);
    setImageUrl(currentImage || "");
  }, [currentImage]);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"];
    if (!allowedTypes.includes(file.type)) {
      alert("Please upload an image file (JPEG, PNG, WebP, GIF)");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("Image size should be less than 5MB");
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

      setImageUrl(data.url);
      setPreview(data.url);
      onImageChange?.(data.url);
    } catch (error) {
      console.error("Upload error:", error);
      alert(error instanceof Error ? error.message : "Failed to upload image. Please try again.");
    } finally {
      setUploading(false);
      // Clear the file input so the same file can be re-selected if needed
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  function handleClear() {
    setImageUrl("");
    setPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    onImageChange?.("");
  }

  return (
    <div className="space-y-2">
      {label && <label className="block text-sm font-medium text-gray-700">{label}</label>}

      <div className="flex items-center gap-4">
        {preview && (
          <div className="relative h-24 w-24 overflow-hidden rounded border border-gray-300 flex-shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={preview} alt="Preview" className="h-full w-full object-cover" />
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            disabled={uploading}
            className="hidden"
            id={`image-${name}`}
          />
          <label
            htmlFor={`image-${name}`}
            className={`inline-block cursor-pointer rounded border px-4 py-2 text-sm ${
              uploading
                ? "cursor-not-allowed bg-gray-300"
                : "border-gray-300 bg-white hover:bg-gray-50"
            }`}
          >
            {uploading ? "Uploading..." : preview ? "Change Image" : "Upload Image"}
          </label>
          {preview && (
            <button
              type="button"
              onClick={handleClear}
              className="rounded border border-red-300 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
            >
              Remove
            </button>
          )}
        </div>
      </div>

      {/* Hidden field always holds the current value — survives form.reset() because it's controlled */}
      <input type="hidden" name={name} value={imageUrl} />

      {imageUrl && (
        <p className="truncate text-xs text-gray-500">
          ✓ {imageUrl.split("/").pop()}
        </p>
      )}
    </div>
  );
}
