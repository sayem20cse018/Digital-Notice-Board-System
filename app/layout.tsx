import { Inter, Merriweather, Noto_Sans_Bengali } from 'next/font/google';
import './globals.css';
import Image from 'next/image';
import { cookies, headers } from 'next/headers';
import { getDepartmentSettings, getRightSidebarNotices } from '@/app/lib/store';
import { isDbDisabled } from '@/app/lib/config';

export const dynamic = 'force-dynamic';
import { Providers } from './providers';
import { Suspense } from 'react';
import Clock from './components/Clock';
import WeatherWidget from './components/WeatherWidget';
import TickerBar from './components/TickerBar';

// Body / UI — Inter (Regular 400, Medium 500, SemiBold 600)
const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-inter',
});

// Display titles — Merriweather Bold
const merriweather = Merriweather({
  subsets: ['latin'],
  weight: ['400', '700', '900'],
  variable: '--font-merriweather',
});

// Bangla — Noto Sans Bengali
const notoBengali = Noto_Sans_Bengali({
  subsets: ['bengali'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-bangla',
});

export const metadata = {
  title: 'GSTU CSE Department',
  description: 'Gopalganj Science and Technology University - Computer Science and Engineering Department',
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const headersList = await headers();
  const pathname = headersList.get('x-pathname') || '';
  const isAdminRoute = pathname.startsWith('/admin');
  const isViewRoute = pathname.startsWith('/view');

  const stored = await getDepartmentSettings();
  const notices = (!isAdminRoute && !isViewRoute) ? await getRightSidebarNotices() : [];

  let deptName: string        = stored?.departmentName || 'Department of Computer Science & Engineering';
  let logoUrl: string | null  = stored?.logoUrl        || '/images/cse_logo.jpg';
  let welcome: string         = stored?.marqueeText    || 'Welcome to CSE Department, GSTU';
  let universityName: string  = stored?.universityName || 'Gopalganj Science and Technology University';

  if (isDbDisabled()) {
    try {
      const cookieStore = await cookies();
      const ckName    = cookieStore.get('dept_name')?.value;
      const ckLogo    = cookieStore.get('dept_logo')?.value;
      const ckWelcome = cookieStore.get('dept_welcome')?.value;
      const ckUniName = cookieStore.get('uni_name')?.value;
      if (ckName?.trim())    deptName       = ckName;
      if (ckLogo?.trim())    logoUrl        = ckLogo;
      if (ckWelcome?.trim()) welcome        = ckWelcome;
      if (ckUniName?.trim()) universityName = ckUniName;
    } catch (err) {
      console.error('Error reading cookies:', err);
    }
  }

  return (
    <html lang="en" className={isAdminRoute ? 'admin-html' : ''}>
      <head>
        <meta
          name="viewport"
          content={
            isAdminRoute
              ? 'width=device-width, initial-scale=1.0'
              : 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no'
          }
        />
      </head>
      <body
        className={`${inter.variable} ${merriweather.variable} ${notoBengali.variable} ${inter.className} ${
          isAdminRoute ? 'admin-body min-h-screen bg-gray-50' : ''
        }`}
      >
        <Providers>
          {isAdminRoute || isViewRoute ? (
            children
          ) : (
            <>
              {/* ══════════════════════════════════════════════
                  HEADER — logo | dept name + uni name | clock
                  ══════════════════════════════════════════════ */}
              <header className="display-header flex-shrink-0 w-full">
                <div className="display-header-inner flex w-full items-center gap-4 px-4 py-2">

                  {/* Left: Logo */}
                  <div className="flex-shrink-0">
                    {logoUrl ? (
                      <Image
                        src={logoUrl}
                        alt="Department Logo"
                        width={68}
                        height={68}
                        unoptimized
                        className="rounded-full border-2 border-white/30 object-cover"
                        style={{ width: 68, height: 68 }}
                      />
                    ) : (
                      <div className="h-[68px] w-[68px]" />
                    )}
                  </div>

                  {/* Centre: Dept name (big) + University name (below, larger) */}
                  <div className="flex flex-1 flex-col justify-center gap-0.5 pl-1">
                    <h1
                      className="text-xl font-extrabold leading-tight text-white md:text-2xl lg:text-3xl"
                      style={{ fontFamily: "var(--font-inter, Arial, sans-serif)", letterSpacing: "-0.01em" }}
                    >
                      {deptName}
                    </h1>
                    <p
                      className="text-base font-bold text-blue-100/90 md:text-lg lg:text-xl"
                      style={{ fontFamily: "var(--font-inter, Arial, sans-serif)" }}
                    >
                      {universityName}
                    </p>
                  </div>

                  {/* Right: Clock + Weather */}
                  <div className="flex flex-shrink-0 items-center gap-4">
                    <Suspense fallback={<div className="h-10 w-20" />}>
                      <Clock />
                    </Suspense>
                    <div className="h-8 w-px bg-white/20" />
                    <WeatherWidget />
                  </div>
                </div>
              </header>

              {/* ── TICKER ── */}
              <TickerBar welcome={welcome} notices={notices} />

              {/* ── MAIN — takes ALL remaining height (no footer) ── */}
              <div className="relative z-10 min-h-0 flex-1 overflow-hidden">{children}</div>
            </>
          )}
        </Providers>
      </body>
    </html>
  );
}
