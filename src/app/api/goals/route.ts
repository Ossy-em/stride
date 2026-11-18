import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";
import { getGoalsData, isMissingTable } from "@/lib/goals";

const goalInput = z.object({
  title: z.string().trim().min(1).max(120),
  targetMinutes: z.number().int().positive().max(60000).nullable().optional(),
  dueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable().optional(),
});

const setupError = () =>
  NextResponse.json({ error: "Goals aren't set up yet. Run scripts/add-goals.sql in Supabase." }, { status: 503 });

/** Weekly target + all goals with focus time. ?tz= for the user's week. */
export async function GET(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    // ?lite=1: just the active goals, for the goal picker when starting a session
    if (request.nextUrl.searchParams.get("lite")) {
      const { data, error } = await supabaseAdmin
        .from("goals")
        .select("id, title")
        .eq("user_id", user.id)
        .eq("status", "active")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return NextResponse.json({ goals: data || [] });
    }
    return NextResponse.json(await getGoalsData(user.id, request.nextUrl.searchParams.get("tz")));
  } catch (e: any) {
    if (isMissingTable(e)) return setupError();
    console.error("Error fetching goals:", e);
    return NextResponse.json({ error: "Failed to fetch goals" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const parsed = goalInput.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid goal" }, { status: 400 });
  const { title, targetMinutes, dueDate } = parsed.data;

  const { data, error } = await supabaseAdmin
    .from("goals")
    .insert({ user_id: user.id, title, target_minutes: targetMinutes ?? null, due_date: dueDate ?? null })
    .select("id")
    .single();
  if (error) {
    if (isMissingTable(error)) return setupError();
    console.error("Error creating goal:", error);
    return NextResponse.json({ error: "Failed to create goal" }, { status: 500 });
  }
  return NextResponse.json({ id: data.id }, { status: 201 });
}
