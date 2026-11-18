import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";
import { isMissingTable, ownsGoal } from "@/lib/goals";

const input = z.object({ title: z.string().trim().min(1).max(200) });
type Ctx = { params: Promise<{ id: string }> };

/** Add a step to the end of a goal's checklist. */
export async function POST(request: NextRequest, { params }: Ctx) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const parsed = input.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid step" }, { status: 400 });
  if (!(await ownsGoal(user.id, id))) return NextResponse.json({ error: "Goal not found" }, { status: 404 });

  const { data: last } = await supabaseAdmin
    .from("goal_steps")
    .select("position")
    .eq("goal_id", id)
    .order("position", { ascending: false })
    .limit(1)
    .maybeSingle();

  const { data, error } = await supabaseAdmin
    .from("goal_steps")
    .insert({ goal_id: id, title: parsed.data.title, position: (last?.position ?? -1) + 1 })
    .select("id")
    .single();
  if (error) {
    if (isMissingTable(error))
      return NextResponse.json({ error: "Steps aren't set up yet. Run scripts/add-goal-steps.sql in Supabase." }, { status: 503 });
    console.error("Error adding step:", error);
    return NextResponse.json({ error: "Failed to add step" }, { status: 500 });
  }
  return NextResponse.json({ id: data.id }, { status: 201 });
}
