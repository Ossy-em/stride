import type { Metadata } from "next";
import GoalDetail from "@/components/app/goals/goal-detail";

export const metadata: Metadata = { title: "Goal", robots: { index: false, follow: false } };

export default async function GoalPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <GoalDetail id={id} />;
}
