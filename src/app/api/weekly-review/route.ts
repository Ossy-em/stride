import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getWeeklyReview } from "@/lib/weekly";

// GET ?tz=Area/City : last week's review, or { review: null } if there were no sessions
export async function GET(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const review = await getWeeklyReview(user.id, req.nextUrl.searchParams.get("tz"));
    return NextResponse.json({ review });
  } catch (e) {
    console.error("weekly-review:", e);
    return NextResponse.json({ error: "Could not load" }, { status: 500 });
  }
}
