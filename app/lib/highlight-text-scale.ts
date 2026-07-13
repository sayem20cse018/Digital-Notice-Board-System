/** Adaptive typography for highlight carousel — long text auto-shrinks to stay visible. */

export function getHighlightTextScale(title: string, description?: string | null) {
  const titleLen = title.length;
  const descLen = description?.length ?? 0;
  const total = titleLen + descLen;

  if (total <= 35) {
    return {
      titleClass: "text-base sm:text-lg md:text-xl",
      descClass: "text-xs sm:text-sm",
      titleLines: 2,
      descLines: 2,
    };
  }
  if (total <= 70) {
    return {
      titleClass: "text-sm sm:text-base md:text-lg",
      descClass: "text-[11px] sm:text-xs",
      titleLines: 2,
      descLines: 2,
    };
  }
  if (total <= 120) {
    return {
      titleClass: "text-xs sm:text-sm md:text-base",
      descClass: "text-[10px] sm:text-[11px]",
      titleLines: 2,
      descLines: 3,
    };
  }
  if (total <= 200) {
    return {
      titleClass: "text-[11px] sm:text-xs md:text-sm",
      descClass: "text-[9px] sm:text-[10px]",
      titleLines: 3,
      descLines: 3,
    };
  }
  return {
    titleClass: "text-[10px] sm:text-[11px] md:text-xs",
    descClass: "text-[8px] sm:text-[9px]",
    titleLines: 3,
    descLines: 4,
  };
}

export function lineClampClass(lines: number): string {
  if (lines <= 1) return "line-clamp-1";
  if (lines === 2) return "line-clamp-2";
  if (lines === 3) return "line-clamp-3";
  return "line-clamp-4";
}
