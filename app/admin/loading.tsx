export default function AdminLoading() {
	return (
		<div className="animate-pulse space-y-4">
			<div className="h-8 w-48 rounded bg-blue-100" />
			<div className="h-4 w-72 rounded bg-blue-50" />
			<div className="mt-6 h-40 rounded-lg border border-blue-100 bg-blue-50/50" />
			<div className="h-64 rounded-lg border border-blue-100 bg-blue-50/50" />
		</div>
	);
}
