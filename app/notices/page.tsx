import Link from "next/link";
import { getPublicNotices } from "@/app/lib/store";

export default async function PublicNoticesPage() {
	const notices = await getPublicNotices();

	return (
		<main className="min-h-screen bg-gray-50">
			<div className="max-w-4xl mx-auto p-4 space-y-4">
				<h1 className="text-2xl font-semibold">Notices</h1>
				<div className="space-y-3">
					{notices.map((n) => (
						<article key={n.id} className="bg-white border rounded p-4">
							<h2 className="font-medium mb-1">{n.title}</h2>
							{n.body ? <p className="text-gray-700 text-sm whitespace-pre-wrap">{n.body}</p> : null}
							<div className="mt-2 flex items-center gap-3 text-sm">
								{n.pdfUrl ? (
									<a className="text-blue-600 underline" href={n.pdfUrl} target="_blank" rel="noreferrer">View PDF</a>
								) : null}
								<span className="text-gray-500">{new Date(n.createdAt).toLocaleDateString()}</span>
							</div>
						</article>
					))}
					{notices.length === 0 && (
						<p className="text-gray-600">No notices available.</p>
					)}
				</div>
				<div className="pt-6">
					<Link className="text-sm text-blue-600 underline" href="/">Back to Home</Link>
				</div>
			</div>
		</main>
	);
}


