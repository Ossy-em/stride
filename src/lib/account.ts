/**
 * Account helpers: email sign-in links, sign-in methods, profile and
 * preferences, export and deletion. Everything is keyed by the users row.
 */
import { createHash, randomBytes } from "crypto";
import { supabaseAdmin } from "./supabase";
import { getUserPlan } from "./plans";

export const LINK_MINUTES = 15;
const LINKS_PER_HOUR = 5;

const hash = (token: string) => createHash("sha256").update(token).digest("hex");
export const normalizeEmail = (e: string) => e.trim().toLowerCase();

/** Sign-in methods offered on the sign-in page; Apple and GitHub only when configured. */
export function enabledProviders() {
  return {
    google: !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET),
    apple: !!(process.env.AUTH_APPLE_ID && process.env.AUTH_APPLE_SECRET),
    github: !!(process.env.AUTH_GITHUB_ID && process.env.AUTH_GITHUB_SECRET),
    email: !!process.env.RESEND_API_KEY,
  };
}

/* ---------- email links ---------- */

/** Creates a one-time token. null = too many links asked for this hour. */
export async function createLoginToken(emailIn: string) {
  const email = normalizeEmail(emailIn);
  const { count } = await supabaseAdmin
    .from("login_tokens")
    .select("id", { count: "exact", head: true })
    .eq("email", email)
    .gte("created_at", new Date(Date.now() - 3600e3).toISOString());
  if ((count || 0) >= LINKS_PER_HOUR) return null;

  const token = randomBytes(32).toString("base64url");
  const { error } = await supabaseAdmin.from("login_tokens").insert({
    email,
    token_hash: hash(token),
    expires_at: new Date(Date.now() + LINK_MINUTES * 60e3).toISOString(),
  });
  if (error) throw error;
  return token;
}

/** Uses up a token. Returns the email it was for, or null if it's wrong, used or expired. */
export async function consumeLoginToken(emailIn: string, token: string) {
  const email = normalizeEmail(emailIn);
  const { data } = await supabaseAdmin
    .from("login_tokens")
    .update({ used_at: new Date().toISOString() })
    .eq("token_hash", hash(token))
    .eq("email", email)
    .is("used_at", null)
    .gt("expires_at", new Date().toISOString())
    .select("email");
  return data && data.length ? email : null;
}

/* ---------- users ---------- */

export async function findUserByEmail(email: string) {
  const { data } = await supabaseAdmin
    .from("users")
    .select("id, name, image")
    .ilike("email", normalizeEmail(email).replace(/[%_\\]/g, "\\$&"))
    .maybeSingle();
  return data as { id: string; name: string | null; image: string | null } | null;
}

/** Remember which methods someone signs in with (shown in Settings). Never blocks sign-in. */
export async function recordIdentity(userId: string, provider: string, email: string | null) {
  try {
    const now = new Date().toISOString();
    await supabaseAdmin
      .from("user_identities")
      .upsert({ user_id: userId, provider, email, last_used_at: now }, { onConflict: "user_id,provider" });
  } catch (e) {
    console.error("recordIdentity failed:", e);
  }
}

export type Profile = {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  plan: "free" | "premium";
  createdAt: string | null;
  defaultDuration: number | null;
  defaultTaskType: "coding" | "writing" | "reading" | null;
};

export async function getProfile(userId: string): Promise<Profile | null> {
  let res = await supabaseAdmin
    .from("users")
    .select("id, name, email, image, plan, created_at, default_duration, default_task_type")
    .eq("id", userId)
    .maybeSingle();
  // before add-account.sql runs, the preference columns don't exist yet
  if (res.error && /default_(duration|task_type)/.test(res.error.message || "")) {
    res = (await supabaseAdmin.from("users").select("id, name, email, image, plan, created_at").eq("id", userId).maybeSingle()) as any;
  }
  const u = res.data as any;
  if (!u) return null;
  return {
    id: u.id,
    name: u.name ?? null,
    email: u.email,
    image: u.image ?? null,
    plan: await getUserPlan(userId), // expiry-checked, not the raw column
    createdAt: u.created_at ?? null,
    defaultDuration: u.default_duration ?? null,
    defaultTaskType: u.default_task_type ?? null,
  };
}

export async function getIdentities(userId: string) {
  const { data, error } = await supabaseAdmin
    .from("user_identities")
    .select("provider, email, last_used_at")
    .eq("user_id", userId)
    .order("last_used_at", { ascending: false });
  if (error) return [];
  return (data || []).map((d) => ({ provider: d.provider as string, email: d.email as string | null, lastUsedAt: d.last_used_at as string }));
}

/* ---------- export & delete ---------- */

async function rows(table: string, column: string, value: string | string[]) {
  const q = supabaseAdmin.from(table).select("*");
  const { data, error } = Array.isArray(value) ? await q.in(column, value.length ? value : ["-"]) : await q.eq(column, value);
  if (error) return []; // table may not exist on older setups
  return data || [];
}

/** Everything Stride stores about a user, as one JSON document. */
export async function exportUserData(userId: string) {
  const profile = await getProfile(userId);
  const sessions = await rows("sessions", "user_id", userId);
  const sessionIds = sessions.map((s: any) => s.id);
  const goals = await rows("goals", "user_id", userId);
  const conversations = (await rows("agent_conversations", "user_id", userId)).filter((c: any) => !c.deleted_at);
  return {
    exported_at: new Date().toISOString(),
    profile,
    sessions,
    check_ins: await rows("checkins", "session_id", sessionIds),
    nudges: await rows("interventions", "session_id", sessionIds),
    goals,
    goal_steps: await rows("goal_steps", "goal_id", goals.map((g: any) => g.id)),
    agent_chats: conversations,
    agent_messages: await rows("agent_messages", "conversation_id", conversations.map((c: any) => c.id)),
  };
}

/** Permanently removes a user and everything that belongs to them. */
export async function deleteUserData(userId: string) {
  const { data: sessions } = await supabaseAdmin.from("sessions").select("id").eq("user_id", userId);
  const ids = (sessions || []).map((s) => s.id);
  const del = async (table: string, column: string, value: string | string[]) => {
    if (Array.isArray(value) && !value.length) return;
    const q = supabaseAdmin.from(table).delete();
    const { error } = Array.isArray(value) ? await q.in(column, value) : await q.eq(column, value);
    // a missing table is fine; anything else stops the delete
    if (error && !/does not exist|schema cache/i.test(error.message || "")) throw error;
  };
  for (let i = 0; i < ids.length; i += 200) {
    const chunk = ids.slice(i, i + 200);
    await del("checkins", "session_id", chunk);
    await del("interventions", "session_id", chunk);
  }
  await del("agent_messages", "user_id", userId);
  await del("agent_conversations", "user_id", userId);
  const { data: goals } = await supabaseAdmin.from("goals").select("id").eq("user_id", userId);
  if (goals?.length) await del("goal_steps", "goal_id", goals.map((g) => g.id));
  await del("sessions", "user_id", userId);
  await del("goals", "user_id", userId);
  await del("patterns", "user_id", userId);
  await del("push_subscriptions", "user_id", userId);
  await del("feedback", "user_id", userId);
  await del("user_identities", "user_id", userId);
  await del("users", "id", userId);
}
