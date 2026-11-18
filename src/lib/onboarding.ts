import { supabaseAdmin } from "./supabase";

/**
 * Onboarding is remembered on the account (users.onboarded_at),
 * not in the browser, so it follows people across devices.
 * Server-only: uses the admin client.
 */

export async function hasOnboarded(userId: string): Promise<boolean> {
  const { data, error } = await supabaseAdmin
    .from("users")
    .select("onboarded_at")
    .eq("id", userId)
    .single();

  if (error) {
    // Fail open: never trap someone in onboarding because of a read error
    // (e.g. before scripts/add-onboarded-at.sql has been run).
    console.error("onboarding: could not read onboarded_at", error.message);
    return true;
  }

  return Boolean(data?.onboarded_at);
}

export async function markOnboarded(userId: string): Promise<boolean> {
  const { error } = await supabaseAdmin
    .from("users")
    .update({ onboarded_at: new Date().toISOString() })
    .eq("id", userId)
    .is("onboarded_at", null);

  if (error) {
    console.error("onboarding: could not save onboarded_at", error.message);
    return false;
  }
  return true;
}
