"use client";

import { useState, useEffect, useCallback } from "react";
import { fetchJson } from "@/app/lib/fetch-json";

// ── Constants ────────────────────────────────────────────────────────────────

export const DAYS = ["SUN", "MON", "TUE", "WED", "THU"] as const;

export const SEMESTERS = ["4-1", "3-1", "2-2", "1-2", "1-1"] as const;

export const PERIODS: { id: number; label: string }[] = [
  { id: 1, label: "9:00–9:50"   },
  { id: 2, label: "9:50–10:40"  },
  { id: 3, label: "10:40–11:30" },
  { id: 4, label: "11:30–12:20" },
  // period 5 = BREAK (no cell)
  { id: 6, label: "12:20–1:10"  },
  { id: 7, label: "2:10–3:00"   },
  { id: 8, label: "3:00–3:50"   },
];

export type Slot = {
  id?: string;
  day: number;          // 0=SUN … 4=THU
  period: number;       // 1-8 (5=break, not stored)
  semester: string;     // "4-1" | "3-1" | "2-2" | "1-2" | "1-1"
  courseCode: string;
  courseName: string;
  teacherInitial: string;
  room: string;
};

// ── Cell editor modal ─────────────────────────────────────────────────────────

function CellModal({
  slot,
  day,
  period,
  semester,
  onSave,
  onClear,
  onClose,
}: {
  slot: Slot | null;
  day: number;
  period: number;
  semester: string;
  onSave: (data: Omit<Slot, "id">) => void;
  onClear: () => void;
  onClose: () => void;
}) {
  const [courseCode,      setCourseCode]      = useState(slot?.courseCode      ?? "");
  const [courseName,      setCourseName]      = useState(slot?.courseName      ?? "");
  const [teacherInitial,  setTeacherInitial]  = useState(slot?.teacherInitial  ?? "");
  const [room,            setRoom]            = useState(slot?.room            ?? "");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-sm rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b px-5 py-4">
          <h3 className="font-semibold text-slate-800">
            {DAYS[day]} · Sem {semester} · {PERIODS.find(p => p.id === period)?.label}
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-xl leading-none">×</button>
        </div>

        <div className="space-y-3 px-5 py-4">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Course Code</label>
            <input
              value={courseCode}
              onChange={e => setCourseCode(e.target.value)}
              placeholder="e.g. CSE303"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Course Name (optional)</label>
            <input
              value={courseName}
              onChange={e => setCourseName(e.target.value)}
              placeholder="e.g. Data Structures"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Teacher Initial</label>
              <input
                value={teacherInitial}
                onChange={e => setTeacherInitial(e.target.value)}
                placeholder="e.g. DSA"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Room</label>
              <input
                value={room}
                onChange={e => setRoom(e.target.value)}
                placeholder="e.g. R:407"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 border-t px-5 py-4">
          <button
            onClick={() => onSave({ day, period, semester, courseCode, courseName, teacherInitial, room })}
            className="flex-1 rounded-lg bg-blue-600 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition"
          >
            Save
          </button>
          {slot && (
            <button
              onClick={onClear}
              className="rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-500 hover:bg-red-50 transition"
            >
              Clear
            </button>
          )}
          <button
            onClick={onClose}
            className="rounded-lg border px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 transition"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main editor ───────────────────────────────────────────────────────────────

export default function RoutineEditor() {
  const [slots,   setSlots]   = useState<Slot[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving,  setSaving]  = useState(false);
  const [msg,     setMsg]     = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [modal,   setModal]   = useState<{ day: number; period: number; semester: string } | null>(null);

  const fetchSlots = useCallback(async () => {
    try {
      const res = await fetchJson<{ success: boolean; data: Slot[] }>("/api/class-routine-slots");
      if (res.success) setSlots(res.data);
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchSlots(); }, [fetchSlots]);

  function getSlot(day: number, period: number, semester: string): Slot | undefined {
    return slots.find(s => s.day === day && s.period === period && s.semester === semester);
  }

  async function handleSave(data: Omit<Slot, "id">) {
    setSaving(true);
    try {
      await fetchJson("/api/class-routine-slots", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      await fetchSlots();
      setMsg({ type: "success", text: "Saved!" });
      setTimeout(() => setMsg(null), 2000);
    } catch {
      setMsg({ type: "error", text: "Save failed" });
    } finally {
      setSaving(false);
      setModal(null);
    }
  }
  async function handleClear(day: number, period: number, semester: string) {
    const slot = getSlot(day, period, semester);
    if (!slot?.id) { setModal(null); return; }
    setSaving(true);
    try {
      await fetchJson(`/api/class-routine-slots?id=${slot.id}`, { method: "DELETE" });
      await fetchSlots();
    } catch { /* ignore */ }
    finally { setSaving(false); setModal(null); }
  }

  if (loading) return <p className="text-slate-500 py-4">Loading routine…</p>;

  const activeModal = modal
    ? { slot: getSlot(modal.day, modal.period, modal.semester) ?? null, ...modal }
    : null;

  return (
    <div className="space-y-4">
      {msg && (
        <div className={`rounded-lg px-4 py-2 text-sm font-medium ${msg.type === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
          {msg.text}
        </div>
      )}

      {saving && <p className="text-xs text-slate-400 animate-pulse">Saving…</p>}

      <p className="text-sm text-slate-500">
        Click any cell to edit. Cells show <strong>Code, Teacher, Room</strong>.
      </p>

      {/* Table — scrollable horizontally on small screens */}
      <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-sm">
        <table className="min-w-full text-xs border-collapse">
          <thead>
            <tr className="bg-[#1e3a8a] text-white">
              <th className="border border-blue-700 px-2 py-2 text-left font-semibold whitespace-nowrap">Day</th>
              <th className="border border-blue-700 px-2 py-2 font-semibold whitespace-nowrap">Sem</th>
              {PERIODS.map(p => (
                <th key={p.id} className="border border-blue-700 px-2 py-2 font-semibold whitespace-nowrap min-w-[90px]">
                  {p.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {DAYS.map((dayName, dayIdx) => (
              SEMESTERS.map((sem, semIdx) => {
                const isFirstSem = semIdx === 0;
                const isLastSem  = semIdx === SEMESTERS.length - 1;
                const rowBg = semIdx % 2 === 0 ? "bg-white" : "bg-slate-50";

                return (
                  <tr key={`${dayIdx}-${sem}`} className={rowBg}>
                    {/* Day cell — spans all semesters */}
                    {isFirstSem && (
                      <td
                        rowSpan={SEMESTERS.length}
                        className="border border-slate-300 px-2 py-1 font-bold text-center bg-orange-50 text-orange-800 align-middle"
                        style={{ writingMode: "vertical-rl", textOrientation: "mixed", transform: "rotate(180deg)", minWidth: 28 }}
                      >
                        {dayName}
                      </td>
                    )}

                    {/* Semester label */}
                    <td className={`border border-slate-300 px-2 py-1 font-medium text-slate-700 whitespace-nowrap ${isLastSem ? "border-b-2 border-b-slate-400" : ""}`}>
                      {sem}
                    </td>

                    {/* Period cells */}
                    {PERIODS.map(p => {
                      const slot = getSlot(dayIdx, p.id, sem);
                      const hasData = slot && slot.courseCode;

                      return (
                        <td
                          key={p.id}
                          onClick={() => setModal({ day: dayIdx, period: p.id, semester: sem })}
                          className={`border border-slate-300 px-1.5 py-1 cursor-pointer transition-colors align-top ${
                            isLastSem ? "border-b-2 border-b-slate-400" : ""
                          } ${hasData ? "bg-orange-50 hover:bg-orange-100" : "hover:bg-blue-50"}`}
                          style={{ minWidth: 90, maxWidth: 110 }}
                        >
                          {hasData ? (
                            <div className="leading-tight">
                              <p className="font-bold text-blue-800">{slot.courseCode}</p>
                              {slot.teacherInitial && (
                                <p className="text-slate-600">{slot.teacherInitial}</p>
                              )}
                              {slot.room && (
                                <p className="text-slate-500">{slot.room}</p>
                              )}
                            </div>
                          ) : (
                            <span className="text-slate-300 text-[10px]">+ add</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                );
              })
            ))}
          </tbody>
        </table>
      </div>

      {activeModal && (
        <CellModal
          slot={activeModal.slot}
          day={activeModal.day}
          period={activeModal.period}
          semester={activeModal.semester}
          onSave={handleSave}
          onClear={() => handleClear(activeModal.day, activeModal.period, activeModal.semester)}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  );
}
