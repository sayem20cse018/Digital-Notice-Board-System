import { notFound } from "next/navigation";
import { CONTENT_KEYS, listItems } from "@/app/lib/content-store";
import FileViewPage from "./FileViewPage";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ type?: string }>;
};

const TYPE_MAP: Record<string, { fileKey: string; mongoCollection: string; titleField: string }> = {
  "class-routine": { ...CONTENT_KEYS.classRoutineQr, titleField: "title" },
  "exam-routine":  { ...CONTENT_KEYS.examRoutineQr,  titleField: "title" },
  "help-office":   { ...CONTENT_KEYS.helpCenter,     titleField: "officeName" },
  "help-crs":      { ...CONTENT_KEYS.helpCenter,     titleField: "officeName" },
};

export default async function ViewFilePage({ params, searchParams }: Props) {
  const { id } = await params;
  const { type = "class-routine" } = await searchParams;

  const config = TYPE_MAP[type];
  if (!config) notFound();

  let items;
  try {
    items = await listItems(config.fileKey, config.mongoCollection);
  } catch {
    notFound();
  }

  let item;
  if (type === "help-office") {
    item = items.find((i) => String(i.id) === id && i.contactType === "office");
  } else if (type === "help-crs") {
    item = items.find((i) => String(i.id) === id && i.contactType === "crs");
  } else {
    item = items.find((i) => String(i.id) === id);
  }

  if (!item) notFound();

  const fileUrl = String(item.fileUrl || "");
  if (!fileUrl) notFound();

  const title = String(item[config.titleField] ?? type);

  return <FileViewPage title={title} fileUrl={fileUrl} />;
}
