import AppFrame from "@/components/app/app-frame";

export default function StartSessionLayout({ children }: { children: React.ReactNode }) {
  return <AppFrame path="/session/start">{children}</AppFrame>;
}
