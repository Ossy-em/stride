import type { Metadata } from "next";
import Premium from "@/components/app/premium/premium";

export const metadata: Metadata = { title: "Premium", robots: { index: false, follow: false } };

export default function PremiumPage() {
  return <Premium />;
}
