import type { ReactNode } from "react";

/** Login page — scroll চালু, sidebar/header নেই */
export default function LoginLayout({ children }: { children: ReactNode }) {
  return <div className="admin-login-page">{children}</div>;
}
