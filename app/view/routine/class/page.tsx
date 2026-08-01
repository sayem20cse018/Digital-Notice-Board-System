import { CONTENT_KEYS, listItems } from "@/app/lib/content-store";
import ClassRoutineView from "./ClassRoutineView";

export const dynamic = "force-dynamic";

export default async function ClassRoutinePage() {
  let slots: Record<string, unknown>[] = [];
  try {
    slots = await listItems(
      CONTENT_KEYS.classRoutineSlots.fileKey,
      CONTENT_KEYS.classRoutineSlots.mongoCollection,
    );
  } catch { /* empty routine */ }

  return <ClassRoutineView slots={slots as any} />;
}
