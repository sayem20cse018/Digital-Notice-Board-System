import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Set path header for layout detection
  const response = NextResponse.next();
  response.headers.set("x-url", req.url);
  response.headers.set("x-pathname", pathname);

  // Only protect /admin routes (except /admin/login)
  if (!pathname.startsWith("/admin")) return response;
  if (pathname.startsWith("/admin/login")) return response;

  // Check JWT token
  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET || "next-notis-app-secret-key-2024",
  });

  if (!token) {
    const loginUrl = new URL("/admin/login", req.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
