import { networkInterfaces } from "os";
import type { NextRequest } from "next/server";
import { getDepartmentSettings } from "@/app/lib/store";

/**
 * Detect the best LAN IPv4 address on this machine.
 */
export function detectLanIp(): string | null {
	const nets = networkInterfaces();
	const candidates: string[] = [];

	for (const iface of Object.values(nets)) {
		if (!iface) continue;
		for (const cfg of iface) {
			if (cfg.family !== "IPv4" || cfg.internal) continue;
			const ip = cfg.address;
			if (
				ip.startsWith("192.168.") ||
				ip.startsWith("10.") ||
				/^172\.(1[6-9]|2\d|3[01])\./.test(ip)
			) {
				candidates.unshift(ip);
			} else {
				candidates.push(ip);
			}
		}
	}

	return candidates[0] ?? null;
}

export function detectLanUrl(port = 3000): string | null {
	const ip = detectLanIp();
	return ip ? `http://${ip}:${port}` : null;
}

export function getBaseUrlFromRequest(request: NextRequest): string | null {
	const host = request.headers.get("x-forwarded-host") || request.headers.get("host");
	if (!host) return null;

	const portStr = host.includes(":") ? host.split(":")[1] : (process.env.PORT || "3000");
	const port = Number(portStr) || 3000;

	const isLocal =
		host.startsWith("localhost") ||
		host.startsWith("127.0.0.1") ||
		host.startsWith("0.0.0.0");

	if (isLocal) {
		const lan = detectLanUrl(port);
		if (lan) return lan;
		return null;
	}

	const proto = request.headers.get("x-forwarded-proto") || "https";
	return `${proto}://${host}`.replace(/\/$/, "");
}

export async function getPublicSiteUrl(requestBase?: string | null): Promise<string> {
	if (requestBase?.trim()) {
		const cleaned = requestBase.trim().replace(/\/$/, "");
		if (!_isLocal(cleaned)) return cleaned;
	}

	const fromEnv = process.env.PUBLIC_APP_URL?.trim().replace(/\/$/, "");
	if (fromEnv && !_isLocal(fromEnv)) return fromEnv;

	const settings = await getDepartmentSettings();
	const fromSettings = settings?.publicSiteUrl?.trim().replace(/\/$/, "");
	if (fromSettings && !_isLocal(fromSettings)) return fromSettings;

	const fromNextAuth = process.env.NEXTAUTH_URL?.trim().replace(/\/$/, "");
	if (fromNextAuth && !_isLocal(fromNextAuth)) return fromNextAuth;

	// Vercel deployment
	if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;

	const port = Number(process.env.PORT || 3000);
	const lan = detectLanUrl(port);
	if (lan) return lan;

	return fromSettings || fromEnv || "http://localhost:3000";
}

function _isLocal(url: string): boolean {
	return (
		url.includes("localhost") ||
		url.includes("127.0.0.1") ||
		url.includes("0.0.0.0")
	);
}

/**
 * Build a QR code image URL using the external api.qrserver.com service.
 * NO filesystem writes — works on Vercel and any platform.
 */
export function buildExternalQrUrl(targetUrl: string, size = 400): string {
	return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(targetUrl)}&color=1e3a8a&bgcolor=ffffff&margin=10`;
}

export async function getSecureViewUrl(
	type: "result" | "teacher-list",
	id: string,
	requestBase?: string | null,
): Promise<string> {
	const base = await getPublicSiteUrl(requestBase);
	return `${base}/view/${type}/${id}`;
}

/**
 * Generate a QR code URL for secure views (results, teacher-list).
 * Returns an external QR image URL — no file system writes.
 * Works on Vercel (read-only filesystem).
 */
export async function generateQrCodeImage(
	type: "result" | "teacher-list",
	id: string,
	requestBase?: string | null,
): Promise<string> {
	const url = await getSecureViewUrl(type, id, requestBase);
	return buildExternalQrUrl(url);
}

/**
 * Generate a QR code URL for a file (routine, help center, etc.).
 * If fileUrl is relative, prepend the public base URL first.
 * Returns an external QR image URL — no file system writes.
 */
export async function generateFileQrUrl(
	fileUrl: string,
	requestBase?: string | null,
): Promise<string> {
	let targetUrl = fileUrl;
	if (!fileUrl.startsWith("http://") && !fileUrl.startsWith("https://")) {
		const base = await getPublicSiteUrl(requestBase);
		targetUrl = `${base}${fileUrl.startsWith("/") ? "" : "/"}${fileUrl}`;
	}
	return buildExternalQrUrl(targetUrl);
}
