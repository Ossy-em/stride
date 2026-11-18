import AppFrame from "@/components/app/app-frame";

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  return <AppFrame path="/settings">{children}</AppFrame>;
}
