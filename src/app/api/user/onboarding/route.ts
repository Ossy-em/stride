import { NextResponse } from "next/server";
import { getCurrentUser } from "../../../../lib/auth";
import { markOnboarded } from "../../../../lib/onboarding";

// POST: the signed-in user finished or skipped the intro.
export async function POST() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const ok = await markOnboarded(user.id);
  if (!ok) {
    return NextResponse.json({ error: "Could not save" }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
