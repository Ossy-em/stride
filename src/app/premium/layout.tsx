import AppFrame from "@/components/app/app-frame";

export default function PremiumLayout({ children }: { children: React.ReactNode }) {
  return <AppFrame path="/premium">{children}</AppFrame>;
}
