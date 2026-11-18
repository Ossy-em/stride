import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getPlanLimits } from "@/lib/plans";
import { isMissingAgentTables, listConversations, usedToday } from "@/lib/agent/store";

/** Chat history for the menu, plus today's usage for the free limit. ?tz= for "today". */
export async function GET(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const tz = request.nextUrl.searchParams.get("tz") || "UTC";
  try {
    const [conversations, used, limits] = await Promise.all([
      listConversations(user.id),
      usedToday(user.id, tz),
      getPlanLimits(user.id),
    ]);
    return NextResponse.json({ conversations, usage: { used, limit: limits.agentMessagesPerDay } });
  } catch (e: any) {
    if (isMissingAgentTables(e)) return NextResponse.json({ error: "The Agent isn't set up yet." }, { status: 503 });
    console.error("Error listing chats:", e);
    return NextResponse.json({ error: "Failed to load chats" }, { status: 500 });
  }
}
