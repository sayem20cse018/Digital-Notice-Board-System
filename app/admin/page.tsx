import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import Link from "next/link";
import { getAdminPreferences } from "@/app/lib/display-settings";
import {
  getBestAlumni,
  getBestProgrammers,
  getHighlightNews,
  getResearchers,
  getRightSidebarNotices,
  getHelpCenter,
  getSecureResults,
} from "@/app/lib/store";

const MANAGE_SECTIONS = [
  {
    key: "highlightNews",
    title: "Highlight News",
    href: "/admin/highlight-news",
    description: "Large hero slideshow on the top-left of the display board.",
    icon: "📰",
    color: "from-red-500 to-rose-600",
    location: "Top Hero",
  },
  {
    key: "bestAlumni",
    title: "Dept. Achievers",
    href: "/admin/best-alumni",
    description: "Auto-slides in the right panel of the display board.",
    icon: "⭐",
    color: "from-yellow-500 to-amber-600",
    location: "Right Panel",
  },
  {
    key: "bestProgrammer",
    title: "Programming Stars",
    href: "/admin/best-programmer",
    description: "Auto-slides in the right panel of the display board.",
    icon: "💻",
    color: "from-green-500 to-emerald-600",
    location: "Right Panel",
  },
  {
    key: "aboutUs",
    title: "About Us",
    href: "/admin/about-us",
    description: "Department overview shown beside Achievers and Stars.",
    icon: "🏛️",
    color: "from-cyan-500 to-blue-600",
    location: "Right Panel",
  },
  {
    key: "noticeBoard",
    title: "Update Notice",
    href: "/admin/right-sidebar-notice",
    description: "Notice slides shown at the bottom of the right panel.",
    icon: "📢",
    color: "from-orange-500 to-red-500",
    location: "Right Panel",
  },
  {
    key: "ticker",
    title: "Welcome & Emergency",
    href: "/admin/ticker",
    description: "Manage the welcome text and emergency notice ticker bar.",
    icon: "📣",
    color: "from-pink-500 to-rose-600",
    location: "Ticker Bar",
  },
  {
    key: "classRoutine",
    title: "Class Routine QR",
    href: "/admin/class-routine-qr",
    description: "Upload class routine and set QR code for the display board.",
    icon: "📅",
    color: "from-blue-400 to-blue-600",
    location: "QR Row",
  },
  {
    key: "examRoutine",
    title: "Exam Routine QR",
    href: "/admin/exam-routine-qr",
    description: "Upload exam routine and set QR code for the display board.",
    icon: "📝",
    color: "from-sky-400 to-cyan-600",
    location: "QR Row",
  },
  {
    key: "resultsQr",
    title: "Results (QR)",
    href: "/admin/results",
    description: "Upload results and QR code shown in the QR tile row.",
    icon: "📊",
    color: "from-emerald-500 to-teal-600",
    location: "QR Row",
  },
  {
    key: "teacherList",
    title: "Teacher List (QR)",
    href: "/admin/teacher-list",
    description: "Upload teacher list and QR code for the display board.",
    icon: "👨‍🏫",
    color: "from-indigo-500 to-blue-600",
    location: "QR Row",
  },
  {
    key: "helpCenter",
    title: "Help Center",
    href: "/admin/help-center",
    description: "Office and CRS contact numbers with QR codes.",
    icon: "🆘",
    color: "from-teal-500 to-cyan-600",
    location: "QR Row",
  },
  {
    key: "researchers",
    title: "Project Showcase",
    href: "/admin/project-showcase",
    description: "Project showcase slides in the bottom row.",
    icon: "🚀",
    color: "from-violet-500 to-purple-600",
    location: "Bottom Row",
  },
  {
    key: "roomInfo",
    title: "Room Directory",
    href: "/admin/room-directory",
    description: "Room info with auto-generated QR codes.",
    icon: "🗺️",
    color: "from-blue-500 to-sky-600",
    location: "Bottom Row",
  },
  {
    key: "achievements",
    title: "Voice Announcement",
    href: "/admin/right-sidebar-notice",
    description: "Voice announcement tile in the bottom row.",
    icon: "🔊",
    color: "from-amber-500 to-yellow-600",
    location: "Bottom Row",
  },
  {
    key: "researcher",
    title: "Researchers",
    href: "/admin/researcher",
    description: "Research publications for the department.",
    icon: "🔬",
    color: "from-purple-400 to-violet-600",
    location: "Extra",
  },
  {
    key: "settings",
    title: "Settings & Account",
    href: "/admin/settings",
    description: "Department info, logo, marquee text and account settings.",
    icon: "⚙️",
    color: "from-slate-400 to-gray-600",
    location: "Config",
  },
] as const;

export default async function AdminHomePage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    return (
      <div className="p-6">
        <p className="mb-4">Not authenticated.</p>
        <Link className="text-blue-600 underline" href="/admin/login">
          Go to Login
        </Link>
      </div>
    );
  }

  const [prefs, alumni, programmers, news, , notices, results, help] =
    await Promise.all([
      getAdminPreferences(),
      getBestAlumni(),
      getBestProgrammers(),
      getHighlightNews(),
      getResearchers(),
      getRightSidebarNotices(),
      getSecureResults(),
      getHelpCenter(),
    ]);

  const activeSegments = Object.values(prefs.sectionVisibility).filter(Boolean).length;

  const countMap: Record<string, number> = {
    highlightNews:  news.length,
    bestAlumni:     alumni.length,
    bestProgrammer: programmers.length,
    noticeBoard:    notices.length,
    resultsQr:      results.length,
    teacherList:    0,
    researchers:    0,
    helpCenter:     help.length,
    roomInfo:       0,
  };

  return (
    <div className="space-y-8">
      {/* Hero banner */}
      <div className="admin-dashboard-hero">
        <div className="relative z-10">
          <p className="text-sm font-medium text-blue-200">Smart Digital Notice Board</p>
          <h1 className="mt-1 text-3xl font-bold text-white md:text-4xl">Admin Dashboard</h1>
          <p className="admin-glass-text-muted mt-2 max-w-xl">
            Welcome back,{" "}
            <span className="font-semibold text-white">{session.user?.name || "Admin"}</span>
            {" "}— manage all display board segments from here.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl bg-white/15 px-5 py-2.5 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/25"
            >
              🖥️ View Display Board ↗
            </a>
          </div>
        </div>
        <div className="admin-dashboard-hero-glow" />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard label="Active Segments"  value={`${activeSegments}/12`}      icon="📊" />
        <StatCard label="Highlight News"   value={String(news.length)}          icon="📰" />
        <StatCard label="Update Notices"   value={String(notices.length)}       icon="📢" />
        <StatCard label="Refresh Rate"     value={`${prefs.realtimeRefreshSeconds}s`} icon="⚡" />
      </div>

      {/* All sections */}
      <div>
        <h2 className="mb-4 text-xl font-bold text-slate-900">Manage Content</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {MANAGE_SECTIONS.map((section) => (
            <SectionCard
              key={section.key}
              title={section.title}
              href={section.href}
              description={section.description}
              icon={section.icon}
              color={section.color}
              location={section.location}
              count={countMap[section.key]}
              isOn={(prefs.sectionVisibility as Record<string, boolean>)[section.key] !== false}
            />
          ))}
        </div>
      </div>

      {/* Guide */}
      <div className="admin-feature-card border-l-4 border-blue-500">
        <h3 className="font-bold text-slate-800">How it works</h3>
        <ul className="mt-3 space-y-2 text-sm text-slate-600">
          <li>✅ Use <strong>Control Center</strong> to toggle any segment ON/OFF — the display board updates automatically.</li>
          <li>✅ Click any section card to add, edit or delete content.</li>
          <li>✅ Items with <strong>Published</strong> checked will show on the display board.</li>
          <li>✅ Click <strong>View Display Board</strong> above to see the live board.</li>
        </ul>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon }: { label: string; value: string; icon: string }) {
  return (
    <div className="admin-stat-card">
      <span className="text-2xl">{icon}</span>
      <p className="mt-1 text-2xl font-bold text-slate-900">{value}</p>
      <p className="text-xs text-slate-500">{label}</p>
    </div>
  );
}

function SectionCard({
  title,
  href,
  description,
  icon,
  color,
  location,
  count,
  isOn,
}: {
  title: string;
  href: string;
  description: string;
  icon: string;
  color: string;
  location: string;
  count?: number;
  isOn?: boolean;
}) {
  return (
    <Link prefetch href={href} className="admin-dashboard-card group relative overflow-hidden">
      <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${color}`} />
      <div className="flex items-start gap-3 pt-3">
        <span className="text-2xl leading-none">{icon}</span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h2 className="font-bold text-slate-900 group-hover:text-blue-700">{title}</h2>
            {isOn !== undefined && (
              <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${isOn ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}>
                {isOn ? "ON" : "OFF"}
              </span>
            )}
          </div>
          <div className="mt-1 flex items-center gap-2">
            <span className="inline-block rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700">
              {location}
            </span>
            {count !== undefined && count > 0 && (
              <span className="text-xs text-slate-400">{count} items</span>
            )}
          </div>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">{description}</p>
          <p className="mt-3 text-sm font-semibold text-blue-600 group-hover:underline">Manage →</p>
        </div>
      </div>
    </Link>
  );
}
