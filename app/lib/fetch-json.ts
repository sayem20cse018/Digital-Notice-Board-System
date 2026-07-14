export async function parseJsonResponse<T = Record<string, unknown>>(res: Response): Promise<T> {
	const text = await res.text();
	if (!text) {
		throw new Error(`Empty server response (${res.status})`);
	}

	try {
		return JSON.parse(text) as T;
	} catch {
		const preview = text.slice(0, 120).replace(/\s+/g, " ").trim();
		if (preview.startsWith("Internal Server Error") || preview.startsWith("<!DOCTYPE")) {
			throw new Error(
				"Server error — DATABASE_URL check করুন (.env.local) অথবা server restart করুন",
			);
		}
		throw new Error(preview || `Invalid server response (${res.status})`);
	}
}

export async function fetchJson<T = Record<string, unknown>>(
	url: string,
	init?: RequestInit,
): Promise<T> {
	const res = await fetch(url, init);
	console.log(url)
	console.log(res)
	const data = await parseJsonResponse<T>(res);
	return data;
}
