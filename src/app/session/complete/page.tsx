import { redirect } from "next/navigation";

// Old stub URL: finished sessions show at /session/end?id=..., the list at /sessions.
export default function LegacySessionComplete() {
  redirect("/sessions");
}
