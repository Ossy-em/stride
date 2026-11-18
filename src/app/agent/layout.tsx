import AppFrame from "@/components/app/app-frame";

export default function AgentLayout({ children }: { children: React.ReactNode }) {
  return <AppFrame path="/agent">{children}</AppFrame>;
}
