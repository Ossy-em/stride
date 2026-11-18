"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, LogOut, Monitor, Moon, Settings, Sun } from "lucide-react";
import { useAppTheme, type ThemePref } from "./use-app-theme";

export type ShellUser = { name?: string | null; email?: string | null; image?: string | null };

const initials = (name?: string | null, email?: string | null) => {
  const src = (name || email || "?").trim();
  const parts = src.split(/\s+/).filter(Boolean);
  return (parts.length > 1 ? parts[0][0] + parts[1][0] : src.slice(0, 2)).toUpperCase();
};

const themes: { value: ThemePref; label: string; Icon: typeof Sun }[] = [
  { value: "system", label: "System", Icon: Monitor },
  { value: "light", label: "Light", Icon: Sun },
  { value: "dark", label: "Dark", Icon: Moon },
];

export function Avatar({ user }: { user: ShellUser }) {
  return (
    <span className="app-avatar" aria-hidden="true">
      {user.image ? <img src={user.image} alt="" referrerPolicy="no-referrer" /> : initials(user.name, user.email)}
    </span>
  );
}

export default function ProfileMenu({ user, align = "left" }: { user: ShellUser; align?: "left" | "right" }) {
  const [open, setOpen] = useState(false);
  const [theme, setTheme] = useAppTheme();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div className="app-profile" ref={ref}>
      <button
        className="app-avatar-btn"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Account menu"
      >
        <Avatar user={user} />
        {user.name && <span className="app-avatar-name">{user.name.split(" ")[0]}</span>}
        <ChevronDown size={14} strokeWidth={1.75} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            className="app-menu"
            role="menu"
            style={align === "right" ? { left: "auto", right: 0 } : undefined}
            initial={{ opacity: 0, y: -4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.14, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="app-menu-head">
              {user.name && <p className="app-menu-name">{user.name}</p>}
              {user.email && <p className="app-menu-email">{user.email}</p>}
            </div>
            <div className="app-menu-sep" />
            <Link href="/settings" className="app-menu-item" role="menuitem" onClick={() => setOpen(false)}>
              <Settings size={15} strokeWidth={1.75} />
              Settings
            </Link>
            <div className="app-theme-row">
              <span>Theme</span>
              <div className="app-seg" role="group" aria-label="Theme">
                {themes.map(({ value, label, Icon }) => (
                  <button
                    key={value}
                    aria-pressed={theme === value}
                    aria-label={label}
                    title={label}
                    onClick={() => setTheme(value)}
                  >
                    <Icon size={14} strokeWidth={1.75} />
                  </button>
                ))}
              </div>
            </div>
            <div className="app-menu-sep" />
            <button className="app-menu-item" role="menuitem" onClick={() => signOut({ callbackUrl: "/" })}>
              <LogOut size={15} strokeWidth={1.75} />
              Sign out
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
