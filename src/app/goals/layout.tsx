import AppFrame from "@/components/app/app-frame";

export default function GoalsLayout({ children }: { children: React.ReactNode }) {
  return <AppFrame path="/goals">{children}</AppFrame>;
}
