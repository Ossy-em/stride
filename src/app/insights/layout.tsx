import AppFrame from "@/components/app/app-frame";

export default function InsightsLayout({ children }: { children: React.ReactNode }) {
  return <AppFrame path="/insights">{children}</AppFrame>;
}
