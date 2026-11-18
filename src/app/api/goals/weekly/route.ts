import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";

const input = z.object({ targetMinutes: z.number().int().positive().max(6000).nullable() });

/** Set or clear the weekly focus target. */
export async function PUT(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const parsed = input.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid target" }, { status: 400 });

  const { error } = await supabaseAdmin
    .from("users")
    .update({ weekly_target_minutes: parsed.data.targetMinutes })
    .eq("id", user.id);
  if (error) {
    console.error("Error setting weekly target:", error);
    return NextResponse.json({ error: "Failed to save target" }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
