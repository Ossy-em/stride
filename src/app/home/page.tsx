import type { Metadata } from "next";
import Home from "@/components/app/home/home";
import { getCurrentUser } from "@/lib/auth";

export const metadata: Metadata = { title: "Home", robots: { index: false, follow: false } };

export default async function HomePage() {
  const user = await getCurrentUser();
  return <Home firstName={user?.name?.split(" ")[0]} />;
}
