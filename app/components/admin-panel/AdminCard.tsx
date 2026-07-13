import type { ReactNode } from "react";

type Props = {
  title: string;
  children: ReactNode;
};

export function AdminFormCard({ title, children }: Props) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="mb-4 text-lg font-semibold text-slate-900">{title}</h2>
      {children}
    </section>
  );
}

export function AdminListCard({ title, children }: Props) {
  return (
    <section className="rounded-xl border border-slate-200 bg-slate-50 p-6 shadow-sm">
      <h2 className="mb-4 text-lg font-semibold text-slate-900">{title}</h2>
      {children}
    </section>
  );
}
