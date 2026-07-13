import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
	function middleware(req) {
		const response = NextResponse.next();
		response.headers.set("x-url", req.url);
		response.headers.set("x-pathname", req.nextUrl.pathname);
		return response;
	},
	{
		callbacks: {
			authorized: ({ token, req }) => {
				const { pathname } = req.nextUrl;
				if (!pathname.startsWith("/admin")) return true;
				if (pathname.startsWith("/admin/login")) return true;
				return !!token;
			},
		},
		pages: { signIn: "/admin/login" },
	},
);

export const config = {
	matcher: [
		"/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
	],
};
