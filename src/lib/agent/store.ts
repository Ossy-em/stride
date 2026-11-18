/** Agent chats in Supabase: conversations, messages, and today's usage count. */
import { supabaseAdmin } from "../supabase";
import { getStartOfDayInTimezone } from "../plans";

export type StoredMessage = { id: string; role: "user" | "assistant"; content: string; createdAt: string };

export const isMissingAgentTables = (e: { code?: string; message?: string } | null) =>
  !!e && (e.code === "42P01" || /agent_(messages|conversations)/.test(e.message || ""));

/** User messages sent today in the user's timezone (what the free limit counts). */
export async function usedToday(userId: string, tz: string) {
  const { count, error } = await supabaseAdmin
    .from("agent_messages")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("role", "user")
    .gte("created_at", getStartOfDayInTimezone(tz));
  if (error) throw error;
  return count || 0;
}

export async function listConversations(userId: string) {
  const { data, error } = await supabaseAdmin
    .from("agent_conversations")
    .select("id, title, updated_at")
    .eq("user_id", userId)
    .is("deleted_at", null)
    .order("updated_at", { ascending: false })
    .limit(50);
  if (error) throw error;
  return (data || []).map((c) => ({ id: c.id, title: c.title, updatedAt: c.updated_at }));
}

export async function getConversation(userId: string, id: string) {
  const { data: conv, error } = await supabaseAdmin
    .from("agent_conversations")
    .select("id, title")
    .eq("id", id)
    .eq("user_id", userId)
    .is("deleted_at", null)
    .maybeSingle();
  if (error) throw error;
  if (!conv) return null;
  const { data: msgs, error: mErr } = await supabaseAdmin
    .from("agent_messages")
    .select("id, role, content, created_at")
    .eq("conversation_id", id)
    .order("created_at", { ascending: true });
  if (mErr) throw mErr;
  return {
    id: conv.id,
    title: conv.title,
    messages: (msgs || []).map((m) => ({ id: m.id, role: m.role, content: m.content, createdAt: m.created_at })) as StoredMessage[],
  };
}

export async function createConversation(userId: string, firstMessage: string) {
  const title = firstMessage.replace(/\s+/g, " ").trim().slice(0, 60) || "New chat";
  const { data, error } = await supabaseAdmin
    .from("agent_conversations")
    .insert({ user_id: userId, title })
    .select("id, title")
    .single();
  if (error) throw error;
  return data as { id: string; title: string };
}

/** check = the fact-check result for an answer, kept so accuracy can be measured. */
export async function addMessage(
  userId: string,
  conversationId: string,
  role: "user" | "assistant",
  content: string,
  check?: Record<string, unknown>
) {
  const row = { user_id: userId, conversation_id: conversationId, role, content };
  let { error } = await supabaseAdmin.from("agent_messages").insert(check ? { ...row, check_result: check } : row);
  // the check_result column comes from add-agent-check.sql; still save the message without it
  if (error && check && /check_result/.test(error.message || "")) {
    ({ error } = await supabaseAdmin.from("agent_messages").insert(row));
  }
  if (error) throw error;
  await supabaseAdmin
    .from("agent_conversations")
    .update({ updated_at: new Date().toISOString() })
    .eq("id", conversationId)
    .eq("user_id", userId);
}

/** Hides the chat. Its messages stay so today's usage count can't be reset by deleting. */
export async function deleteConversation(userId: string, id: string) {
  const { error } = await supabaseAdmin
    .from("agent_conversations")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", id)
    .eq("user_id", userId);
  if (error) throw error;
}

export async function setConversationTitle(userId: string, id: string, title: string) {
  const { error } = await supabaseAdmin.from("agent_conversations").update({ title }).eq("id", id).eq("user_id", userId);
  if (error) throw error;
}
