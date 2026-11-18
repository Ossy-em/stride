import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";
import { ownsGoal } from "@/lib/goals";

const patch = z.object({
  title: z.string().trim().min(1).max(200).optional(),
  done: z.boolean().optional(),
});
type Ctx = { params: Promise<{ id: string; stepId: string }> };

/** Tick, untick or rename a step. */
export async function PATCH(request: NextRequest, { params }: Ctx) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id, stepId } = await params;
  const parsed = patch.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid step" }, { status: 400 });
  if (!(await ownsGoal(user.id, id))) return NextResponse.json({ error: "Goal not found" }, { status: 404 });

  const update: Record<string, unknown> = {};
  if (parsed.data.title !== undefined) update.title = parsed.data.title;
  if (parsed.data.done !== undefined) {
    update.done = parsed.data.done;
    update.done_at = parsed.data.done ? new Date().toISOString() : null;
  }
  const { data, error } = await supabaseAdmin
    .from("goal_steps")
    .update(update)
    .eq("id", stepId)
    .eq("goal_id", id)
    .select("id");
  if (error) {
    console.error("Error updating step:", error);
    return NextResponse.json({ error: "Failed to update step" }, { status: 500 });
  }
  if (!data?.length) return NextResponse.json({ error: "Step not found" }, { status: 404 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(_request: NextRequest, { params }: Ctx) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id, stepId } = await params;
  if (!(await ownsGoal(user.id, id))) return NextResponse.json({ error: "Goal not found" }, { status: 404 });
  const { error } = await supabaseAdmin.from("goal_steps").delete().eq("id", stepId).eq("goal_id", id);
  if (error) {
    console.error("Error deleting step:", error);
    return NextResponse.json({ error: "Failed to delete step" }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
