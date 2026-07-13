import HighlightNewsSection from "./sections/HighlightNewsSection";
import DepartmentAchieversSection from "./sections/DepartmentAchieversSection";
import ProgrammingStarsSection from "./sections/ProgrammingStarsSection";
import UpdateNoticeSliderSection from "./sections/UpdateNoticeSliderSection";
import AboutUsSection from "./sections/AboutUsSection";
import QRButtonsRow from "./QRButtonsRow";
import BottomFeaturesRow from "./BottomFeaturesRow";
import DisplayRealtimeRefresh from "./DisplayRealtimeRefresh";
import type { SectionVisibility, DisplayTheme } from "@/app/lib/display-config";
import type {
  BestAlumni,
  BestProgrammer,
  HighlightNews,
  RightSidebarNotice,
  SecureResultSlot,
  TeacherListItem,
  HelpCenter,
  Researcher,
  ProjectShowcaseItem,
  RoomDirectoryItem,
} from "@/app/lib/types";
import type { AboutUsItem, EventsBoardItem } from "@/app/lib/store";

type Props = {
  bestAlumni: BestAlumni[];
  bestProgrammers: BestProgrammer[];
  teacherList: TeacherListItem | null;
  highlightNews: HighlightNews[];
  highlightDuration: number;
  secureResults: SecureResultSlot[];
  notices: RightSidebarNotice[];
  helpCenter: HelpCenter[];
  sectionVisibility: SectionVisibility;
  displayTheme: DisplayTheme;
  realtimeRefreshSeconds?: number;
  classRoutineQr?: string | null;
  examRoutineQr?: string | null;
  classRoutineFile?: string | null;
  examRoutineFile?: string | null;
  researchers?: Researcher[];
  projectShowcase?: ProjectShowcaseItem[];
  roomDirectory?: RoomDirectoryItem[];
  aboutUs?: AboutUsItem | null;
  events?: EventsBoardItem[];
};

export default function UserDisplayBoard({
  bestAlumni,
  bestProgrammers,
  teacherList,
  highlightNews,
  highlightDuration,
  secureResults,
  notices,
  helpCenter,
  sectionVisibility,
  displayTheme,
  realtimeRefreshSeconds = 15,
  classRoutineQr,
  examRoutineQr,
  classRoutineFile,
  examRoutineFile,
  projectShowcase = [],
  roomDirectory = [],
  aboutUs = null,
  events = [],
}: Props) {
  const sv = sectionVisibility as Record<string, boolean>;

  const vis = {
    highlightNews:  sv.highlightNews  !== false,
    bestAlumni:     sv.bestAlumni     !== false,
    bestProgrammer: sv.bestProgrammer !== false,
    noticeBoard:    sv.noticeBoard    !== false,
    resultsQr:      sv.resultsQr      !== false,
    teacherList:    sv.teacherList    !== false,
    helpCenter:     sv.helpCenter     !== false,
    roomInfo:       sv.roomInfo       !== false,
    researchers:    sv.researchers    !== false,
    classRoutine:   sv.classRoutine   !== false,
    examRoutine:    sv.examRoutine    !== false,
    achievements:   sv.achievements   !== false,
    events:         sv.events         !== false,
  };

  const qrRowVisible      = vis.classRoutine || vis.examRoutine || vis.resultsQr || vis.teacherList || vis.helpCenter;
  const bottomRowVisible  = vis.researchers || vis.roomInfo || vis.achievements || vis.events;
  const rightPanelVisible = vis.bestAlumni || vis.bestProgrammer || vis.noticeBoard || !!aboutUs;

  return (
    <main
      className="h-full w-full select-none overflow-hidden bg-slate-50"
      style={{
        "--display-accent": displayTheme?.accent ?? "#1e3a8a",
        "--display-highlight-bg": displayTheme?.highlightBg ?? "linear-gradient(135deg,#0f172a,#1e3a8a)",
      } as React.CSSProperties}
    >
      <DisplayRealtimeRefresh intervalSeconds={realtimeRefreshSeconds} />

      <div className="flex h-full w-full flex-col gap-1.5 p-1.5">

        {/* ── ROW 1: Hero ── */}
        {(vis.highlightNews || rightPanelVisible) && (
          <section className="min-h-0 flex-[5] overflow-hidden">
            <div className="flex h-full gap-1.5">

              {/* Highlight News — left half */}
              {vis.highlightNews && (
                <div
                  className="min-h-0 overflow-hidden rounded-xl shadow-md"
                  style={{ flex: rightPanelVisible ? "0 0 50%" : "1 1 100%" }}
                >
                  <HighlightNewsSection
                    items={highlightNews}
                    defaultInterval={highlightDuration}
                    variant="hero-split"
                  />
                </div>
              )}

              {/* Right panel — right half */}
              {rightPanelVisible && (
                <div
                  className="flex min-h-0 flex-col gap-1.5"
                  style={{ flex: vis.highlightNews ? "0 0 50%" : "1 1 100%" }}
                >
                  {/* Top: [Achievers + Stars] beside [About Us] */}
                  {(vis.bestAlumni || vis.bestProgrammer || aboutUs) && (
                    <div className="flex min-h-0 gap-1.5" style={{ flex: "2 1 0" }}>

                      {/* Left col: Achievers stacked above Stars */}
                      {(vis.bestAlumni || vis.bestProgrammer) && (
                        <div className="flex min-h-0 flex-col gap-1.5 flex-1 min-w-0">
                          {vis.bestAlumni && (
                            <div className="min-h-0 overflow-hidden" style={{ flex: "1 1 0" }}>
                              <DepartmentAchieversSection items={bestAlumni} />
                            </div>
                          )}
                          {vis.bestProgrammer && (
                            <div className="min-h-0 overflow-hidden" style={{ flex: "1 1 0" }}>
                              <ProgrammingStarsSection items={bestProgrammers} />
                            </div>
                          )}
                        </div>
                      )}

                      {/* Right col: About Us */}
                      {aboutUs && (
                        <div className="min-h-0 overflow-hidden flex-1 min-w-0">
                          <AboutUsSection data={aboutUs} />
                        </div>
                      )}
                    </div>
                  )}

                  {/* Bottom: Update Notice */}
                  {vis.noticeBoard && (
                    <div className="min-h-0 overflow-hidden" style={{ flex: "1 1 0" }}>
                      <UpdateNoticeSliderSection items={notices} />
                    </div>
                  )}
                </div>
              )}
            </div>
          </section>
        )}

        {/* ── ROW 2: QR row ── */}
        {qrRowVisible && (
          <section className="min-h-0 flex-[1.4] overflow-hidden">
            <QRButtonsRow
              secureResults={vis.resultsQr ? secureResults : []}
              teacherList={vis.teacherList ? teacherList : null}
              classRoutineQr={vis.classRoutine ? classRoutineQr : null}
              examRoutineQr={vis.examRoutine ? examRoutineQr : null}
              classRoutineFile={vis.classRoutine ? classRoutineFile : null}
              examRoutineFile={vis.examRoutine ? examRoutineFile : null}
              helpCenter={vis.helpCenter ? helpCenter : []}
              showClassRoutine={vis.classRoutine}
              showExamRoutine={vis.examRoutine}
              showResults={vis.resultsQr}
              showTeachers={vis.teacherList}
              showHelp={vis.helpCenter}
            />
          </section>
        )}

        {/* ── ROW 3: Bottom row ── */}
        {bottomRowVisible && (
          <section className="min-h-0 flex-[1.2] overflow-hidden">
            <BottomFeaturesRow
              showcaseItems={vis.researchers ? projectShowcase : []}
              notices={notices}
              rooms={vis.roomInfo ? roomDirectory : []}
              events={vis.events ? events : []}
              showShowcase={vis.researchers}
              showRooms={vis.roomInfo}
              showEvents={vis.events}
              showVoice={vis.achievements}
            />
          </section>
        )}

      </div>
    </main>
  );
}
