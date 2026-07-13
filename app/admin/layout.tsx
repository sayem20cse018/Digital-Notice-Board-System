import { headers } from "next/headers";
import { Suspense } from "react";
import AdminShell from "@/app/components/admin-panel/AdminShell";
import SuccessMessage from "@/app/components/SuccessMessage";
import AdminLoading from "./loading";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const headersList = await headers();

  const rawUrl = headersList.get("x-url") || "";
  let pathname = headersList.get("x-pathname") || "";

  if (!pathname && rawUrl) {
    try {
      pathname = new URL(rawUrl).pathname;
    } catch {
      pathname = "";
    }
  }

  const isLoginPage =
    pathname === "/admin/login" || pathname.startsWith("/admin/login");

  if (isLoginPage) {
    return <>{children}</>;
  }

  // All other admin pages
  return (
    <AdminShell>
      <Suspense fallback={<AdminLoading />}>
        <SuccessMessage />
        {children}
      </Suspense>
    </AdminShell>
  );
}