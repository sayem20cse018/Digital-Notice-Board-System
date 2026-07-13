/** Compute responsive text/image scale based on item count for single-screen layout. */

export function getItemScale(count: number): {
	textClass: string;
	imageSize: number;
	gapClass: string;
	paddingClass: string;
	headerClass: string;
} {
	if (count <= 1) {
		return { textClass: "text-[11px]", imageSize: 64, gapClass: "gap-1", paddingClass: "p-1.5", headerClass: "text-xs" };
	}
	if (count <= 2) {
		return { textClass: "text-[10px]", imageSize: 52, gapClass: "gap-1", paddingClass: "p-1", headerClass: "text-[10px]" };
	}
	if (count <= 4) {
		return { textClass: "text-[9px]", imageSize: 44, gapClass: "gap-0.5", paddingClass: "p-1", headerClass: "text-[9px]" };
	}
	if (count <= 6) {
		return { textClass: "text-[8px]", imageSize: 36, gapClass: "gap-0.5", paddingClass: "p-0.5", headerClass: "text-[8px]" };
	}
	if (count <= 10) {
		return { textClass: "text-[7px]", imageSize: 28, gapClass: "gap-0.5", paddingClass: "p-0.5", headerClass: "text-[7px]" };
	}
	if (count <= 14) {
		return { textClass: "text-[6px]", imageSize: 22, gapClass: "gap-0.5", paddingClass: "p-0.5", headerClass: "text-[6px]" };
	}
	return { textClass: "text-[5px]", imageSize: 18, gapClass: "gap-0.5", paddingClass: "p-0.5", headerClass: "text-[5px]" };
}

export function getHighlightHeight(count: number): string {
	if (count <= 1) return "h-[55%]";
	if (count <= 3) return "h-[50%]";
	return "h-[45%]";
}
