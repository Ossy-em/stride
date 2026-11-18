"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, ChevronDown, type LucideIcon } from "lucide-react";

export type ChipOption<T extends string | number> = { value: T; label: string; hint?: string };

/** Small dropdown chip used inside composers (Skills, task type, duration). */
export default function ChipMenu<T extends string | number>({
  icon: Icon,
  label,
  options,
  value,
  onChange,
  footer,
  ariaLabel,
  align = "left",
}: {
  icon: LucideIcon;
  label: string;
  options: ChipOption<T>[];
  value: T | null;
  onChange: (v: T) => void;
  footer?: (close: () => void) => React.ReactNode;
  ariaLabel?: string;
  align?: "left" | "right";
}) {
  const [open, setOpen] = useState(false);
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
    <div className="app-chip-wrap" ref={ref}>
      <button
        type="button"
        className="app-chip"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={ariaLabel}
        onClick={() => setOpen((o) => !o)}
      >
        <Icon size={15} strokeWidth={1.75} />
        {label}
        <ChevronDown size={13} strokeWidth={1.75} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            className="app-menu app-chip-menu"
            style={align === "right" ? { left: "auto", right: -8 } : undefined}
            role="menu"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.14 }}
          >
            {options.map((o) => (
              <button
                key={String(o.value)}
                type="button"
                className="app-menu-item"
                role="menuitemradio"
                aria-checked={value === o.value}
                onClick={() => {
                  onChange(o.value);
                  setOpen(false);
                }}
              >
                <span style={{ flex: 1 }}>{o.label}</span>
                {o.hint && <span style={{ fontSize: 12, color: "var(--app-quiet)" }}>{o.hint}</span>}
                {value === o.value && <Check size={14} strokeWidth={2} />}
              </button>
            ))}
            {footer && (
              <>
                <div className="app-menu-sep" />
                {footer(() => setOpen(false))}
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
