"use client";

/** Agent page: chat history, sending, and reading the streamed answer. */

import { useCallback, useEffect, useRef, useState } from "react";
import { usePlan } from "../plan-context";
import AgentView, { type ChatMessage, type ChatSummary, type SkillId } from "./agent-view";

const tz = () => Intl.DateTimeFormat().resolvedOptions().timeZone;
const uid = () => Math.random().toString(36).slice(2);

function setUrl(id: string | null) {
  const url = new URL(window.location.href);
  if (id) url.searchParams.set("c", id);
  else url.searchParams.delete("c");
  window.history.replaceState(null, "", url);
}

export default function Agent() {
  const { requestUpgrade } = usePlan();
  const [conversations, setConversations] = useState<ChatSummary[]>([]);
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [title, setTitle] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loadingChat, setLoadingChat] = useState(false);
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abort = useRef<AbortController | null>(null);
  const last = useRef<{ text: string; skill: SkillId | null } | null>(null);
  const current = useRef<string | null>(null);
  current.current = currentId;

  const loadList = useCallback(async () => {
    try {
      const res = await fetch(`/api/agent/conversations?tz=${encodeURIComponent(tz())}`);
      if (res.ok) setConversations((await res.json()).conversations || []);
    } catch {}
  }, []);

  const open = useCallback(async (id: string) => {
    abort.current?.abort();
    setCurrentId(id);
    setUrl(id);
    setError(null);
    setMessages([]);
    setLoadingChat(true);
    try {
      const res = await fetch(`/api/agent/conversations/${id}`);
      if (!res.ok) throw new Error(res.status === 404 ? "missing" : "failed");
      const data = await res.json();
      if (current.current !== id) return;
      setTitle(data.title);
      setMessages(data.messages.map((m: ChatMessage) => ({ ...m, status: "done" })));
    } catch (e) {
      if (current.current !== id) return;
      if ((e as Error).message === "missing") {
        setCurrentId(null);
        setUrl(null);
        setTitle(null);
      } else setError("Couldn't load this chat. Please try again.");
    } finally {
      if (current.current === id) setLoadingChat(false);
    }
  }, []);

  useEffect(() => {
    loadList();
    const id = new URL(window.location.href).searchParams.get("c");
    if (id) open(id);
  }, [loadList, open]);

  const startNew = () => {
    abort.current?.abort();
    setCurrentId(null);
    setUrl(null);
    setTitle(null);
    setMessages([]);
    setError(null);
  };

  const send = async (text: string, skill: SkillId | null, retry = false) => {
    if (streaming) return;
    last.current = { text, skill };
    setError(null);
    const answerId = uid();
    setMessages((ms) => {
      // a retry replaces the failed answer instead of repeating the question
      const base = retry ? ms.filter((m, i) => !(i === ms.length - 1 && m.role === "assistant")) : [...ms, { id: uid(), role: "user" as const, content: text, status: "done" as const }];
      return [...base, { id: answerId, role: "assistant", content: "", tools: [], status: "streaming" }];
    });
    const patch = (fn: (m: ChatMessage) => ChatMessage) =>
      setMessages((ms) => ms.map((m) => (m.id === answerId ? fn(m) : m)));

    const ctrl = new AbortController();
    abort.current = ctrl;
    setStreaming(true);
    try {
      const res = await fetch("/api/agent/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, conversationId: current.current, tz: tz(), skill }),
        signal: ctrl.signal,
      });
      if (!res.ok || !res.body) {
        const data = await res.json().catch(() => ({}));
        // drop the empty answer bubble
        setMessages((ms) => ms.filter((m) => m.id !== answerId));
        if (res.status === 403 && data.upgrade) {
          requestUpgrade("agent_limit");
          setMessages((ms) => (ms.at(-1)?.role === "user" && !retry ? ms.slice(0, -1) : ms));
          return;
        }
        setError(data.error || "Something went wrong. Please try again.");
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buf = "";
      let failed = false;
      for (;;) {
        const { value, done } = await reader.read();
        if (done) break;
        buf += decoder.decode(value, { stream: true });
        let nl: number;
        while ((nl = buf.indexOf("\n")) >= 0) {
          const line = buf.slice(0, nl).trim();
          buf = buf.slice(nl + 1);
          if (!line) continue;
          let ev: any;
          try {
            ev = JSON.parse(line);
          } catch {
            continue;
          }
          if (ev.type === "conversation") {
            setCurrentId(ev.id);
            current.current = ev.id;
            setUrl(ev.id);
            setTitle(ev.title);
            setConversations((cs) => [{ id: ev.id, title: ev.title, updatedAt: new Date().toISOString() }, ...cs]);
          } else if (ev.type === "title") {
            if (current.current === ev.id) setTitle(ev.title);
            setConversations((cs) => cs.map((c) => (c.id === ev.id ? { ...c, title: ev.title } : c)));
          } else if (ev.type === "status") {
            patch((m) => ({ ...m, step: ev.label }));
          } else if (ev.type === "tool") {
            patch((m) => ({ ...m, tools: [...(m.tools || []), ev.label] }));
          } else if (ev.type === "text") {
            patch((m) => ({ ...m, content: m.content + ev.delta }));
          } else if (ev.type === "error") {
            failed = true;
          }
        }
      }
      patch((m) => ({ ...m, status: failed ? "error" : "done" }));
      loadList();
    } catch (e) {
      if ((e as Error).name === "AbortError") patch((m) => ({ ...m, status: "done" }));
      else patch((m) => ({ ...m, status: "error" }));
    } finally {
      setStreaming(false);
      abort.current = null;
    }
  };

  const remove = async (id: string) => {
    setConversations((cs) => cs.filter((c) => c.id !== id));
    if (id === currentId) startNew();
    await fetch(`/api/agent/conversations/${id}`, { method: "DELETE" }).catch(() => {});
  };

  return (
    <AgentView
      conversations={conversations}
      currentId={currentId}
      title={title}
      messages={messages}
      loadingChat={loadingChat}
      streaming={streaming}
      error={error}
      onSend={(t, s) => send(t, s)}
      onStop={() => abort.current?.abort()}
      onRetry={() => last.current && send(last.current.text, last.current.skill, true)}
      onNew={startNew}
      onOpen={open}
      onDelete={remove}
    />
  );
}
