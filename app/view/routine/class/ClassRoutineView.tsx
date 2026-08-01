"use client";

import { DAYS, PERIODS, SEMESTERS } from "@/app/admin/class-routine-qr/RoutineEditor";
import type { Slot } from "@/app/admin/class-routine-qr/RoutineEditor";

type Props = { slots: Slot[] };

function getSlot(slots: Slot[], day: number, period: number, semester: string) {
  return slots.find(
    (s) => Number(s.day) === day && Number(s.period) === period && s.semester === semester,
  );
}

export default function ClassRoutineView({ slots }: Props) {
  const isEmpty = slots.length === 0;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-[#1e3a8a] px-4 py-4 text-center shadow-lg">
        <p className="text-xs text-blue-200 font-medium">Gopalganj Science and Technology University</p>
        <h1 className="text-base font-bold text-white mt-0.5">
          Department of Computer Science & Engineering
        </h1>
        <p className="text-xs text-blue-200 mt-0.5">Class Routine</p>
      </div>

      {isEmpty ? (
        <div className="flex flex-col items-center justify-center py-20 text-center px-4">
          <p className="text-4xl mb-4">📋</p>
          <p className="text-slate-500 text-sm">No routine added yet.</p>
          <p className="text-slate-400 text-xs mt-1">Admin can add classes from the admin panel.</p>
        </div>
      ) : (
        <div className="overflow-x-auto p-2">
          <table className="min-w-full text-[10px] border-collapse bg-white rounded-xl overflow-hidden shadow">

            {/* Header row */}
            <thead>
              <tr style={{ background: "#1e3a8a", color: "white" }}>
                <th className="border border-blue-800 px-1.5 py-1.5 text-left font-semibold">D</th>
                <th className="border border-blue-800 px-1.5 py-1.5 font-semibold whitespace-nowrap">Sem</th>
                {PERIODS.map((p) => (
                  <th key={p.id} className="border border-blue-800 px-1.5 py-1.5 font-semibold whitespace-nowrap min-w-[70px]">
                    {p.label}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {DAYS.map((dayName, dayIdx) => (
                SEMESTERS.map((sem, semIdx) => {
                  const isLastSem = semIdx === SEMESTERS.length - 1;
                  const rowBg = semIdx % 2 === 0 ? "#ffffff" : "#f8fafc";

                  return (
                    <tr key={`${dayIdx}-${sem}`} style={{ background: rowBg }}>
                      {/* Day — rowspan */}
                      {semIdx === 0 && (
                        <td
                          rowSpan={SEMESTERS.length}
                          className="border border-slate-300 text-center font-bold align-middle"
                          style={{
                            background: "#fff7ed",
                            color: "#9a3412",
                            writingMode: "vertical-rl",
                            textOrientation: "mixed",
                            transform: "rotate(180deg)",
                            minWidth: 20,
                            padding: "4px 2px",
                            fontSize: 9,
                          }}
                        >
                          {dayName}
                        </td>
                      )}

                      {/* Semester */}
                      <td
                        className="border border-slate-300 px-1.5 py-1 font-medium text-slate-700 whitespace-nowrap"
                        style={{ borderBottomWidth: isLastSem ? 2 : 1, borderBottomColor: isLastSem ? "#94a3b8" : "#cbd5e1" }}
                      >
                        {sem}
                      </td>

                      {/* Period cells */}
                      {PERIODS.map((p) => {
                        const slot = getSlot(slots, dayIdx, p.id, sem);
                        return (
                          <td
                            key={p.id}
                            className="border border-slate-300 px-1 py-1 align-top"
                            style={{
                              background: slot?.courseCode ? "#fff7ed" : undefined,
                              borderBottomWidth: isLastSem ? 2 : 1,
                              borderBottomColor: isLastSem ? "#94a3b8" : "#cbd5e1",
                              minWidth: 70,
                            }}
                          >
                            {slot?.courseCode ? (
                              <div className="leading-tight">
                                <p className="font-bold text-blue-800">{slot.courseCode}</p>
                                {slot.teacherInitial && (
                                  <p className="text-slate-600">{slot.teacherInitial}</p>
                                )}
                                {slot.room && (
                                  <p className="text-slate-500">{slot.room}</p>
                                )}
                              </div>
                            ) : null}
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
      )}

      {/* Footer */}
      <div className="text-center py-4 text-xs text-slate-400">
        CSE Department · GSTU
      </div>
    </div>
  );
}
