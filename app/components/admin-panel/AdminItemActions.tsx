"use client";

type Props = {
	published?: boolean;
	onEdit: () => void;
	onTogglePublish: () => void;
	onDelete: () => void;
};

export default function AdminItemActions({
	published,
	onEdit,
	onTogglePublish,
	onDelete,
}: Props) {
	return (
		<div className="flex flex-wrap gap-2">
			<button
				type="button"
				onClick={onEdit}
				className="rounded border border-blue-300 bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700 transition-colors hover:bg-blue-100"
			>
				Edit
			</button>
			<button
				type="button"
				onClick={onTogglePublish}
				className="rounded border border-slate-300 bg-white px-3 py-1 text-xs text-slate-700 transition-colors hover:bg-slate-100"
			>
				{published ? "Unpublish" : "Publish"}
			</button>
			<button
				type="button"
				onClick={onDelete}
				className="rounded border border-red-300 px-3 py-1 text-xs text-red-600 transition-colors hover:bg-red-50"
			>
				Delete
			</button>
		</div>
	);
}
