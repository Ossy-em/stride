"use client";

/**
 * Insights charts, single series in the brand green (--app-chart).
 * Highlighted marks (peak window / best day) are full strength, the rest a
 * lighter step of the same hue. Hover shows the exact numbers; a hidden
 * table carries them for screen readers.
 */

import { useState } from "react";
import type { FocusFingerprintData } from "@/types";

export const hourLabel = (h: number) => (h === 0 ? "12am" : h === 12 ? "12pm" : h > 12 ? `${h - 12}pm` : `${h}am`);
const sessions = (n: number) => `${n} session${n === 1 ? "" : "s"}`;

/* ---- focus by hour: columns, peak window highlighted ---- */
export function HourChart({
  data,
  peak,
}: {
  data: FocusFingerprintData["hourBreakdown"];
  peak: { start: number; end: number } | null;
}) {
  const [hover, setHover] = useState<number | null>(null);
  const inPeak = (h: number) => !!peak && h >= peak.start && h < peak.end;
  const now = new Date().getHours();
  const h = data.find((d) => d.hour === hover);

  return (
    <figure className="ins-chart" aria-label="Average focus by hour of day">
      <div className="ins-plot" aria-hidden="true" onMouseLeave={() => setHover(null)}>
        <div className="ins-grid">
          <span style={{ bottom: "100%" }}>100</span>
          <span style={{ bottom: "50%" }}>50</span>
          <span style={{ bottom: "0%" }}>0</span>
        </div>
        <div className="ins-cols">
          {data.map((d) => (
            <div
              key={d.hour}
              className="ins-col"
              data-peak={inPeak(d.hour)}
              data-now={d.hour === now}
              data-active={hover === d.hour}
              onMouseEnter={() => setHover(d.hour)}
            >
              {d.sessionCount > 0 ? (
                <span className="ins-bar" style={{ height: `${Math.max(d.avgScore, 2)}%` }} />
              ) : (
                <span className="ins-empty" />
              )}
            </div>
          ))}
          {h && (
            <div
              className="ins-tip"
              style={{
                left: `${((data.indexOf(h) + 0.5) / data.length) * 100}%`,
                bottom: `calc(${h.sessionCount ? Math.max(h.avgScore, 2) : 0}% + 8px)`,
              }}
            >
              <strong>{hourLabel(h.hour)}</strong>
              {h.sessionCount ? (
                <>
                  <span>{h.avgScore} avg focus</span>
                  <span>{sessions(h.sessionCount)}</span>
                </>
              ) : (
                <span>No sessions yet</span>
              )}
            </div>
          )}
        </div>
      </div>
      <div className="ins-xaxis" aria-hidden="true">
        {data.map((d) => (
          <span key={d.hour}>{d.hour % 3 === 0 ? hourLabel(d.hour) : ""}</span>
        ))}
      </div>
      <table className="sr-only">
        <caption>Average focus (0 to 100) by hour</caption>
        <tbody>
          {data.map((d) => (
            <tr key={d.hour}>
              <th scope="row">{hourLabel(d.hour)}</th>
              <td>{d.sessionCount ? `${d.avgScore}, ${sessions(d.sessionCount)}` : "no sessions"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  );
}

/* ---- focus by day: horizontal bars, best day highlighted ---- */
const ORDER = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export function DayChart({ data }: { data: FocusFingerprintData["dayBreakdown"] }) {
  const rows = ORDER.map((name) => data.find((d) => d.day === name)).filter(Boolean) as typeof data;
  const active = rows.filter((d) => d.sessionCount > 0);
  const best = active.length ? active.reduce((a, b) => (b.avgScore > a.avgScore ? b : a)) : null;
  const today = new Date().toLocaleDateString("en-US", { weekday: "long" });

  return (
    <figure className="ins-days" aria-label="Average focus by day of week">
      {rows.map((d) => (
        <div
          key={d.day}
          className="ins-day"
          data-best={best?.day === d.day}
          title={d.sessionCount ? `${d.day}: ${d.avgScore} avg focus, ${sessions(d.sessionCount)}` : `${d.day}: no sessions yet`}
        >
          <span className="ins-day-name" data-today={d.day === today}>
            {d.day.slice(0, 3)}
          </span>
          <span className="ins-day-track">
            {d.sessionCount > 0 && <span className="ins-day-bar" style={{ width: `${Math.max(d.avgScore, 3)}%` }} />}
          </span>
          <span className="ins-day-value">{d.sessionCount ? d.avgScore : "–"}</span>
          <span className="ins-day-count">{d.sessionCount ? sessions(d.sessionCount) : ""}</span>
        </div>
      ))}
    </figure>
  );
}

/* ---- drift: where in a session focus usually slips ---- */
export function DriftTrack({ minute }: { minute: number }) {
  const span = Math.max(30, Math.ceil((minute * 1.5) / 15) * 15);
  const ticks = Array.from({ length: span / 15 + 1 }, (_, i) => i * 15);
  return (
    <div className="ins-drift" aria-hidden="true">
      <div className="ins-drift-line">
        <span style={{ width: `${(minute / span) * 100}%` }} />
      </div>
      <span className="ins-drift-mark" style={{ left: `${(minute / span) * 100}%` }} />
      <div className="ins-drift-ticks">
        {ticks.map((t) => (
          <span key={t} style={{ left: `${(t / span) * 100}%` }}>
            {t === 0 ? "Start" : `${t} min`}
          </span>
        ))}
      </div>
    </div>
  );
}
