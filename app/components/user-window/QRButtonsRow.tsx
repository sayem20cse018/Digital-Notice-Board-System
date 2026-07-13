import Image from "next/image";
import type { SecureResultSlot, TeacherListItem, HelpCenter } from "@/app/lib/types";

type Props = {
  secureResults: SecureResultSlot[];
  teacherList: TeacherListItem | null;
  classRoutineQr?: string | null;
  examRoutineQr?: string | null;
  classRoutineFile?: string | null;
  examRoutineFile?: string | null;
  helpCenter?: HelpCenter[];
  showClassRoutine?: boolean;
  showExamRoutine?: boolean;
  showResults?: boolean;
  showTeachers?: boolean;
  showHelp?: boolean;
};

type QrTile = {
  kind: "qr";
  label: string;
  sublabel: string;
  iconEmoji: string;
  accentColor: string;
  qrUrl?: string | null;
  targetUrl?: string | null;
};
type HelpTile = {
  kind: "help";
  label: string;
  iconEmoji: string;
  accentColor: string;
  office?: string;
  officeQr?: string | null;
  crs?: string;
  crsQr?: string | null;
};
type TileConfig = QrTile | HelpTile;

/* ── Shared card shell ── */
function CardShell({
  children,
  href,
}: {
  children: React.ReactNode;
  href?: string | null;
}) {
  const cls =
    "flex h-full flex-1 min-w-0 items-center gap-3 overflow-hidden rounded-xl border border-slate-200 bg-white px-3 transition";
  const style = { boxShadow: "0 4px 20px rgba(0,0,0,0.09), 0 1px 4px rgba(0,0,0,0.05)" };
  if (href)
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={cls}
        style={style}
        aria-label="Open link"
      >
        {children}
      </a>
    );
  return <div className={cls} style={style}>{children}</div>;
}

/* ── Square icon box ── */
function IconBox({ emoji, bg }: { emoji: string; bg: string }) {
  return (
    <div
      className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl shadow-md"
      style={{ background: bg }}
    >
      <span className="text-xl leading-none">{emoji}</span>
    </div>
  );
}

/* ── QR card tile ── */
function QRTileCard({ label, sublabel, iconEmoji, accentColor, qrUrl, targetUrl }: QrTile) {
  return (
    <CardShell href={targetUrl}>
      <IconBox emoji={iconEmoji} bg={accentColor} />

      <div className="min-w-0 flex-1">
        <p
          className="text-sm font-bold leading-tight text-slate-900"
          style={{ fontFamily: "var(--font-merriweather, Georgia, serif)", fontWeight: 700 }}
        >
          {label}
        </p>
        <p className="mt-0.5 text-[10px] leading-tight text-slate-500">
          {sublabel}
        </p>
      </div>

      {/* QR code */}
      <div className="flex-shrink-0">
        {qrUrl ? (
          <div className="relative h-14 w-14 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
            <Image
              src={qrUrl}
              alt={`${label} QR`}
              fill
              className="object-contain p-0.5"
              unoptimized
            />
          </div>
        ) : (
          <div className="flex h-14 w-14 flex-col items-center justify-center gap-0.5 rounded-lg border border-dashed border-slate-300 bg-slate-50">
            <span className="text-[8px] text-slate-400">QR</span>
            <span className="text-[8px] text-slate-400">not set</span>
          </div>
        )}
      </div>
    </CardShell>
  );
}

/* ── Help Center tile — shows phone numbers + QR codes ── */
function HelpTileCard({ label, iconEmoji, accentColor, office, officeQr, crs, crsQr }: HelpTile) {
  const activeQr = officeQr ?? crsQr ?? null;

  return (
    <CardShell>
      <IconBox emoji={iconEmoji} bg={accentColor} />

      <div className="min-w-0 flex-1">
        <p
          className="text-sm font-bold leading-tight text-slate-900"
          style={{ fontFamily: "var(--font-merriweather, Georgia, serif)", fontWeight: 700 }}
        >
          {label}
        </p>
        <div className="mt-1 space-y-0.5">
          {office && (
            <p className="truncate text-[10px] text-slate-600">
              <span className="font-semibold text-slate-500">Office: </span>{office}
            </p>
          )}
          {crs && (
            <p className="truncate text-[10px] text-slate-600">
              <span className="font-semibold text-slate-500">CRS: </span>{crs}
            </p>
          )}
          {!office && !crs && (
            <p className="text-[10px] text-slate-400">No contact set</p>
          )}
        </div>
      </div>

      {/* QR code — show office QR first, fallback to CRS QR */}
      <div className="flex-shrink-0">
        {activeQr ? (
          <div className="relative h-14 w-14 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
            <Image
              src={activeQr}
              alt="Help Center QR"
              fill
              className="object-contain p-0.5"
              unoptimized
            />
          </div>
        ) : (
          <div className="flex h-14 w-14 flex-col items-center justify-center gap-0.5 rounded-lg border border-dashed border-slate-300 bg-slate-50">
            <span className="text-[8px] text-slate-400">QR</span>
            <span className="text-[8px] text-slate-400">not set</span>
          </div>
        )}
      </div>
    </CardShell>
  );
}

export default function QRButtonsRow({
  secureResults,
  teacherList,
  classRoutineQr,
  examRoutineQr,
  classRoutineFile,
  examRoutineFile,
  helpCenter = [],
  showClassRoutine = true,
  showExamRoutine = true,
  showResults = true,
  showTeachers = true,
  showHelp = true,
}: Props) {
  const resultSlot = secureResults.find((r) => r.published && r.qrCodeUrl);
  const office = helpCenter.find((h) => h.contactType === "office");
  const crs    = helpCenter.find((h) => h.contactType === "crs");

  const allTiles: TileConfig[] = [
    showClassRoutine && {
      kind: "qr" as const,
      label: "Class Routine",
      sublabel: "Scan for schedule",
      iconEmoji: "📅",
      accentColor: "linear-gradient(135deg,#1e3a8a,#2563eb)",
      qrUrl: classRoutineQr,
      targetUrl: classRoutineFile ?? classRoutineQr,
    },
    showExamRoutine && {
      kind: "qr" as const,
      label: "Exam Routine",
      sublabel: "Scan for exam schedule",
      iconEmoji: "📝",
      accentColor: "linear-gradient(135deg,#1e40af,#3b82f6)",
      qrUrl: examRoutineQr,
      targetUrl: examRoutineFile ?? examRoutineQr,
    },
    showResults && {
      kind: "qr" as const,
      label: "Result",
      sublabel: "Scan to view results",
      iconEmoji: "📊",
      accentColor: "linear-gradient(135deg,#065f46,#059669)",
      qrUrl: resultSlot?.qrCodeUrl,
      targetUrl: "/view/results",
    },
    showTeachers && {
      kind: "qr" as const,
      label: "Department Teachers",
      sublabel: "Scan for teacher list",
      iconEmoji: "👨‍🏫",
      accentColor: "linear-gradient(135deg,#4c1d95,#7c3aed)",
      qrUrl: teacherList?.published ? teacherList.qrCodeUrl : null,
      targetUrl: teacherList?.published ? (teacherList.fileUrl ?? teacherList.qrCodeUrl) : null,
    },
    showHelp && {
      kind: "help" as const,
      label: "Help Center",
      iconEmoji: "🆘",
      accentColor: "linear-gradient(135deg,#7f1d1d,#dc2626)",
      office:    office?.phoneNumber,
      officeQr:  office?.qrCodeUrl ?? null,
      crs:       crs?.phoneNumber,
      crsQr:     crs?.qrCodeUrl ?? null,
    },
  ].filter(Boolean) as TileConfig[];

  return (
    <div className="flex h-full w-full gap-2">
      {allTiles.map((tile) =>
        tile.kind === "qr" ? (
          <QRTileCard key={tile.label} {...tile} />
        ) : (
          <HelpTileCard key={tile.label} {...tile} />
        ),
      )}
    </div>
  );
}
