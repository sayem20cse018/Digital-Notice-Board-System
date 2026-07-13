import Link from "next/link";

type Props = {
  title: string;
  subtitle?: string;
  backHref?: string;
  backLabel?: string;
};

export default function AdminPageHeader({
  title,
  subtitle,
  backHref = "/admin",
  backLabel = "Back to Dashboard",
}: Props) {
  return (
    <div className="flex flex-col gap-3 border-b border-slate-200 pb-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-slate-600">{subtitle}</p>}
      </div>
      <Link className="shrink-0 text-sm font-medium text-blue-600 underline hover:text-blue-800" href={backHref}>
        {backLabel}
      </Link>
    </div>
  );
}
