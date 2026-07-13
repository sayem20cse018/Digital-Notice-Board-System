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

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function Home() {
  const [
    settings,
    preferences,
    bestAlumni,
    bestProgrammers,
    teacherList,
    highlightNews,
    secureResults,
    notices,
    helpCenter,
    researchers,
    classRoutineQrData,
    examRoutineQrData,
    projectShowcase,
    roomDirectory,
    aboutUs,
    events,
  ] = await Promise.all([
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
