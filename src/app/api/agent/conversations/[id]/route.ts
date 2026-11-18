import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { deleteConversation, getConversation } from "@/lib/agent/store";

type Ctx = { params: Promise<{ id: string }> };
const valid = (id: string) => /^[0-9a-f-]{36}$/i.test(id);

export async function GET(_request: NextRequest, { params }: Ctx) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  if (!valid(id)) return NextResponse.json({ error: "Chat not found" }, { status: 404 });
  try {
    const conv = await getConversation(user.id, id);
    if (!conv) return NextResponse.json({ error: "Chat not found" }, { status: 404 });
    return NextResponse.json(conv);
  } catch (e) {
    console.error("Error loading chat:", e);
    return NextResponse.json({ error: "Failed to load chat" }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, { params }: Ctx) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  if (!valid(id)) return NextResponse.json({ error: "Chat not found" }, { status: 404 });
  try {
    await deleteConversation(user.id, id);
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("Error deleting chat:", e);
    return NextResponse.json({ error: "Failed to delete chat" }, { status: 500 });
  }
}
