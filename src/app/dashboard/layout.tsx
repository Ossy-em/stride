// Dashboard is now Home (see ./page.tsx); no gate needed for a redirect.
export default function LegacyDashboardLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
