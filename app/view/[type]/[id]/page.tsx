import { notFound } from "next/navigation";
import { CONTENT_KEYS, listItems } from "@/app/lib/content-store";
import SecureViewClient from "./SecureViewClient";
import DirectFileView from "./DirectFileView";

type Props = {
  params: Promise<{ type: string; id: string }>;
};

export default async function SecureViewPage({ params }: Props) {
  const { type, id } = await params;

  if (type !== "result" && type !== "teacher-list") {
    notFound();
  }

  const key = type === "result" ? CONTENT_KEYS.secureResult : CONTENT_KEYS.teacherList;
  const items = await listItems(key.fileKey, key.mongoCollection);
  const item = items.find((i) => String(i.id) === id && i.published);

  if (!item) {
    notFound();
  }

  // Teacher list — no password, show directly
  if (type === "teacher-list") {
    return (
      <DirectFileView
        title={String(item.title || "Teacher List")}
        fileUrl={String(item.fileUrl || "")}
      />
    );
  }

  // Result — password protected
  return (
    <SecureViewClient
      type={type}
      id={id}
      title={String(item.title || "Exam Result")}
    />
  );
}
