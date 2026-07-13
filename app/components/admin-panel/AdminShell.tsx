"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { SignOutButton } from "@/app/components/SignOutButton";
import { AdminI18nProvider, useAdminI18n } from "./AdminI18nProvider";

export const ADMIN_NAV_ITEMS = [
	// ── Main
	{ href: "/admin", label: "Dashboard", shortLabel: "Home", icon: "🏠" },
	{ href: "/admin/control-center", label: "Control Center", shortLabel: "Control", icon: "🎛️" },
	// ── Ticker / Welcome / Emergency
	{ href: "/admin/ticker", label: "Welcome & Emergency", shortLabel: "Ticker", icon: "📣" },
	// ── Hero
	{ href: "/admin/highlight-news", label: "Highlight News", shortLabel: "HL News", icon: "📰" },
	// ── Right column
	{ href: "/admin/best-alumni", label: "Dept. Achievers", shortLabel: "Achievers", icon: "⭐" },
	{ href: "/admin/best-programmer", label: "Programming Stars", shortLabel: "Stars", icon: "💻" },
	{ href: "/admin/right-sidebar-notice", label: "Update Notice", shortLabel: "Notice", icon: "📢" },
	// ── QR row
	{ href: "/admin/class-routine-qr", label: "Class Routine QR", shortLabel: "CR QR", icon: "📅" },
	{ href: "/admin/exam-routine-qr", label: "Exam Routine QR", shortLabel: "ER QR", icon: "📝" },
	{ href: "/admin/results", label: "Results (QR)", shortLabel: "Results", icon: "📊" },
	{ href: "/admin/teacher-list", label: "Teacher List (QR)", shortLabel: "Teachers", icon: "👨‍🏫" },
	// ── Bottom row
	{ href: "/admin/project-showcase", label: "Project Showcase", shortLabel: "Projects", icon: "🚀" },
	{ href: "/admin/help-center", label: "Help Center", shortLabel: "Help", icon: "🆘" },
	{ href: "/admin/room-directory", label: "Room Directory", shortLabel: "Rooms", icon: "🗺️" },
	// ── Extras
	{ href: "/admin/researcher", label: "Researchers", shortLabel: "Research", icon: "🔬" },
	{ href: "/admin/about-us", label: "About Us", shortLabel: "About", icon: "🏛️" },
	{ href: "/admin/events-board", label: "Events", shortLabel: "Events", icon: "🎉" },
	// ── Config (Settings includes Account)
	{ href: "/admin/settings", label: "Settings & Account", shortLabel: "Settings", icon: "⚙️" },
];

type Props = {
	children: React.ReactNode;
};

function AdminShellInner({ children }: Props) {
	const pathname = usePathname();
	const { t } = useAdminI18n();

	if (pathname === "/admin/login" || pathname.startsWith("/admin/login")) {
		return <>{children}</>;
	}

	const { data: session } = useSession();
	const userName = session?.user?.name;
	const isDashboard = pathname === "/admin";
	const [sidebarOpen, setSidebarOpen] = useState(!isDashboard);
	const [pendingHref, setPendingHref] = useState<string | null>(null);

	useEffect(() => {
		setSidebarOpen(!isDashboard);
	}, [isDashboard]);

	useEffect(() => {
		setPendingHref(null);
	}, [pathname]);

	const isNavigating = pendingHref !== null && pendingHref !== pathname;

	return (
		<div className="admin-portal-bg min-h-screen">
			{isNavigating && (
				<div className="admin-nav-progress fixed top-0 right-0 left-0 z-[60] h-1 bg-blue-300/80">
					<div className="admin-nav-progress-bar h-full w-1/3 bg-white" />
				</div>
			)}

			<header className="admin-glass sticky top-0 z-50 border-b border-white/20 shadow-lg">
				<div className="mx-auto flex max-w-[1600px] items-center justify-between gap-3 px-4 py-3 md:px-6">
					<div className="flex items-center gap-3">
						<button
							type="button"
							onClick={() => setSidebarOpen((v) => !v)}
							className="admin-icon-btn"
							aria-label={sidebarOpen ? "Hide menu" : "Show menu"}
						>
							<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
								<path d="M4 6h16M4 12h16M4 18h16" />
							</svg>
						</button>

						<Link prefetch className="flex items-center gap-3" href="/admin">
							<div className="admin-logo-badge">GSTUCSE</div>
							<div className="hidden sm:block">
								<p className="admin-glass-text text-base font-bold">{t("adminPanel")}</p>
								<p className="admin-glass-text-muted text-xs">Digital Notice Board</p>
							</div>
						</Link>
					</div>

					<div className="flex items-center gap-2 md:gap-3">
						<a
							href="/"
							target="_blank"
							rel="noopener noreferrer"
							className="hidden rounded-lg bg-white/15 px-3 py-2 text-xs font-medium text-white transition hover:bg-white/25 md:inline-flex"
						>
							{t("viewDisplay")} ↗
						</a>
						<div className="admin-user-badge hidden md:block">{userName || "Admin"}</div>
						<LangToggle />
						<SignOutButton />
					</div>
				</div>
			</header>

			<div className="mx-auto flex max-w-[1600px] gap-0 px-0 md:gap-6 md:px-6 md:py-6">
				{sidebarOpen && (
					<>
						<aside className="hidden w-72 flex-shrink-0 md:block">
							<nav className="admin-sidebar sticky top-24 max-h-[calc(100vh-7rem)] space-y-1 overflow-y-auto p-3">
								<p className="admin-glass-text-muted mb-3 px-2 text-xs font-bold uppercase tracking-wider">
									{t("manageSections")}
								</p>
								{ADMIN_NAV_ITEMS.map((item) => (
									<NavLink
										key={item.href}
										href={item.href}
										pathname={pathname}
										pendingHref={pendingHref}
										onNavigate={setPendingHref}
										icon={item.icon}
									>
										{item.label}
									</NavLink>
								))}
							</nav>
						</aside>

						<div className="admin-mobile-nav fixed inset-x-0 top-[57px] z-40 md:hidden">
							<div className="flex gap-2 overflow-x-auto px-3 py-2">
								{ADMIN_NAV_ITEMS.map((item) => (
									<MobileNavLink
										key={item.href}
										href={item.href}
										pathname={pathname}
										pendingHref={pendingHref}
										onNavigate={setPendingHref}
									>
										{item.shortLabel}
									</MobileNavLink>
								))}
							</div>
						</div>
					</>
				)}

				<main className="min-w-0 flex-1 pb-8 md:pb-0">
					<div className="admin-panel-surface rounded-none border-0 p-4 md:mt-0 md:rounded-2xl md:p-6 lg:p-8">
						{children}
					</div>
				</main>
			</div>

			<footer className="admin-footer mt-8 py-5">
				<div className="mx-auto flex max-w-[1600px] flex-col items-center justify-between gap-2 px-4 text-xs md:flex-row md:text-sm">
					<p className="font-medium">Gopalganj Science and Technology University — Admin Portal</p>
					<p className="opacity-70">Secure Admin Access · {new Date().getFullYear()}</p>
				</div>
			</footer>
		</div>
	);
}

export default function AdminShell({ children }: Props) {
	return (
		<AdminI18nProvider>
			<AdminShellInner>{children}</AdminShellInner>
		</AdminI18nProvider>
	);
}

function LangToggle() {
	const { lang, setLang } = useAdminI18n();
	return (
		<div className="flex overflow-hidden rounded-lg border border-white/20 bg-white/10 text-xs font-semibold">
			<button
				type="button"
				onClick={() => setLang("en")}
				className={`px-2.5 py-1.5 transition ${lang === "en" ? "bg-white text-blue-700" : "text-white hover:bg-white/15"}`}
				aria-label="Switch to English"
			>
				EN
			</button>
			<button
				type="button"
				onClick={() => setLang("bn")}
				className={`px-2.5 py-1.5 transition ${lang === "bn" ? "bg-white text-blue-700" : "text-white hover:bg-white/15"}`}
				aria-label="বাংলায় পরিবর্তন করুন"
			>
				বাং
			</button>
		</div>
	);
}

function NavLink({
	href,
	children,
	pathname,
	pendingHref,
	onNavigate,
	icon,
}: {
	href: string;
	children: React.ReactNode;
	pathname: string;
	pendingHref: string | null;
	onNavigate: (href: string) => void;
	icon: string;
}) {
	const isActive = pathname === href || (href !== "/admin" && pathname.startsWith(href));
	const isPending = pendingHref === href && !isActive;
	return (
		<Link
			prefetch
			href={href}
			onClick={() => onNavigate(href)}
			className={`admin-nav-link ${isActive ? "admin-nav-link-active" : isPending ? "admin-nav-link-pending" : ""}`}
		>
			<span className="text-base">{icon}</span>
			{children}
		</Link>
	);
}

function MobileNavLink({
	href,
	children,
	pathname,
	pendingHref,
	onNavigate,
}: {
	href: string;
	children: React.ReactNode;
	pathname: string;
	pendingHref: string | null;
	onNavigate: (href: string) => void;
}) {
	const isActive = pathname === href || (href !== "/admin" && pathname.startsWith(href));
	const isPending = pendingHref === href && !isActive;
	return (
		<Link
			prefetch
			href={href}
			onClick={() => onNavigate(href)}
			className={`flex flex-shrink-0 items-center rounded-full px-4 py-2 text-xs font-semibold whitespace-nowrap transition ${
				isActive ? "bg-white text-blue-700 shadow-md" : isPending ? "bg-white/70 text-blue-600" : "bg-white/20 text-white"
			}`}
		>
			{children}
		</Link>
	);
}
