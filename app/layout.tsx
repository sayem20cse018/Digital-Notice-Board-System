import { Outfit } from 'next/font/google';
import './globals.css';
import Image from 'next/image';
import { cookies, headers } from 'next/headers';
import { getDepartmentSettings, getRightSidebarNotices } from '@/app/lib/store';
import { isDbDisabled } from '@/app/lib/config';
import { Providers } from './providers';
import { Suspense } from 'react';
import Clock from './components/Clock';
import WeatherWidget from './components/WeatherWidget';
import TickerBar from './components/TickerBar';

export const dynamic = 'force-dynamic';

const outfit = Outfit({ subsets: ['latin'], weight: ['400', '500', '600', '700'] });

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

  let deptName: string = stored?.departmentName || 'Department of Computer Science & Engineering';
  let logoUrl: string | null = stored?.logoUrl || '/images/cse_logo.jpg';
  let welcome: string = stored?.marqueeText || 'Welcome to CSE Department, GSTU';
  let universityName: string =
    stored?.universityName || 'Gopalganj Science and Technology University';
  let universityLogoUrl: string = stored?.universityLogoUrl || '/images/GSTUlogo.png';

  if (isDbDisabled()) {
    try {
      const cookieStore = await cookies();
      const ckName = cookieStore.get('dept_name')?.value;
      const ckLogo = cookieStore.get('dept_logo')?.value;
      const ckWelcome = cookieStore.get('dept_welcome')?.value;
      const ckUniName = cookieStore.get('uni_name')?.value;
      const ckUniLogo = cookieStore.get('uni_logo')?.value;

      if (ckName?.trim()) deptName = ckName;
      if (ckLogo?.trim()) logoUrl = ckLogo;
      if (ckWelcome?.trim()) welcome = ckWelcome;
      if (ckUniName?.trim()) universityName = ckUniName;
      if (ckUniLogo?.trim()) universityLogoUrl = ckUniLogo;
    } catch (err) {
      console.error('Error reading cookies:', err);
    }
  }

  return (
    <html lang="en" className={isAdminRoute ? 'admin-html' : 'h-full'}>
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
        className={`${outfit.className} ${
          isAdminRoute ? 'admin-body min-h-screen bg-gray-50' : 'min-h-screen flex flex-col'
        }`}
      >
        <Providers>
          {isAdminRoute || isViewRoute ? (
            children
          ) : (
            <>
              {/* ── HEADER ── dark navy bar: logo | dept name | clock + weather */}
              <header className="display-header flex-shrink-0 w-full">
                <div className="display-header-inner flex w-full items-center gap-3 px-4 py-2">
                  {/* Logo */}
                  <div className="flex-shrink-0">
                    {logoUrl ? (
                      <Image
                        src={logoUrl}
                        alt="Department Logo"
                        width={72}
                        height={72}
                        unoptimized
                        className="rounded-full border-2 border-white/30 object-cover"
                        style={{ width: 72, height: 72 }}
                      />
                    ) : (
                      <div className="h-[72px] w-[72px]" />
                    )}
                  </div>

                  {/* Department name + University name — centre */}
                  <div className="flex flex-1 flex-col items-center justify-center gap-0.5">
                    <h1 className="text-center text-lg font-extrabold leading-tight text-green-400 md:text-xl lg:text-2xl" style={{ textShadow: "0 0 20px rgba(74,222,128,0.4)" }}>
                      {deptName}
                    </h1>
                    <p className="text-center text-sm font-semibold text-green-200/80 md:text-base">
                      {universityName}
                    </p>
                  </div>

                  {/* Clock + Weather — right */}
                  <div className="flex flex-shrink-0 items-center gap-4">
                    <Suspense fallback={<div className="h-10 w-20" />}>
                      <Clock />
                    </Suspense>
                    <div className="h-8 w-px bg-white/20" />
                    <WeatherWidget />
                  </div>
                </div>
              </header>

              {/* ── WELCOME + EMERGENCY TICKER ── split two-column bar */}
              <TickerBar welcome={welcome} notices={notices} />

              {/* ── MAIN CONTENT ── */}
              <div className="relative z-10 flex-1 h-full min-h-0 overflow-hidden">{children}</div>

              {/* ── FOOTER ── */}
              <footer className="display-footer flex-shrink-0 w-full">
                <div className="flex items-center justify-center gap-3 px-4 py-2">
                  <Image
                    src={universityLogoUrl}
                    alt="University Logo"
                    width={36}
                    height={36}
                    unoptimized
                    className="rounded-full"
                  />
                  <p className="text-center text-sm font-semibold tracking-wide text-white md:text-base lg:text-lg">
                    {universityName}
                  </p>
                </div>
              </footer>
            </>
          )}
        </Providers>
      </body>
    </html>
  );
}
