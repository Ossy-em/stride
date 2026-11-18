import type { Metadata } from "next";
import Goals from "@/components/app/goals/goals";

export const metadata: Metadata = { title: "Goals", robots: { index: false, follow: false } };

export default function GoalsPage() {
  return <Goals />;
}
