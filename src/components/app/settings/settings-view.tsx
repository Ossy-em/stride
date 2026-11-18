"use client";

/**
 * Settings: profile, session defaults, theme, plan and usage, sign-in
 * methods, your data, and the account itself (sign out, delete).
 */

import { useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Clock, Download, Layers, LogOut, Monitor, Moon, Sun, Trash2 } from "lucide-react";
import PageHeader from "../page-header";
import ChipMenu from "../chip-menu";
import EmptyState from "../empty-state";
import { Avatar } from "../profile-menu";
import { useAppTheme, type ThemePref } from "../use-app-theme";
import "./settings.css";

export type AccountData = {
  profile: {
    name: string | null;
    email: string;
    image: string | null;
    plan: "free" | "premium";
    createdAt: string | null;
    defaultDuration: number | null;
    defaultTaskType: "coding" | "writing" | "reading" | null;
  };
  identities: { provider: string; email: string | null; lastUsedAt: string }[];
  methods: { google: boolean; apple: boolean; github: boolean; email: boolean };
  usage: {
    sessions: { used: number | null; limit: number };
    agent: { used: number | null; limit: number };
    maxSessionMinutes: number;
  };
};

export type SettingsActions = {
  save: (patch: { name?: string; defaultDuration?: number | null; defaultTaskType?: AccountData["profile"]["defaultTaskType"] }) => Promise<void>;
  signOut: () => void;
  deleteAccount: (confirmEmail: string) => Promise<void>;
};

const PROVIDERS: Record<string, string> = { google: "Google", apple: "Apple", github: "GitHub", email: "Email link" };
const TASKS = [
  { value: "none", label: "No default" },
  { value: "coding", label: "Development" },
  { value: "writing", label: "Writing" },
  { value: "reading", label: "Learning" },
] as const;
const THEMES: { value: ThemePref; label: string; Icon: typeof Sun }[] = [
  { value: "system", label: "System", Icon: Monitor },
  { value: "light", label: "Light", Icon: Sun },
  { value: "dark", label: "Dark", Icon: Moon },
];
const day = (iso: string) => new Date(iso).toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" });

function Row({ label, sub, children }: { label: string; sub?: React.ReactNode; children?: React.ReactNode }) {
  return (
    <div className="app-row set-row">
      <div className="app-row-main">
        <span className="app-row-title">{label}</span>
        {sub && <span className="app-row-sub">{sub}</span>}
      </div>
      {children && <div className="set-control">{children}</div>}
    </div>
  );
}

function NameRow({ name, onSave }: { name: string | null; onSave: (n: string) => Promise<void> }) {
  const [value, setValue] = useState(name ?? "");
  const [state, setState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  useEffect(() => setValue(name ?? ""), [name]);
  const dirty = value.trim() && value.trim() !== (name ?? "");
  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dirty) return;
    setState("saving");
    try {
      await onSave(value.trim());
      setState("saved");
      setTimeout(() => setState("idle"), 1600);
    } catch {
      setState("error");
    }
  };
  return (
    <form className="app-row set-row" onSubmit={save}>
      <div className="app-row-main">
        <label className="app-row-title" htmlFor="set-name">
          Name
        </label>
        {state === "error" && <span className="app-row-sub set-warn">Couldn&apos;t save. Try again.</span>}
      </div>
      <div className="set-control set-name">
        <input id="set-name" value={value} onChange={(e) => setValue(e.target.value)} maxLength={80} autoComplete="name" />
        {(dirty || state !== "idle") && (
          <button type="submit" className="app-ghost-btn" disabled={!dirty || state === "saving"}>
            {state === "saving" ? "Saving…" : state === "saved" ? "Saved" : "Save"}
          </button>
        )}
      </div>
    </form>
  );
}

function DeleteDialog({ email, onClose, onDelete }: { email: string; onClose: () => void; onDelete: (e: string) => Promise<void> }) {
  const [typed, setTyped] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && !busy && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose, busy]);
  const match = typed.trim().toLowerCase() === email.toLowerCase();
  return (
    <motion.div className="app-dialog-scrim" onClick={() => !busy && onClose()} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }}>
      <motion.form
        className="app-dialog set-delete"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="del-title"
        onClick={(e) => e.stopPropagation()}
        onSubmit={async (e) => {
          e.preventDefault();
          if (!match || busy) return;
          setBusy(true);
          setError(null);
          try {
            await onDelete(typed.trim());
          } catch (err) {
            setError((err as Error).message);
            setBusy(false);
          }
        }}
        initial={{ y: 8, scale: 0.98 }}
        animate={{ y: 0, scale: 1 }}
        exit={{ y: 8, scale: 0.98 }}
        transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
      >
        <h2 id="del-title">Delete your account?</h2>
        <p>
          This permanently deletes your sessions, insights, goals and Agent chats. It can&apos;t be undone. Type <strong>{email}</strong> to
          confirm.
        </p>
        <input className="set-input" value={typed} onChange={(e) => setTyped(e.target.value)} placeholder={email} aria-label="Your email" autoFocus />
        {error && <p className="set-warn">{error}</p>}
        <div className="app-dialog-actions">
          <button type="button" className="app-ghost-btn" onClick={onClose} disabled={busy}>
            Cancel
          </button>
          <button type="submit" className="app-cta set-danger" disabled={!match || busy}>
            {busy ? "Deleting…" : "Delete account"}
          </button>
        </div>
      </motion.form>
    </motion.div>
  );
}

export function SettingsSkeleton() {
  const Bar = ({ w, h = 12, style }: { w: number | string; h?: number; style?: React.CSSProperties }) => (
    <span className="app-skel" style={{ display: "block", width: w, height: h, borderRadius: 6, ...style }} />
  );
  return (
    <div className="app-page set-page" aria-busy="true" aria-label="Loading">
      {[3, 3, 2].map((n, g) => (
        <section className="app-section" key={g}>
          <Bar w={70} h={11} style={{ margin: "0 2px 14px" }} />
          <div className="app-list">
            {Array.from({ length: n }, (_, i) => (
              <div className="app-row" key={i}>
                <div className="app-row-main">
                  <Bar w={`${30 - i * 4}%`} h={13} />
                </div>
                <Bar w={110} h={26} />
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

export default function SettingsView({
  data,
  error,
  onRetry,
  actions,
}: {
  data: AccountData | null;
  error?: boolean;
  onRetry?: () => void;
  actions: SettingsActions;
}) {
  const [theme, setTheme] = useAppTheme();
  const [deleting, setDeleting] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const save = async (patch: Parameters<SettingsActions["save"]>[0]) => {
    setSaveError(null);
    try {
      await actions.save(patch);
    } catch (e) {
      setSaveError((e as Error).message || "Couldn't save. Try again.");
    }
  };

  if (error) {
    return (
      <>
        <PageHeader title="Settings" />
        <div className="app-scroll">
          <EmptyState
            title="Couldn't load your settings"
            description="Something went wrong. Please try again."
            action={
              <button className="app-ghost-btn" onClick={onRetry}>
                Try again
              </button>
            }
          />
        </div>
      </>
    );
  }

  const p = data?.profile;
  const max = data?.usage.maxSessionMinutes ?? 180;
  const durations = [15, 25, 30, 45, 60, 90, 120, 180].filter((m) => m <= max);
  const durationOptions = [{ value: 0, label: "Suggested" }, ...durations.map((m) => ({ value: m, label: `${m} min` }))];
  const used = new Map((data?.identities ?? []).map((i) => [i.provider, i]));
  const methods = data ? (Object.keys(PROVIDERS) as (keyof AccountData["methods"])[]).filter((k) => data.methods[k] || used.has(k)) : [];

  return (
    <>
      <PageHeader title="Settings" />
      <div className="app-scroll">
        {!data || !p ? (
          <SettingsSkeleton />
        ) : (
          <div className="app-page set-page">
            {saveError && <p className="set-warn set-banner">{saveError}</p>}

            <section className="app-section">
              <div className="app-section-head">Profile</div>
              <div className="app-list">
                <div className="app-row set-row set-me">
                  <Avatar user={p} />
                  <div className="app-row-main">
                    <span className="app-row-title">{p.name || p.email}</span>
                    <span className="app-row-sub">{p.createdAt ? `Member since ${day(p.createdAt)}` : p.email}</span>
                  </div>
                </div>
                <NameRow name={p.name} onSave={(name) => actions.save({ name })} />
                <Row label="Email" sub="Used to sign in. Every sign-in method with this email opens this account.">
                  <span className="set-value">{p.email}</span>
                </Row>
              </div>
            </section>

            <section className="app-section">
              <div className="app-section-head">Sessions</div>
              <div className="app-list">
                <Row label="Default length" sub="What the start box picks first. Suggested uses your own patterns.">
                  <ChipMenu
                    icon={Clock}
                    label={p.defaultDuration ? `${p.defaultDuration} min` : "Suggested"}
                    ariaLabel="Default session length"
                    options={durationOptions}
                    value={p.defaultDuration ?? 0}
                    onChange={(v) => save({ defaultDuration: v || null })}
                    align="right"
                  />
                </Row>
                <Row label="Default task type">
                  <ChipMenu
                    icon={Layers}
                    label={TASKS.find((t) => t.value === (p.defaultTaskType ?? "none"))!.label}
                    ariaLabel="Default task type"
                    options={TASKS.map((t) => ({ value: t.value, label: t.label }))}
                    value={p.defaultTaskType ?? "none"}
                    onChange={(v) => save({ defaultTaskType: v === "none" ? null : v })}
                    align="right"
                  />
                </Row>
              </div>
            </section>

            <section className="app-section">
              <div className="app-section-head">Appearance</div>
              <div className="app-list">
                <Row label="Theme">
                  <div className="app-seg set-seg" role="group" aria-label="Theme">
                    {THEMES.map(({ value, label, Icon }) => (
                      <button key={value} aria-pressed={theme === value} onClick={() => setTheme(value)}>
                        <Icon size={14} strokeWidth={1.75} />
                        {label}
                      </button>
                    ))}
                  </div>
                </Row>
              </div>
            </section>

            <section className="app-section">
              <div className="app-section-head">Plan</div>
              <div className="app-list">
                <Row
                  label={p.plan === "premium" ? "Premium" : "Free"}
                  sub={
                    p.plan === "premium"
                      ? "Unlimited sessions up to 3 hours, and unlimited Agent messages."
                      : `${data.usage.sessions.limit} sessions a day up to ${data.usage.maxSessionMinutes} min, and ${data.usage.agent.limit} Agent messages a day.`
                  }
                >
                  <Link href="/premium" className={p.plan === "premium" ? "app-ghost-btn" : "app-cta set-cta"}>
                    {p.plan === "premium" ? "Manage" : "Upgrade"}
                  </Link>
                </Row>
                {p.plan === "free" && (
                  <>
                    <Row label="Sessions today">
                      <span className="set-value">
                        {data.usage.sessions.used ?? 0} of {data.usage.sessions.limit}
                      </span>
                    </Row>
                    <Row label="Agent messages today">
                      <span className="set-value">
                        {data.usage.agent.used ?? 0} of {data.usage.agent.limit}
                      </span>
                    </Row>
                  </>
                )}
              </div>
            </section>

            <section className="app-section">
              <div className="app-section-head">Sign-in methods</div>
              <div className="app-list">
                {methods.map((m) => {
                  const u = used.get(m);
                  return (
                    <Row key={m} label={PROVIDERS[m]} sub={u ? `Last used ${day(u.lastUsedAt)}${u.email && u.email !== p.email ? ` · ${u.email}` : ""}` : "Not used yet"}>
                      {u && <span className="set-pill">Connected</span>}
                    </Row>
                  );
                })}
              </div>
              <p className="set-note">Sign in with any of these using {p.email} and you&apos;ll land in this account.</p>
            </section>

            <section className="app-section">
              <div className="app-section-head">Your data</div>
              <div className="app-list">
                <Row label="Export your data" sub="Sessions, check-ins, nudges, goals and Agent chats as one JSON file.">
                  <a className="app-ghost-btn" href="/api/user/export" download>
                    <Download size={14} strokeWidth={1.75} />
                    Export
                  </a>
                </Row>
              </div>
            </section>

            <section className="app-section">
              <div className="app-section-head">Account</div>
              <div className="app-list">
                <Row label="Sign out" sub="Signs you out on this device.">
                  <button className="app-ghost-btn" onClick={actions.signOut}>
                    <LogOut size={14} strokeWidth={1.75} />
                    Sign out
                  </button>
                </Row>
                <Row label="Delete account" sub="Permanently deletes your account and all your data.">
                  <button className="app-ghost-btn set-danger-ghost" onClick={() => setDeleting(true)}>
                    <Trash2 size={14} strokeWidth={1.75} />
                    Delete
                  </button>
                </Row>
              </div>
            </section>
          </div>
        )}
      </div>

      <AnimatePresence>
        {deleting && p && <DeleteDialog email={p.email} onClose={() => setDeleting(false)} onDelete={actions.deleteAccount} />}
      </AnimatePresence>
    </>
  );
}
