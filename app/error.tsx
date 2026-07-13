"use client";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
	return (
		<div className="max-w-2xl mx-auto p-6">
			<h1 className="text-2xl font-semibold mb-2">Something went wrong</h1>
			<p className="text-red-700 whitespace-pre-wrap text-sm mb-4">{error.message}</p>
			{error.digest ? <p className="text-xs text-gray-500 mb-4">Digest: {error.digest}</p> : null}
			<button onClick={() => reset()} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">Try again</button>
		</div>
	);
}


