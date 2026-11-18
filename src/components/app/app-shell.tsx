"use client";

/**
 * The signed-in app frame, following Linear's app shell.
 * Desktop: sidebar column + inset panel.
 * Phones: the same sidebar slides in as a drawer from the page header's
 * sidebar button, and closes on any tap inside it or outside it.
 * Desktop: the sidebar collapses from its own toggle (the page header's
 * toggle brings it back) and resizes by dragging its right edge.
 */

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  Crown,
  FingerprintPattern,
  History,
  House,
  MessageSquarePlus,
  MessagesSquare,
  PanelLeft,
  Search,
  Target,
  type LucideIcon,
} from "lucide-react";
import ProfileMenu, { type ShellUser } from "./profile-menu";
import { openFeedback } from "./routes";
import { PlanProvider } from "./plan-context";
import { StartSessionProvider } from "./start-dialog";

type Item = { label: string; href: string; Icon: LucideIcon };

const primary: Item[] = [
  { label: "Home", href: "/home", Icon: House },
  { label: "Sessions", href: "/sessions", Icon: History },
  { label: "Agent", href: "/agent", Icon: MessagesSquare },
];

const focus: Item[] = [
  { label: "Insights", href: "/insights", Icon: FingerprintPattern },
  { label: "Goals", href: "/goals", Icon: Target },
];

const ICON = { size: 16, strokeWidth: 1.75 } as const;
const EASE = [0.22, 1, 0.36, 1] as const;

const SB_MIN = 220;
const SB_MAX = 360;
const SB_DEFAULT = 248;
const isDesktop = () => window.matchMedia("(min-width: 768px)").matches;

/* ---- sidebar state, shared with page headers ---- */
const ShellContext = createContext<{ showSidebar: () => void }>({ showSidebar: () => {} });

/** Sidebar button for page headers: on phones it opens the drawer,
 *  on desktop it shows only while the sidebar is collapsed. */
export function SidebarToggle() {
  const { showSidebar } = useContext(ShellContext);
  return (
    <button className="app-icon-btn app-sb-toggle" onClick={showSidebar} aria-label="Open sidebar">
      <PanelLeft size={18} strokeWidth={1.75} />
    </button>
  );
}

const Caret = () => (
  <svg className="app-caret" width="8" height="8" viewBox="0 0 8 8" aria-hidden="true">
    <path d="M1 2.5h6L4 6z" fill="currentColor" />
  </svg>
);

function NavItem({ item, active }: { item: Item; active: boolean }) {
  return (
    <Link href={item.href} className="app-nav-item" data-active={active} aria-current={active ? "page" : undefined}>
      <item.Icon {...ICON} />
      {item.label}
    </Link>
  );
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(true);
  return (
    <div className="app-nav-group">
      <button className="app-nav-head" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
        {title}
        <Caret />
      </button>
      {open && <nav className="app-nav">{children}</nav>}
    </div>
  );
}

function SidebarContent({
  user,
  plan,
  isActive,
  onToggle,
  toggleLabel,
}: {
  user: ShellUser;
  plan: "free" | "premium";
  isActive: (href: string) => boolean;
  onToggle: () => void;
  toggleLabel: string;
}) {
  return (
    <div className="app-sb-inner">
      <div className="app-sb-top">
        <ProfileMenu user={user} />
        <span className="app-spacer" />
        <button className="app-icon-btn" aria-label="Search" title="Search  ⌘K">
          <Search {...ICON} />
        </button>
        <button className="app-icon-btn" onClick={onToggle} aria-label={toggleLabel} title={toggleLabel}>
          <PanelLeft size={17} strokeWidth={1.75} />
        </button>
      </div>

      <nav className="app-nav">
        {primary.map((item) => (
          <NavItem key={item.href} item={item} active={isActive(item.href)} />
        ))}
      </nav>

      <Group title="Focus">
        {focus.map((item) => (
          <NavItem key={item.href} item={item} active={isActive(item.href)} />
        ))}
      </Group>

      <Group title="Try">
        {plan === "free" && (
          <NavItem item={{ label: "Upgrade to Premium", href: "/premium", Icon: Crown }} active={isActive("/premium")} />
        )}
        <button className="app-nav-item" onClick={openFeedback} style={{ border: 0, background: "none", cursor: "pointer" }}>
          <MessageSquarePlus {...ICON} />
          Send feedback
        </button>
      </Group>
    </div>
  );
}

export default function AppShell({
  user,
  plan,
  children,
}: {
  user: ShellUser;
  plan: "free" | "premium";
  children: React.ReactNode;
}) {
  const pathname = usePathname() || "";
  const [drawer, setDrawer] = useState(false);
  const close = useCallback(() => setDrawer(false), []);

  // desktop collapse, remembered per browser (applied pre-paint by ThemeScript)
  const setCollapsed = useCallback((c: boolean) => {
    const root = document.documentElement;
    if (c) root.setAttribute("data-app-sb", "collapsed");
    else root.removeAttribute("data-app-sb");
    try {
      if (c) localStorage.setItem("stride-sidebar", "collapsed");
      else localStorage.removeItem("stride-sidebar");
    } catch {}
  }, []);
  const showSidebar = useCallback(() => {
    if (isDesktop()) setCollapsed(false);
    else setDrawer(true);
  }, [setCollapsed]);

  // drag the right edge to resize (desktop); writes the CSS variable directly
  const handle = useRef<HTMLDivElement>(null);
  const onResizeStart = (e: React.PointerEvent) => {
    e.preventDefault();
    const root = document.documentElement;
    const sidebar = (e.currentTarget.parentElement as HTMLElement).getBoundingClientRect();
    let width = sidebar.width;
    root.setAttribute("data-app-resizing", "");
    handle.current?.setAttribute("data-dragging", "true");
    const move = (ev: PointerEvent) => {
      width = Math.min(SB_MAX, Math.max(SB_MIN, ev.clientX - sidebar.left));
      root.style.setProperty("--app-sb-w", `${width}px`);
    };
    const up = () => {
      root.removeAttribute("data-app-resizing");
      handle.current?.removeAttribute("data-dragging");
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      try {
        localStorage.setItem("stride-sidebar-w", String(Math.round(width)));
      } catch {}
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  };
  const onResizeReset = () => {
    document.documentElement.style.setProperty("--app-sb-w", `${SB_DEFAULT}px`);
    try {
      localStorage.removeItem("stride-sidebar-w");
    } catch {}
  };

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + "/") || pathname.endsWith(href);

  // close on navigation and Escape; lock page scroll while open
  useEffect(close, [pathname, close]);
  useEffect(() => {
    if (!drawer) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [drawer, close]);

  // any tap on a link or nav item inside the drawer closes it
  const onDrawerClick = (e: React.MouseEvent) => {
    const t = e.target as HTMLElement;
    if (t.closest("a, .app-nav-item, .app-menu-item, .app-icon-btn")) close();
  };

  return (
    <div className="app">
    <PlanProvider plan={plan}>
    <StartSessionProvider>
    <ShellContext.Provider value={{ showSidebar }}>
        <div className="app-frame">
          <aside className="app-sidebar" aria-label="Sidebar">
            <SidebarContent
              user={user}
              plan={plan}
              isActive={isActive}
              onToggle={() => setCollapsed(true)}
              toggleLabel="Collapse sidebar"
            />
            <div
              ref={handle}
              className="app-sb-resize"
              role="separator"
              aria-orientation="vertical"
              aria-label="Resize sidebar"
              title="Drag to resize, double-click to reset"
              onPointerDown={onResizeStart}
              onDoubleClick={onResizeReset}
            />
          </aside>

          <div className="app-main">
            <main className="app-panel">{children}</main>
          </div>
        </div>

        <AnimatePresence>
          {drawer && (
            <>
              <motion.div
                key="scrim"
                className="app-drawer-scrim"
                onClick={close}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              />
              <motion.aside
                key="drawer"
                className="app-drawer"
                aria-label="Sidebar"
                onClick={onDrawerClick}
                initial={{ x: "-100%" }}
                animate={{ x: 0 }}
                exit={{ x: "-100%" }}
                transition={{ duration: 0.28, ease: EASE }}
              >
                <SidebarContent user={user} plan={plan} isActive={isActive} onToggle={close} toggleLabel="Close sidebar" />
              </motion.aside>
            </>
          )}
        </AnimatePresence>
    </ShellContext.Provider>
    </StartSessionProvider>
    </PlanProvider>
    </div>
  );
}
