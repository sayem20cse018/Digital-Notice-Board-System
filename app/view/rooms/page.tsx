import { CONTENT_KEYS, listPublishedItems } from "@/app/lib/content-store";
import RoomsViewClient from "./RoomsViewClient";

export const dynamic = "force-dynamic";

export default async function RoomsViewPage() {
  const { fileKey, mongoCollection } = CONTENT_KEYS.roomDirectory;
  const items = await listPublishedItems(fileKey, mongoCollection, 50);

  const rooms = items.map((r) => ({
    id: String(r.id),
    roomName: String(r.roomName ?? ""),
    description: (r.description as string | null) ?? null,
    floor: (r.floor as string | null) ?? null,
    imageUrl: (r.imageUrl as string | null) ?? null,
    fileUrl: (r.fileUrl as string | null) ?? null,
    displayOrder: Number(r.displayOrder) || 0,
  }));

  return <RoomsViewClient rooms={rooms} />;
}
