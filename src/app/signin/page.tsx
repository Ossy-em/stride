import { redirect } from "next/navigation";

// Old sign-in URL: forward to /sign-in, keeping ?callbackUrl and ?error.
export default async function LegacySignIn({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const qs = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (typeof v === "string") qs.set(k, v);
  }
  const query = qs.toString();
  redirect(query ? `/sign-in?${query}` : "/sign-in");
}
