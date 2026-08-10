import React from "react";
import {
  useCurrentFrame,
  useVideoConfig,
  spring,
  interpolate,
  Sequence,
} from "remotion";
import { theme } from "../../lib/theme";
import { AnimatedText } from "../animated-text";

interface TechCardProps {
  name: string;
  description: string;
  icon: string;
  color: string;
  delay: number;
  x: number;
  y: number;
}

const TechCard: React.FC<TechCardProps> = ({
  name,
  description,
  icon,
  color,
  delay,
  x,
  y,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const progress = spring({
    frame: frame - delay,
    fps,
    config: { damping: 15, stiffness: 80 },
  });

  const hover = 1 + Math.sin((frame - delay) * 0.05) * 0.02;

  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        opacity: progress,
        transform: `scale(${progress * hover}) translateY(${interpolate(progress, [0, 1], [40, 0])}px)`,
      }}
    >
      <div
        style={{
          background: `linear-gradient(135deg, ${theme.colors.darkGray}, ${theme.colors.dark})`,
          borderRadius: 20,
          padding: 24,
          border: `1px solid ${color}40`,
          boxShadow: `0 20px 40px rgba(0,0,0,0.3), 0 0 60px ${color}15`,
          width: 200,
        }}
      >
        <div
          style={{
            width: 48,
            height: 48,
            borderRadius: 12,
            background: `${color}20`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 24,
            marginBottom: 16,
          }}
        >
          {icon}
        </div>
        <div
          style={{
            fontSize: 18,
            fontWeight: 700,
            color: theme.colors.white,
            marginBottom: 8,
          }}
        >
          {name}
        </div>
        <div
          style={{
            fontSize: 13,
            color: theme.colors.lightGray,
            lineHeight: 1.5,
          }}
        >
          {description}
        </div>
      </div>
    </div>
  );
};

const ConnectionLine: React.FC<{
  from: { x: number; y: number };
  to: { x: number; y: number };
  delay: number;
  color: string;
}> = ({ from, to, delay, color }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const progress = spring({
    frame: frame - delay,
    fps,
    config: { damping: 20, stiffness: 60 },
  });

  const pathLength = Math.sqrt(
    Math.pow(to.x - from.x, 2) + Math.pow(to.y - from.y, 2)
  );

  return (
    <svg
      style={{
        position: "absolute",
        left: 0,
        top: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
      }}
    >
      <defs>
        <linearGradient id={`grad-${delay}`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="50%" stopColor={color} stopOpacity="0.8" />
          <stop offset="100%" stopColor={color} stopOpacity="0.3" />
        </linearGradient>
      </defs>
      <line
        x1={from.x}
        y1={from.y}
        x2={to.x}
        y2={to.y}
        stroke={`url(#grad-${delay})`}
        strokeWidth="2"
        strokeDasharray={pathLength}
        strokeDashoffset={interpolate(progress, [0, 1], [pathLength, 0])}
      />
      {/* Animated dot */}
      {progress > 0.5 && (
        <circle
          cx={interpolate(
            (frame - delay - 30) % 60,
            [0, 60],
            [from.x, to.x]
          )}
          cy={interpolate(
            (frame - delay - 30) % 60,
            [0, 60],
            [from.y, to.y]
          )}
          r="4"
          fill={color}
          opacity={0.8}
        />
      )}
    </svg>
  );
};

const OpikDashboard: React.FC<{ delay: number }> = ({ delay }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const progress = spring({
    frame: frame - delay,
    fps,
    config: { damping: 15, stiffness: 60 },
  });

  const traces = [
    { name: "focus_prediction", latency: "245ms", tokens: 1240, status: "success" },
    { name: "intervention_gen", latency: "312ms", tokens: 890, status: "success" },
    { name: "pattern_analysis", latency: "178ms", tokens: 2100, status: "success" },
    { name: "user_context", latency: "89ms", tokens: 450, status: "success" },
  ];

  return (
    <div
      style={{
        opacity: progress,
        transform: `scale(${interpolate(progress, [0, 1], [0.9, 1])}) translateY(${interpolate(progress, [0, 1], [30, 0])}px)`,
      }}
    >
      <div
        style={{
          background: `linear-gradient(145deg, ${theme.colors.darkGray}, ${theme.colors.dark})`,
          borderRadius: 24,
          padding: 32,
          border: `1px solid ${theme.colors.secondary}30`,
          boxShadow: `0 30px 60px rgba(0,0,0,0.4), 0 0 80px ${theme.colors.secondary}10`,
          width: 600,
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 24,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                background: theme.colors.secondary,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 700,
                color: theme.colors.dark,
                fontSize: 16,
              }}
            >
              O
            </div>
            <span style={{ fontSize: 18, fontWeight: 600, color: theme.colors.white }}>
              Opik Dashboard
            </span>
          </div>
          <div
            style={{
              background: `${theme.colors.success}20`,
              padding: "6px 12px",
              borderRadius: 20,
              fontSize: 12,
              color: theme.colors.success,
              fontWeight: 600,
            }}
          >
            Live
          </div>
        </div>

        {/* Traces table */}
        <div
          style={{
            background: theme.colors.dark,
            borderRadius: 12,
            overflow: "hidden",
          }}
        >
          {/* Table header */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "2fr 1fr 1fr 1fr",
              padding: "12px 16px",
              background: theme.colors.gray + "30",
              fontSize: 12,
              color: theme.colors.lightGray,
              textTransform: "uppercase",
              letterSpacing: 1,
            }}
          >
            <div>Trace</div>
            <div>Latency</div>
            <div>Tokens</div>
            <div>Status</div>
          </div>

          {/* Table rows */}
          {traces.map((trace, i) => {
            const rowProgress = spring({
              frame: frame - delay - 30 - i * 10,
              fps,
              config: { damping: 15, stiffness: 100 },
            });

            return (
              <div
                key={trace.name}
                style={{
                  display: "grid",
                  gridTemplateColumns: "2fr 1fr 1fr 1fr",
                  padding: "14px 16px",
                  borderBottom: `1px solid ${theme.colors.gray}20`,
                  opacity: rowProgress,
                  transform: `translateX(${interpolate(rowProgress, [0, 1], [-20, 0])}px)`,
                }}
              >
                <div style={{ color: theme.colors.white, fontSize: 14, fontFamily: theme.fonts.mono }}>
                  {trace.name}
                </div>
                <div style={{ color: theme.colors.secondary, fontSize: 14 }}>
                  {trace.latency}
                </div>
                <div style={{ color: theme.colors.lightGray, fontSize: 14 }}>
                  {trace.tokens.toLocaleString()}
                </div>
                <div>
                  <span
                    style={{
                      background: `${theme.colors.success}20`,
                      color: theme.colors.success,
                      padding: "4px 8px",
                      borderRadius: 4,
                      fontSize: 11,
                      fontWeight: 600,
                    }}
                  >
                    ✓
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Stats */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginTop: 20,
            paddingTop: 20,
            borderTop: `1px solid ${theme.colors.gray}20`,
          }}
        >
          {[
            { label: "Total Traces", value: "12.4K" },
            { label: "Avg Latency", value: "206ms" },
            { label: "Success Rate", value: "99.8%" },
          ].map((stat) => (
            <div key={stat.label} style={{ textAlign: "center" }}>
              <div style={{ fontSize: 24, fontWeight: 700, color: theme.colors.white }}>
                {stat.value}
              </div>
              <div style={{ fontSize: 12, color: theme.colors.lightGray }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export const TechStackScene: React.FC = () => {
  const frame = useCurrentFrame();

  const techStack = [
    { name: "Next.js 14", description: "App Router, Server Components", icon: "▲", color: theme.colors.white, x: 100, y: 200, delay: 30 },
    { name: "TypeScript", description: "Type-safe development", icon: "TS", color: "#3178C6", x: 100, y: 420, delay: 50 },
    { name: "Supabase", description: "Auth, Database, Realtime", icon: "⚡", color: "#3ECF8E", x: 100, y: 640, delay: 70 },
    { name: "Claude API", description: "AI-powered insights", icon: "🤖", color: theme.colors.primary, x: 400, y: 310, delay: 90 },
    { name: "Opik SDK", description: "LLM Observability", icon: "👁", color: theme.colors.secondary, x: 400, y: 530, delay: 110 },
  ];

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        background: theme.colors.dark,
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Background grid */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `
            linear-gradient(${theme.colors.gray}10 1px, transparent 1px),
            linear-gradient(90deg, ${theme.colors.gray}10 1px, transparent 1px)
          `,
          backgroundSize: "50px 50px",
          opacity: 0.5,
        }}
      />

      {/* Title */}
      <div style={{ position: "absolute", top: 60, left: 100 }}>
        <Sequence from={0} durationInFrames={1200}>
          <AnimatedText variant="heading" animation="words" delay={0}>
            Built for Observability
          </AnimatedText>
        </Sequence>
        <Sequence from={20} durationInFrames={1180}>
          <div style={{ marginTop: 16 }}>
            <AnimatedText
              variant="body"
              animation="fade"
              delay={20}
              color={theme.colors.lightGray}
            >
              Powered by Opik for complete LLM tracing & debugging
            </AnimatedText>
          </div>
        </Sequence>
      </div>

      {/* Connection lines */}
      <ConnectionLine
        from={{ x: 300, y: 250 }}
        to={{ x: 400, y: 350 }}
        delay={100}
        color={theme.colors.primary}
      />
      <ConnectionLine
        from={{ x: 300, y: 470 }}
        to={{ x: 400, y: 380 }}
        delay={120}
        color={theme.colors.secondary}
      />
      <ConnectionLine
        from={{ x: 300, y: 690 }}
        to={{ x: 400, y: 570 }}
        delay={140}
        color="#3ECF8E"
      />
      <ConnectionLine
        from={{ x: 600, y: 380 }}
        to={{ x: 750, y: 450 }}
        delay={160}
        color={theme.colors.primary}
      />
      <ConnectionLine
        from={{ x: 600, y: 570 }}
        to={{ x: 750, y: 500 }}
        delay={180}
        color={theme.colors.secondary}
      />

      {/* Tech cards */}
      {techStack.map((tech) => (
        <TechCard key={tech.name} {...tech} />
      ))}

      {/* Opik Dashboard */}
      <div style={{ position: "absolute", right: 100, top: "50%", transform: "translateY(-50%)" }}>
        <Sequence from={150} durationInFrames={1050}>
          <OpikDashboard delay={150} />
        </Sequence>
      </div>

      {/* Opik highlight box */}
      <Sequence from={250} durationInFrames={950}>
        <div
          style={{
            position: "absolute",
            bottom: 60,
            left: 100,
            right: 100,
          }}
        >
          <div
            style={{
              background: `linear-gradient(90deg, ${theme.colors.secondary}20, transparent)`,
              borderLeft: `4px solid ${theme.colors.secondary}`,
              padding: 24,
              borderRadius: "0 12px 12px 0",
            }}
          >
            <AnimatedText
              variant="subheading"
              animation="fade"
              delay={250}
              color={theme.colors.secondary}
            >
              🏆 Competing for the $5,000 Opik Prize
            </AnimatedText>
          </div>
        </div>
      </Sequence>
    </div>
  );
};
