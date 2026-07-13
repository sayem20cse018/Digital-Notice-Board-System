import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
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
import ControlCenterClient from "@/app/components/admin-panel/ControlCenterClient";
import { AdminI18nProvider } from "@/app/components/admin-panel/AdminI18nProvider";

export default async function ControlCenterPage() {
  const session = await getServerSession(authOptions);
  const [
    preferences,
    alumni,
    programmers,
    news,
    researchers,
    notices,
    results,
    help,
  ] = await Promise.all([
    getAdminPreferences(),
    getBestAlumni(),
    getBestProgrammers(),
    getHighlightNews(),
    getResearchers(),
    getRightSidebarNotices(),
    getSecureResults(),
    getHelpCenter(),
  ]);

  const mediaUrls = [
    ...alumni.map((a) => a.imageUrl),
    ...programmers.map((p) => p.photoUrl),
    ...news.map((n) => n.imageUrl),
    ...researchers.map((r) => r.photoUrl),
    ...notices.map((n) => n.imageUrl),
  ].filter((u): u is string => Boolean(u));

  const userRole =
    session?.user?.name?.toLowerCase().includes("viewer")
      ? "viewer"
      : session?.user?.name?.toLowerCase().includes("editor")
        ? "editor"
        : "super";

  return (
    <AdminI18nProvider initialLang={preferences.adminLanguage}>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 md:text-3xl">Control Center</h1>
          <p className="mt-1 text-sm text-slate-600">
            Live preview, segment control, voice, analytics, theme — সব এক জায়গায়।
          </p>
        </div>
        <ControlCenterClient
          initialPreferences={preferences}
          contentSummary={{
            alumni: alumni.length,
            programmers: programmers.length,
            news: news.length,
            researchers: researchers.length,
            notices: notices.length,
            results: results.length,
            help: help.length,
          }}
          mediaUrls={mediaUrls}
          userRole={userRole}
        />
      </div>
    </AdminI18nProvider>
  );
}
