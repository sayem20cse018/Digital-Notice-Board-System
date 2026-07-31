"use client";

type Room = {
  id: string;
  roomName: string;
  description: string | null;
  floor: string | null;
  imageUrl: string | null;
  fileUrl: string | null;
  displayOrder: number;
};

type Props = { rooms: Room[] };

export default function RoomsViewClient({ rooms }: Props) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-900 via-teal-800 to-emerald-900">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-teal-900/90 backdrop-blur-md border-b border-white/10 px-4 py-3">
        <div className="mx-auto max-w-2xl">
          <h1 className="text-lg font-bold text-white">🗺️ Room Directory</h1>
          <p className="text-xs text-teal-300">
            {rooms.length > 0 ? `${rooms.length} room${rooms.length !== 1 ? "s" : ""} available` : "No rooms listed yet"}
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-2xl px-4 py-4 space-y-3">
        {rooms.length === 0 ? (
          <div className="rounded-2xl bg-white/10 p-10 text-center mt-10">
            <p className="text-4xl mb-3">🏢</p>
            <p className="text-white font-semibold text-lg">No rooms added yet</p>
            <p className="text-teal-300 text-sm mt-1">Please check back later.</p>
          </div>
        ) : (
          rooms.map((room) => <RoomCard key={room.id} room={room} />)
        )}
      </div>
    </div>
  );
}

function RoomCard({ room }: { room: Room }) {
  const hasFile = Boolean(room.fileUrl);
  const hasImage = Boolean(room.imageUrl);

  return (
    <div className="rounded-2xl bg-white overflow-hidden shadow-lg">
      {/* Room image */}
      {hasImage && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={room.imageUrl!}
          alt={room.roomName}
          className="w-full h-40 object-cover"
        />
      )}

      <div className="p-4 space-y-3">
        {/* Name + floor */}
        <div>
          <h2 className="text-lg font-bold text-slate-900">{room.roomName}</h2>
          {room.floor && (
            <p className="text-sm text-teal-700 font-medium mt-0.5">📍 {room.floor}</p>
          )}
        </div>

        {/* Description */}
        {room.description && (
          <p className="text-sm text-slate-600 leading-relaxed">{room.description}</p>
        )}

        {/* File action buttons */}
        {hasFile && (
          <div className="flex flex-wrap gap-2 pt-1">
            <a
              href={room.fileUrl!}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 rounded-xl bg-teal-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-teal-700 active:scale-95 transition-all"
            >
              <span>👁️</span> View
            </a>
            <a
              href={room.fileUrl!}
              download
              className="flex items-center gap-1.5 rounded-xl border-2 border-teal-600 px-4 py-2.5 text-sm font-semibold text-teal-700 hover:bg-teal-50 active:scale-95 transition-all"
            >
              <span>⬇️</span> Download
            </a>
            <a
              href={`https://wa.me/?text=${encodeURIComponent(room.roomName + "\n" + room.fileUrl!)}`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 rounded-xl border-2 border-green-500 px-4 py-2.5 text-sm font-semibold text-green-700 hover:bg-green-50 active:scale-95 transition-all"
            >
              <span>📤</span> Share
            </a>
          </div>
        )}

        {/* Image-only share */}
        {!hasFile && hasImage && (
          <div className="flex flex-wrap gap-2 pt-1">
            <a
              href={room.imageUrl!}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 rounded-xl bg-teal-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-teal-700 active:scale-95 transition-all"
            >
              <span>👁️</span> View Full Image
            </a>
            <a
              href={room.imageUrl!}
              download
              className="flex items-center gap-1.5 rounded-xl border-2 border-teal-600 px-4 py-2.5 text-sm font-semibold text-teal-700 hover:bg-teal-50 active:scale-95 transition-all"
            >
              <span>⬇️</span> Download
            </a>
          </div>
        )}

        {/* Nothing uploaded */}
        {!hasFile && !hasImage && (
          <p className="text-xs text-slate-400 italic">No file or image uploaded for this room.</p>
        )}
      </div>
    </div>
  );
}
