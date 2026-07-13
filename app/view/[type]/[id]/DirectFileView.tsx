"use client";

type Props = {
  title: string;
  fileUrl: string;
};

export default function DirectFileView({ title, fileUrl }: Props) {
  const isPdf = fileUrl.toLowerCase().includes(".pdf");

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-blue-900 to-indigo-900 p-4">
      <div className="mx-auto w-full max-w-4xl rounded-2xl bg-white shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-[#1e3a8a] px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-white">{title}</h1>
            <p className="text-xs text-blue-200 mt-0.5">Department of Computer Science & Engineering</p>
          </div>
          <a
            href={fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg bg-white/15 px-3 py-1.5 text-xs font-semibold text-white hover:bg-white/25 transition"
          >
            Open full ↗
          </a>
        </div>

        {/* File content */}
        <div className="h-[85vh]">
          {isPdf ? (
            <iframe
              src={fileUrl}
              className="h-full w-full"
              title={title}
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-slate-50 p-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={fileUrl}
                alt={title}
                className="max-h-full max-w-full rounded-lg object-contain shadow-md"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
