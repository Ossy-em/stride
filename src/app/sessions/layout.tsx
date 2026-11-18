import AppFrame from "@/components/app/app-frame";

export default function SessionsLayout({ children }: { children: React.ReactNode }) {
  return <AppFrame path="/sessions">{children}</AppFrame>;
}
