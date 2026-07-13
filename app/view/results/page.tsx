import { CONTENT_KEYS, listItems } from "@/app/lib/content-store";
import ResultsViewClient from "./ResultsViewClient";

export const dynamic = "force-dynamic";

export default async function ResultsMasterPage() {
  const { fileKey, mongoCollection } = CONTENT_KEYS.secureResult;
  const items = await listItems(fileKey, mongoCollection);

  // Only published slots, sorted by slotNumber
  const published = items
    .filter((i) => i.published)
    .sort((a, b) => Number(a.slotNumber) - Number(b.slotNumber))
    .map((i) => ({
      id: String(i.id),
      slotNumber: Number(i.slotNumber),
      title: String(i.title || `Session ${i.slotNumber}`),
    }));

  return <ResultsViewClient sessions={published} />;
}
