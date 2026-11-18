import type { Metadata } from "next";
import StartPage from "@/components/app/session/start-page";

export const metadata: Metadata = { title: "Start session", robots: { index: false, follow: false } };

export default function StartSessionPage() {
  return <StartPage />;
}
