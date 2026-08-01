import UserDisplayBoard from "@/app/components/user-window/UserDisplayBoard";
import {
  getBestAlumni,
  getBestProgrammers,
  getHighlightNews,
  getRightSidebarNotices,
  getHelpCenter,
  getSecureResults,
  getTeacherListPublic,
  getDepartmentSettings,
  getResearchers,
  getClassRoutineQr,
  getExamRoutineQr,
  getProjectShowcase,
  getRoomDirectory,
  getAboutUs,
  getEventsBoard,
} from "@/app/lib/store";
import { getAdminPreferences } from "@/app/lib/display-settings";
import { DEFAULT_ADMIN_PREFERENCES } from "@/app/lib/display-config";

export const dynamic = "force-dynamic";

// Helper — returns value or fallback if the promise rejected
function settled<T>(result: PromiseSettledResult<T>, fallback: T): T {
  return result.status === "fulfilled" ? result.value : fallback;
}

export default async function Home() {
  // Use allSettled so a single DB failure never crashes the whole page
  const [
    settingsR,
    preferencesR,
    bestAlumniR,
    bestProgrammersR,
    teacherListR,
    highlightNewsR,
    secureResultsR,
    noticesR,
    helpCenterR,
    researchersR,
    classRoutineQrR,
    examRoutineQrR,
    projectShowcaseR,
    roomDirectoryR,
    aboutUsR,
    eventsR,
  ] = await Promise.allSettled([
    getDepartmentSettings(),
    getAdminPreferences(),
    getBestAlumni(),
    getBestProgrammers(),
    getTeacherListPublic(),
    getHighlightNews(),
    getSecureResults(),
    getRightSidebarNotices(),
    getHelpCenter(),
    getResearchers(),
    getClassRoutineQr(),
    getExamRoutineQr(),
    getProjectShowcase(),
    getRoomDirectory(),
    getAboutUs(),
    getEventsBoard(),
  ]);

  const settings        = settled(settingsR, null);
  const preferences     = settled(preferencesR, DEFAULT_ADMIN_PREFERENCES);
  const bestAlumni      = settled(bestAlumniR, []);
  const bestProgrammers = settled(bestProgrammersR, []);
  const teacherList     = settled(teacherListR, null);
  const highlightNews   = settled(highlightNewsR, []);
  const secureResults   = settled(secureResultsR, []);
  const notices         = settled(noticesR, []);
  const helpCenter      = settled(helpCenterR, []);
  const researchers     = settled(researchersR, []);
  const classRoutineQrData = settled(classRoutineQrR, null);
  const examRoutineQrData  = settled(examRoutineQrR, null);
  const projectShowcase = settled(projectShowcaseR, []);
  const roomDirectory   = settled(roomDirectoryR, []);
  const aboutUs         = settled(aboutUsR, null);
  const events          = settled(eventsR, []);

  const highlightDuration = settings?.highlightSlideDuration ?? 5;

  return (
    <UserDisplayBoard
      bestAlumni={bestAlumni}
      bestProgrammers={bestProgrammers}
      teacherList={teacherList}
      highlightNews={highlightNews}
      highlightDuration={highlightDuration}
      secureResults={secureResults}
      notices={notices}
      helpCenter={helpCenter}
      researchers={researchers}
      projectShowcase={projectShowcase}
      roomDirectory={roomDirectory}
      aboutUs={aboutUs}
      events={events}
      sectionVisibility={preferences.sectionVisibility}
      displayTheme={preferences.displayTheme}
      realtimeRefreshSeconds={preferences.realtimeRefreshSeconds}
      classRoutineQr={classRoutineQrData?.published ? classRoutineQrData.qrCodeUrl ?? null : null}
      examRoutineQr={examRoutineQrData?.published ? examRoutineQrData.qrCodeUrl ?? null : null}
    />
  );
}
