"use client";

import { useState, useEffect } from "react";

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

export default function Clock() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const h = time.getHours();
  const m = time.getMinutes().toString().padStart(2, "0");
  const ampm = h >= 12 ? "PM" : "AM";
  const h12 = (h % 12 || 12).toString().padStart(2, "0");

  const day = DAYS[time.getDay()];
  const date = time.getDate();
  const month = MONTHS[time.getMonth()];
  const year = time.getFullYear();

  return (
    /* Right-side block: time on top, date below */
    <div className="flex flex-col items-end justify-center leading-none select-none">
      {/* Time */}
      <div className="flex items-baseline gap-1">
        <span className="text-2xl font-bold tabular-nums text-white md:text-3xl">
          {h12}:{m}
        </span>
        <span className="text-sm font-semibold text-blue-200">{ampm}</span>
      </div>
      {/* Date */}
      <div className="mt-0.5 text-xs font-medium text-blue-100 md:text-sm">
        {date} {month} {year}
      </div>
    </div>
  );
}
