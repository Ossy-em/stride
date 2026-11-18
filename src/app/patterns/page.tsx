import { redirect } from "next/navigation";

/** Patterns is now Insights. */
export default function PatternsPage() {
  redirect("/insights");
}
