import AutoCarousel from "../AutoCarousel";
import type { HighlightNews } from "@/app/lib/types";

type Props = {
  items: HighlightNews[];
  defaultInterval?: number;
  variant?: "default" | "hero" | "hero-split";
};

export default function HighlightNewsSection({
  items,
  defaultInterval = 5,
  variant = "default",
}: Props) {
  return (
    <section
      className="flex h-full min-h-0 flex-col overflow-hidden rounded-xl bg-white border border-slate-200"
      style={{ boxShadow: "0 4px 20px rgba(0,0,0,0.10), 0 1px 4px rgba(0,0,0,0.06)" }}
    >
      {/* ── FIXED header bar ── */}
      <header className="flex-shrink-0 flex items-center bg-[#166534] px-4 py-2">
        <h3
          className="text-sm font-bold tracking-wide text-white"
          style={{ fontFamily: "var(--font-inter, Arial, sans-serif)" }}
        >
          Highlight News
        </h3>
      </header>

      {/* ── Carousel content ── */}
      <div className="relative min-h-0 flex-1 overflow-hidden">
        {items.length === 0 ? (
          <div className="flex h-full items-center justify-center text-sm text-slate-400">
            No highlight news yet.
          </div>
        ) : (
          <AutoCarousel
            items={items}
            defaultInterval={defaultInterval}
            variant={variant}
            readOnly
          />
        )}
      </div>
    </section>
  );
}
