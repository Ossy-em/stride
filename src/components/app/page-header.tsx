"use client";

import { SidebarToggle } from "./app-shell";

/**
 * Top bar of every page in the panel: sidebar button (phones only),
 * then the page title or title control, then optional actions.
 */
export default function PageHeader({
  title,
  actions,
  children,
}: {
  title?: string;
  actions?: React.ReactNode;
  children?: React.ReactNode;
}) {
  return (
    <header className="app-bar">
      <SidebarToggle />
      {title ? <h1 className="app-bar-title" style={{ margin: 0, paddingLeft: 0, cursor: "default" }}>{title}</h1> : children}
      {actions && <div className="app-bar-actions">{actions}</div>}
    </header>
  );
}
