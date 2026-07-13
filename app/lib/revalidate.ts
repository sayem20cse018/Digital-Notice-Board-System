import { revalidatePath } from "next/cache";

export function safeRevalidate(...paths: string[]) {
	for (const path of paths) {
		try {
			revalidatePath(path);
		} catch (error) {
			console.warn(`revalidatePath failed for ${path}:`, error);
		}
	}
}
