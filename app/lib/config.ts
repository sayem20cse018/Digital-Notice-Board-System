export function isDbDisabled(): boolean {
	return process.env.SKIP_DB === "1" || process.env.SKIP_DB === "true";
}


