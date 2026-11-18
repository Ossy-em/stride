import { redirect } from "next/navigation";

// Dashboard is now Home. Old links, bookmarks and installed apps land here.
export default function LegacyDashboard() {
  redirect("/home");
}
