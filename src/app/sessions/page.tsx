import type { Metadata } from "next";
import Sessions from "@/components/app/sessions/sessions";

export const metadata: Metadata = { title: "Sessions", robots: { index: false, follow: false } };

export default function SessionsPage() {
  return <Sessions />;
}
