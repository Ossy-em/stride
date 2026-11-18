import { redirect } from "next/navigation";

// Old stub URL: sign-in lives at /sign-in.
export default function LegacyLogin() {
  redirect("/sign-in");
}
