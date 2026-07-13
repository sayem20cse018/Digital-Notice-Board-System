"use client";

import { useEffect, useState } from "react";
import { useSearchParams, usePathname } from "next/navigation";

export default function SuccessMessage() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const [show, setShow] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const success = searchParams.get("success");
    const error = searchParams.get("error");
    
    if (success === "true") {
      setMessage("Successfully saved!");
      setShow(true);
      const timer = setTimeout(() => setShow(false), 5000);
      return () => clearTimeout(timer);
    } else if (error) {
      setMessage("Error: Failed to save. Please try again.");
      setShow(true);
      const timer = setTimeout(() => setShow(false), 5000);
      return () => clearTimeout(timer);
    } else {
      setShow(false);
    }
  }, [searchParams, pathname]);

  if (!show) return null;

  const isError = searchParams.get("error");
  const bgColor = isError ? "bg-red-500" : "bg-green-500";

  return (
    <div className={`fixed top-20 right-4 ${bgColor} text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-slide-in`}>
      <div className="flex items-center gap-2">
        <span className="text-xl">{isError ? "✗" : "✓"}</span>
        <span className="font-medium">{message}</span>
      </div>
    </div>
  );
}


