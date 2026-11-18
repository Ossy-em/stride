import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";
import { getGoalDetail } from "@/lib/goals";

const patchInput = z.object({
  title: z.string().trim().min(1).max(120).optional(),
  targetMinutes: z.number().int().positive().max(60000).nullable().optional(),
  dueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable().optional(),
  status: z.enum(["active", "completed"]).optional(),
});

type Ctx = { params: Promise<{ id: string }> };

/** One goal: its steps and the sessions that counted towards it. */
export async function GET(_request: NextRequest, { params }: Ctx) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) return NextResponse.json({ error: "Goal not found" }, { status: 404 });
  try {
    const detail = await getGoalDetail(user.id, id);
    if (!detail) return NextResponse.json({ error: "Goal not found" }, { status: 404 });
    return NextResponse.json(detail);
  } catch (e) {
    console.error("Error fetching goal:", e);
    return NextResponse.json({ error: "Failed to fetch goal" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: Ctx) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const parsed = patchInput.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid goal" }, { status: 400 });
  const p = parsed.data;

  const update: Record<string, unknown> = {};
  if (p.title !== undefined) update.title = p.title;
  if (p.targetMinutes !== undefined) update.target_minutes = p.targetMinutes;
  if (p.dueDate !== undefined) update.due_date = p.dueDate;
  if (p.status !== undefined) {
    update.status = p.status;
    update.completed_at = p.status === "completed" ? new Date().toISOString() : null;
  }
  if (!Object.keys(update).length) return NextResponse.json({ ok: true });

  const { data, error } = await supabaseAdmin
    .from("goals")
    .update(update)
    .eq("id", id)
    .eq("user_id", user.id)
    .select("id");
  if (error) {
    console.error("Error updating goal:", error);
    return NextResponse.json({ error: "Failed to update goal" }, { status: 500 });
  }
  if (!data?.length) return NextResponse.json({ error: "Goal not found" }, { status: 404 });
  return NextResponse.json({ ok: true });
}

/** Deleting a goal keeps its sessions; they just stop pointing at it. */
export async function DELETE(_request: NextRequest, { params }: Ctx) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const { data, error } = await supabaseAdmin.from("goals").delete().eq("id", id).eq("user_id", user.id).select("id");
  if (error) {
    console.error("Error deleting goal:", error);
    return NextResponse.json({ error: "Failed to delete goal" }, { status: 500 });
  }
  if (!data?.length) return NextResponse.json({ error: "Goal not found" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
