import QRCode from "qrcode";
import { existsSync } from "fs";
import { mkdir, writeFile } from "fs/promises";
import { networkInterfaces } from "os";
import { join } from "path";
import type { NextRequest } from "next/server";
import { getDepartmentSettings } from "@/app/lib/store";

const UPLOAD_DIR = join(process.cwd(), "public", "uploads");

/**
 * Detect the best LAN IPv4 address on this machine.
 * Prefers addresses in the 192.168.x.x / 10.x.x.x / 172.16-31.x.x ranges
 * so phones on the same Wi-Fi can reach the server.
 */
export function detectLanIp(): string | null {
	const nets = networkInterfaces();
	const candidates: string[] = [];

	for (const iface of Object.values(nets)) {
		if (!iface) continue;
		for (const cfg of iface) {
			if (cfg.family !== "IPv4" || cfg.internal) continue;
			const ip = cfg.address;
			// Prefer private-range IPs: 192.168.x.x, 10.x.x.x, 172.16-31.x.x
			if (
				ip.startsWith("192.168.") ||
				ip.startsWith("10.") ||
				/^172\.(1[6-9]|2\d|3[01])\./.test(ip)
			) {
				candidates.unshift(ip); // prioritise these
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

/**
 * Extract a phone-reachable base URL from the incoming request.
 * If the request came in via localhost/127.0.0.1, replace the host
 * with the machine's LAN IP so the generated QR URL works on phones.
 */
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
		// Try LAN detection — this makes QR codes work on phones on the same network
		const lan = detectLanUrl(port);
		if (lan) return lan;
		// Fallback: return null so callers use the configured PUBLIC_APP_URL
		return null;
	}

	const proto = request.headers.get("x-forwarded-proto") || "http";
	return `${proto}://${host}`.replace(/\/$/, "");
}

/**
 * Resolve the public URL that will be embedded in QR codes.
 * Priority order (highest to lowest):
 *   1. requestBase already resolved from an incoming request
 *   2. PUBLIC_APP_URL env variable
 *   3. publicSiteUrl stored in DepartmentSettings DB/cookie
 *   4. NEXTAUTH_URL (only if it's not localhost)
 *   5. Auto-detected LAN IP
 *   6. VERCEL_URL
 *   7. Absolute fallback (localhost — QR won't work on phones)
 */
export async function getPublicSiteUrl(requestBase?: string | null): Promise<string> {
	// 1. Caller already resolved a real network URL
	if (requestBase?.trim()) {
		const cleaned = requestBase.trim().replace(/\/$/, "");
		if (!_isLocal(cleaned)) return cleaned;
	}

	// 2. Explicit env variable — highest confidence
	const fromEnv = process.env.PUBLIC_APP_URL?.trim().replace(/\/$/, "");
	if (fromEnv && !_isLocal(fromEnv)) return fromEnv;

	// 3. Admin-configured public URL in DB / cookie
	const settings = await getDepartmentSettings();
	const fromSettings = settings?.publicSiteUrl?.trim().replace(/\/$/, "");
	if (fromSettings && !_isLocal(fromSettings)) return fromSettings;

	// 4. NEXTAUTH_URL if it's a real host
	const fromNextAuth = process.env.NEXTAUTH_URL?.trim().replace(/\/$/, "");
	if (fromNextAuth && !_isLocal(fromNextAuth)) return fromNextAuth;

	// 5. Auto-detect LAN IP — works when PC & phone are on same Wi-Fi
	const port = Number(process.env.PORT || 3000);
	const lan = detectLanUrl(port);
	if (lan) return lan;

	// 6. Vercel deployment
	if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;

	// 7. Last resort
	return fromSettings || fromEnv || "http://localhost:3000";
}

function _isLocal(url: string): boolean {
	return (
		url.includes("localhost") ||
		url.includes("127.0.0.1") ||
		url.includes("0.0.0.0")
	);
}

export async function getSecureViewUrl(
	type: "result" | "teacher-list",
	id: string,
	requestBase?: string | null,
): Promise<string> {
	const base = await getPublicSiteUrl(requestBase);
	return `${base}/view/${type}/${id}`;
}

export async function generateQrCodeImage(
	type: "result" | "teacher-list",
	id: string,
	requestBase?: string | null,
): Promise<string> {
	if (!existsSync(UPLOAD_DIR)) {
		await mkdir(UPLOAD_DIR, { recursive: true });
	}

	const url = await getSecureViewUrl(type, id, requestBase);
	const filename = `qr-${type}-${id}.png`;
	const filepath = join(UPLOAD_DIR, filename);

	const buffer = await QRCode.toBuffer(url, {
		width: 400,
		margin: 2,
		color: { dark: "#1e3a8a", light: "#ffffff" },
	});

	await writeFile(filepath, buffer);
	return `/uploads/${filename}`;
}
