import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";
import { canStartSession, getLimitsByPlan } from "@/lib/plans";
import { deleteUserData, enabledProviders, getIdentities, getProfile } from "@/lib/account";
import { usedToday } from "@/lib/agent/store";

/** Settings data: profile, sign-in methods, plan and today's usage. ?tz= for "today". */
export async function GET(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const tz = request.nextUrl.searchParams.get("tz") || undefined;
  try {
    const profile = await getProfile(user.id);
    if (!profile) return NextResponse.json({ error: "Account not found" }, { status: 404 });
    const limits = getLimitsByPlan(profile.plan);
    const [identities, sessions, agentUsed] = await Promise.all([
      getIdentities(user.id),
      canStartSession(user.id, tz),
      usedToday(user.id, tz || "UTC").catch(() => null),
    ]);
    return NextResponse.json({
      profile,
      identities,
      methods: enabledProviders(),
      usage: {
        sessions: { used: sessions.sessionsToday ?? null, limit: limits.maxSessionsPerDay },
        agent: { used: agentUsed, limit: limits.agentMessagesPerDay },
        maxSessionMinutes: limits.maxSessionDuration,
      },
    });
  } catch (e) {
    console.error("Account load failed:", e);
    return NextResponse.json({ error: "Failed to load your account" }, { status: 500 });
  }
}

const patch = z.object({
  name: z.string().trim().min(1).max(80).optional(),
  defaultDuration: z.number().int().min(3).max(180).nullable().optional(),
  defaultTaskType: z.enum(["coding", "writing", "reading"]).nullable().optional(),
});

/** Update name and session defaults. */
export async function PATCH(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const parsed = patch.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid settings" }, { status: 400 });
  const p = parsed.data;
  const update: Record<string, unknown> = {};
  if (p.name !== undefined) update.name = p.name;
  if (p.defaultDuration !== undefined) update.default_duration = p.defaultDuration;
  if (p.defaultTaskType !== undefined) update.default_task_type = p.defaultTaskType;
  if (!Object.keys(update).length) return NextResponse.json({ ok: true });

  // free plans can't default past their session length
  if (typeof p.defaultDuration === "number") {
    const profile = await getProfile(user.id);
    const max = getLimitsByPlan(profile?.plan ?? "free").maxSessionDuration;
    if (p.defaultDuration > max) update.default_duration = max;
  }

  const { error } = await supabaseAdmin.from("users").update(update).eq("id", user.id);
  if (error) {
    if (/default_(duration|task_type)/.test(error.message || ""))
      return NextResponse.json({ error: "Settings aren't set up yet. Run scripts/add-account.sql in Supabase." }, { status: 503 });
    console.error("Account update failed:", error);
    return NextResponse.json({ error: "Failed to save" }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}

const del = z.object({ confirmEmail: z.string().trim() });

/** Permanently delete the account. The user types their email to confirm. */
export async function DELETE(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const parsed = del.safeParse(await request.json().catch(() => null));
  const profile = await getProfile(user.id);
  if (!profile) return NextResponse.json({ error: "Account not found" }, { status: 404 });
  if (!parsed.success || parsed.data.confirmEmail.toLowerCase() !== profile.email.toLowerCase()) {
    return NextResponse.json({ error: "Type your email exactly to confirm." }, { status: 400 });
  }
  // a paid subscription has to be cancelled first, or it would keep billing
  const { data: billing } = await supabaseAdmin.from("users").select("ls_status").eq("id", user.id).maybeSingle();
  const status = (billing as any)?.ls_status as string | undefined;
  if (profile.plan === "premium" && status && !["cancelled", "expired"].includes(status)) {
    return NextResponse.json({ error: "Cancel your Premium subscription first, then delete your account." }, { status: 409 });
  }
  try {
    await deleteUserData(user.id);
  } catch (e) {
    console.error("Account delete failed:", e);
    return NextResponse.json({ error: "Couldn't delete your account. Please try again." }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
