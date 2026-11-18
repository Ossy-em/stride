"use client";

/** 30-second reset during a session. The session timer keeps running. */

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Eye, Hand, RotateCcw, Wind } from "lucide-react";
import "./session.css";

const ACTIVITIES = [
  { Icon: Wind, text: "Take 3 deep breaths", time: "10 sec" },
  { Icon: RotateCcw, text: "Roll your shoulders", time: "10 sec" },
  { Icon: Hand, text: "Stretch your hands", time: "5 sec" },
  { Icon: Eye, text: "Look away from screen", time: "5 sec" },
];

export default function BreakScreen({ onComplete, duration = 30 }: { onComplete: () => void; duration?: number }) {
  const [left, setLeft] = useState(duration);
  const done = useRef(false);

  useEffect(() => {
    const t = setInterval(() => setLeft((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (left === 0 && !done.current) {
      done.current = true;
      onComplete();
    }
  }, [left, onComplete]);

  const r = 44;
  const c = 2 * Math.PI * r;

  return (
    <motion.div
      className="break-screen"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
    >
      <div className="break-col">
        <div className="break-ring">
          <svg viewBox="0 0 96 96" aria-hidden="true">
            <circle cx="48" cy="48" r={r} className="ring-track" />
            <circle
              cx="48"
              cy="48"
              r={r}
              className="ring-fill"
              strokeDasharray={c}
              strokeDashoffset={c * (1 - left / duration)}
            />
          </svg>
          <span>{left}</span>
        </div>
        <h2>Quick reset</h2>
        <p>Your timer is still running. Take a moment.</p>
        <div className="app-list break-list">
          {ACTIVITIES.map(({ Icon, text, time }) => (
            <div className="app-row" key={text}>
              <Icon size={16} strokeWidth={1.75} />
              <span className="app-row-main app-row-title" style={{ fontWeight: 450 }}>
                {text}
              </span>
              <span className="app-row-meta">{time}</span>
            </div>
          ))}
        </div>
        <button
          className="app-ghost-btn"
          onClick={() => {
            if (!done.current) {
              done.current = true;
              onComplete();
            }
          }}
        >
          Skip and continue
        </button>
      </div>
    </motion.div>
  );
}
