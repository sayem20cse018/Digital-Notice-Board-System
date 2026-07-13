"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ResultActions({ result }: { result: any }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    if (!confirm("Are you sure you want to delete this result?")) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/results?id=${result.id}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (json.success) {
        router.refresh();
      }
    } catch (error) {
      console.error("Error deleting result:", error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="px-3 py-1 text-sm rounded border text-red-600 disabled:opacity-50"
    >
      Delete
    </button>
  );
}

