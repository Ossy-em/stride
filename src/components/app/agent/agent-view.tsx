"use client";

/**
 * Agent: Stride's focus coach. Empty state follows Linear's agent page;
 * once you send, it becomes a thread with the composer docked at the bottom.
 * Answers stream in, with a line for each piece of your data it reads.
 */

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowUp,
  CalendarClock,
  Check,
  ChevronDown,
  FingerprintPattern,
  LifeBuoy,
  Plus,
  SlidersHorizontal,
  Square,
  SquarePen,
  X,
  type LucideIcon,
} from "lucide-react";
import PageHeader from "../page-header";
import Markdown from "./markdown";
import "./agent.css";

export type SkillId = "patterns" | "plan" | "stuck";
type Skill = { id: SkillId; title: string; body: string; Icon: LucideIcon };

export const SKILLS: Skill[] = [
  { id: "patterns", title: "Ask about your patterns", body: "Get answers from your own sessions and drifts", Icon: FingerprintPattern },
  { id: "plan", title: "Plan work into sessions", body: "Turn a deadline into focus blocks in your peak hours", Icon: CalendarClock },
  { id: "stuck", title: "Get unstuck", body: "Talk it through, then get back into your session", Icon: LifeBuoy },
];

export type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  /** what the Agent read for this answer (live turns only) */
  tools?: string[];
  /** what it's doing right now: writing, checking against your data */
  step?: string;
  status?: "streaming" | "done" | "error";
};
export type ChatSummary = { id: string; title: string; updatedAt: string };

export type AgentViewProps = {
  conversations: ChatSummary[];
  currentId: string | null;
  title: string | null;
  messages: ChatMessage[];
  loadingChat?: boolean;
  streaming: boolean;
  error?: string | null;
  onSend: (text: string, skill: SkillId | null) => void;
  onStop: () => void;
  onRetry: () => void;
  onNew: () => void;
  onOpen: (id: string) => void;
  onDelete: (id: string) => void;
};

/* ---------- composer ---------- */

function Composer({
  onSend,
  onStop,
  streaming,
  docked,
  skill,
  setSkill,
  autoFocus,
}: {
  onSend: (text: string, skill: SkillId | null) => void;
  onStop: () => void;
  streaming: boolean;
  docked?: boolean;
  skill: Skill | null;
  setSkill: (s: Skill | null) => void;
  autoFocus?: boolean;
}) {
  const [text, setText] = useState("");
  const [menu, setMenu] = useState(false);
  const input = useRef<HTMLTextAreaElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menu) return;
    const onDown = (e: MouseEvent) => !menuRef.current?.contains(e.target as Node) && setMenu(false);
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [menu]);

  useLayoutEffect(() => {
    const el = input.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, [text]);

  useEffect(() => {
    if (skill) input.current?.focus();
  }, [skill]);

  const send = () => {
    const t = text.trim();
    if (!t || streaming) return;
    onSend(t, skill?.id ?? null);
    setText("");
  };

  return (
    <form
      className="app-composer agent-composer"
      data-docked={docked}
      onSubmit={(e) => {
        e.preventDefault();
        send();
      }}
    >
      <textarea
        ref={input}
        rows={docked ? 1 : 2}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
            e.preventDefault();
            send();
          }
        }}
        placeholder={docked ? "Reply…" : "Ask Stride…"}
        aria-label="Message"
        maxLength={4000}
        autoFocus={autoFocus}
      />
      <div className="app-composer-row">
        <div className="app-chip-wrap" ref={menuRef}>
          <button type="button" className="app-chip" aria-haspopup="menu" aria-expanded={menu} onClick={() => setMenu((m) => !m)}>
            {skill ? <skill.Icon size={15} strokeWidth={1.75} /> : <SlidersHorizontal size={15} strokeWidth={1.75} />}
            {skill ? skill.title : "Skills"}
            <ChevronDown size={13} strokeWidth={1.75} />
          </button>
          <AnimatePresence>
            {menu && (
              <motion.div
                className="app-menu app-chip-menu"
                data-up={docked}
                role="menu"
                initial={{ opacity: 0, y: docked ? 4 : -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: docked ? 4 : -4 }}
                transition={{ duration: 0.14 }}
              >
                {SKILLS.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    className="app-menu-item"
                    role="menuitemradio"
                    aria-checked={skill?.id === s.id}
                    onClick={() => {
                      setSkill(skill?.id === s.id ? null : s);
                      setMenu(false);
                    }}
                  >
                    <s.Icon size={15} strokeWidth={1.75} />
                    <span style={{ flex: 1 }}>{s.title}</span>
                    {skill?.id === s.id && <Check size={14} strokeWidth={2} />}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        {streaming ? (
          <button type="button" className="app-send" aria-label="Stop" onClick={onStop}>
            <Square size={12} strokeWidth={0} fill="currentColor" />
          </button>
        ) : (
          <button type="submit" className="app-send" aria-label="Send" disabled={!text.trim()}>
            <ArrowUp size={16} strokeWidth={2} />
          </button>
        )}
      </div>
    </form>
  );
}

/* ---------- header: chat history ---------- */

function relative(iso: string) {
  const d = new Date(iso);
  const days = Math.floor((Date.now() - d.getTime()) / 864e5);
  if (days < 1 && d.getDate() === new Date().getDate()) return d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  if (days < 7) return d.toLocaleDateString([], { weekday: "short" });
  return d.toLocaleDateString([], { month: "short", day: "numeric" });
}

function History({
  title,
  conversations,
  currentId,
  onNew,
  onOpen,
  onDelete,
}: Pick<AgentViewProps, "title" | "conversations" | "currentId" | "onNew" | "onOpen" | "onDelete">) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => !ref.current?.contains(e.target as Node) && setOpen(false);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div className="agent-history" ref={ref}>
      <button className="app-bar-title" aria-haspopup="menu" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
        <span className="agent-history-title">{title || "New chat"}</span>
        <ChevronDown size={14} strokeWidth={1.75} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            className="app-menu agent-history-menu"
            role="menu"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.14 }}
          >
            <button
              className="app-menu-item"
              role="menuitem"
              onClick={() => {
                onNew();
                setOpen(false);
              }}
            >
              <Plus size={15} strokeWidth={1.75} />
              New chat
            </button>
            {conversations.length > 0 && <div className="app-menu-sep" />}
            <div className="agent-history-list">
              {conversations.map((c) => (
                <div key={c.id} className="agent-history-row" data-active={c.id === currentId}>
                  <button
                    className="app-menu-item"
                    role="menuitem"
                    onClick={() => {
                      onOpen(c.id);
                      setOpen(false);
                    }}
                  >
                    <span className="agent-history-name">{c.title}</span>
                    <span className="agent-history-when">{relative(c.updatedAt)}</span>
                  </button>
                  <button className="app-icon-btn agent-history-del" aria-label={`Delete "${c.title}"`} onClick={() => onDelete(c.id)}>
                    <X size={13} strokeWidth={1.75} />
                  </button>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ---------- thread ---------- */

function Turn({ m, onRetry }: { m: ChatMessage; onRetry: () => void }) {
  if (m.role === "user") {
    return (
      <div className="agent-user">
        <p>{m.content}</p>
      </div>
    );
  }
  const live = m.status === "streaming";
  const steps = [...(m.tools || []), ...(live && m.step && !m.content ? [m.step] : [])];
  return (
    <div className="agent-answer" aria-busy={live}>
      {steps.length > 0 && (
        <ul className="agent-tools">
          {steps.map((t, i) => (
            <li key={i} data-active={live && !m.content && i === steps.length - 1}>
              <span className="agent-tool-dot" />
              {t}
            </li>
          ))}
        </ul>
      )}
      {m.content ? (
        <div className="agent-md">
          <Markdown text={m.content} />
        </div>
      ) : live && !steps.length ? (
        <div className="agent-thinking" aria-label="Thinking">
          <span />
          <span />
          <span />
        </div>
      ) : null}
      {m.status === "error" && (
        <p className="agent-error">
          {m.content ? "That answer was cut off." : "Something went wrong."}{" "}
          <button onClick={onRetry}>Try again</button>
        </p>
      )}
    </div>
  );
}

export default function AgentView(p: AgentViewProps) {
  const [skill, setSkill] = useState<Skill | null>(null);
  const [examples, setExamples] = useState(true);
  const scroller = useRef<HTMLDivElement>(null);
  const pinned = useRef(true);
  const chatting = p.messages.length > 0 || p.loadingChat;

  // follow the answer while it streams, unless the user scrolled up
  useEffect(() => {
    const el = scroller.current;
    if (el && pinned.current) el.scrollTop = el.scrollHeight;
  }, [p.messages]);
  useEffect(() => {
    pinned.current = true;
    const el = scroller.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [p.currentId]);

  const send = (text: string, s: SkillId | null) => {
    pinned.current = true;
    p.onSend(text, s);
  };

  return (
    <>
      <PageHeader
        actions={
          chatting ? (
            <button className="app-icon-btn" aria-label="New chat" title="New chat" onClick={p.onNew}>
              <SquarePen size={16} strokeWidth={1.75} />
            </button>
          ) : null
        }
      >
        <History
          title={p.title}
          conversations={p.conversations}
          currentId={p.currentId}
          onNew={p.onNew}
          onOpen={p.onOpen}
          onDelete={p.onDelete}
        />
      </PageHeader>

      {chatting ? (
        <div className="agent-chat">
          <div
            className="agent-thread"
            ref={scroller}
            onScroll={(e) => {
              const el = e.currentTarget;
              pinned.current = el.scrollHeight - el.scrollTop - el.clientHeight < 80;
            }}
          >
            <div className="agent-thread-col">
              {p.loadingChat ? (
                <div className="agent-loading" aria-busy="true" aria-label="Loading chat">
                  <span className="app-skel" style={{ width: "46%", height: 36, marginLeft: "auto", borderRadius: 14 }} />
                  <span className="app-skel" style={{ width: "88%", height: 14 }} />
                  <span className="app-skel" style={{ width: "72%", height: 14 }} />
                  <span className="app-skel" style={{ width: "80%", height: 14 }} />
                </div>
              ) : (
                p.messages.map((m) => <Turn key={m.id} m={m} onRetry={p.onRetry} />)
              )}
              {p.error && <p className="agent-error agent-error-solo">{p.error}</p>}
            </div>
          </div>
          <div className="agent-dock">
            <Composer onSend={send} onStop={p.onStop} streaming={p.streaming} docked skill={skill} setSkill={setSkill} />
          </div>
        </div>
      ) : (
        <div className="agent-stage">
          <div className="agent-col">
            <h1 className="agent-heading">Welcome to Stride</h1>
            <Composer onSend={send} onStop={p.onStop} streaming={p.streaming} skill={skill} setSkill={setSkill} autoFocus />
            {p.error && <p className="agent-error agent-error-solo">{p.error}</p>}
            {examples && (
              <>
                <div className="agent-examples-head">
                  <span>Get started with some examples</span>
                  <button className="app-icon-btn" aria-label="Hide examples" onClick={() => setExamples(false)}>
                    <X size={15} strokeWidth={1.75} />
                  </button>
                </div>
                <div className="agent-cards">
                  {SKILLS.map((s) => (
                    <button key={s.id} className="agent-card" data-active={skill?.id === s.id} onClick={() => setSkill(s)}>
                      <s.Icon size={18} strokeWidth={1.5} />
                      <span className="agent-card-title">{s.title}</span>
                      <span className="agent-card-body">{s.body}</span>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
