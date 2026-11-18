import type { Metadata } from "next";
import Agent from "@/components/app/agent/agent";

export const metadata: Metadata = { title: "Agent", robots: { index: false, follow: false } };

export default function AgentPage() {
  return <Agent />;
}
