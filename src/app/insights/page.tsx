import type { Metadata } from "next";
import Insights from "@/components/app/insights/insights";

export const metadata: Metadata = { title: "Insights", robots: { index: false, follow: false } };

export default function InsightsPage() {
  return <Insights />;
}
