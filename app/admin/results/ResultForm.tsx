"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ResultForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const formData = new FormData(e.currentTarget);
    const data = {
      examName: formData.get("examName")?.toString().trim() || "",
      className: formData.get("className")?.toString().trim() || null,
      linkUrl: formData.get("linkUrl")?.toString().trim() || "",
    };

    if (!data.examName || !data.linkUrl) {
      setMessage({ type: "error", text: "Exam name and link URL are required" });
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/results", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (result.success) {
        setMessage({ type: "success", text: result.message || "Result created successfully!" });
        if (e.currentTarget) {
          e.currentTarget.reset();
        }
        setTimeout(() => {
          router.refresh();
          setMessage(null);
        }, 2000);
      } else {
        setMessage({ type: "error", text: result.message || "Failed to create result" });
      }
    } catch (error: any) {
      setMessage({ type: "error", text: error?.message || "Network error. Please try again." });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      {message && (
        <div
          className={`mb-4 p-3 rounded ${
            message.type === "success" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
          }`}
        >
          {message.text}
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-3">
        <input name="examName" placeholder="Exam Name" required className="w-full border rounded px-3 py-2" disabled={loading} />
        <input name="className" placeholder="Class (optional)" className="w-full border rounded px-3 py-2" disabled={loading} />
        <input name="linkUrl" placeholder="Result Link URL" required className="w-full border rounded px-3 py-2" disabled={loading} />
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded"
        >
          {loading ? "Saving..." : "Save"}
        </button>
      </form>
    </div>
  );
}

