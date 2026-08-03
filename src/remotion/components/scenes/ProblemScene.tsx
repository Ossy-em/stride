import React from "react";
import {
  useCurrentFrame,
  useVideoConfig,
  spring,
  interpolate,
  Sequence,
} from "remotion";
import { theme } from "../../lib/theme";
import { AnimatedText } from "../AnimatedText";

interface NotificationProps {
  delay: number;
  x: number;
  y: number;
  type: "slack" | "email" | "calendar" | "social";
  text: string;
}

const Notification: React.FC<NotificationProps> = ({
  delay,
  x,
  y,
  type,
  text,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const progress = spring({
    frame: frame - delay,
    fps,
    config: { damping: 12, stiffness: 200 },
  });

  const shake = Math.sin((frame - delay) * 0.8) * 3 * Math.max(0, 1 - (frame - delay) / 30);

  const typeColors = {
    slack: "#4A154B",
    email: "#EA4335",
    calendar: "#4285F4",
    social: "#1DA1F2",
  };

  const typeIcons = {
    slack: "#",
    email: "✉",
    calendar: "📅",
    social: "🔔",
  };

  if (frame < delay) return null;

  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        transform: `scale(${progress}) translateX(${shake}px)`,
        opacity: interpolate(progress, [0, 0.5, 1], [0, 1, 1]),
      }}
    >
      <div
        style={{
          background: theme.colors.darkGray,
          borderRadius: 12,
          padding: "12px 16px",
          display: "flex",
          alignItems: "center",
          gap: 12,
          boxShadow: `0 8px 32px rgba(0,0,0,0.3), 0 0 0 1px ${typeColors[type]}40`,
          minWidth: 200,
        }}
      >
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 8,
            background: typeColors[type],
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 18,
          }}
        >
          {typeIcons[type]}
        </div>
        <div>
          <div
            style={{
              fontSize: 12,
              color: theme.colors.lightGray,
              marginBottom: 2,
            }}
          >
            {type.charAt(0).toUpperCase() + type.slice(1)}
          </div>
          <div
            style={{
              fontSize: 14,
              color: theme.colors.white,
              fontWeight: 500,
            }}
          >
            {text}
          </div>
        </div>
      </div>
    </div>
  );
};

const StatBox: React.FC<{
  value: string;
  label: string;
  delay: number;
  color: string;
}> = ({ value, label, delay, color }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const progress = spring({
    frame: frame - delay,
    fps,
    config: { damping: 15, stiffness: 100 },
  });

  return (
    <div
      style={{
        opacity: progress,
        transform: `translateY(${interpolate(progress, [0, 1], [40, 0])}px)`,
      }}
    >
      <div
        style={{
          background: `linear-gradient(135deg, ${theme.colors.darkGray}, ${theme.colors.dark})`,
          borderRadius: 20,
          padding: "32px 40px",
          border: `1px solid ${color}30`,
          textAlign: "center",
        }}
      >
        <div
          style={{
            fontSize: 64,
            fontWeight: 800,
            color: color,
            fontFamily: theme.fonts.heading,
            lineHeight: 1,
          }}
        >
          {value}
        </div>
        <div
          style={{
            fontSize: 18,
            color: theme.colors.lightGray,
            marginTop: 12,
            fontFamily: theme.fonts.body,
          }}
        >
          {label}
        </div>
      </div>
    </div>
  );
};

export const ProblemScene: React.FC = () => {
  const frame = useCurrentFrame();

  const notifications = [
    { delay: 30, x: 100, y: 150, type: "slack" as const, text: "New message in #general" },
    { delay: 45, x: 250, y: 280, type: "email" as const, text: "Re: Q4 Planning" },
    { delay: 60, x: 150, y: 420, type: "calendar" as const, text: "Meeting in 15 min" },
    { delay: 75, x: 320, y: 180, type: "social" as const, text: "3 new notifications" },
    { delay: 90, x: 80, y: 550, type: "slack" as const, text: "@you mentioned" },
    { delay: 105, x: 280, y: 500, type: "email" as const, text: "URGENT: Review needed" },
  ];

  // Background pulse effect
  const pulseOpacity = 0.1 + Math.sin(frame * 0.1) * 0.05;

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
      {/* Animated background gradient */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `radial-gradient(circle at 30% 40%, ${theme.colors.error}${Math.round(pulseOpacity * 255).toString(16).padStart(2, '0')}, transparent 50%)`,
        }}
      />

      {/* Left side - Notification chaos */}
      <Sequence from={0} durationInFrames={500}>
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            width: "50%",
            height: "100%",
          }}
        >
          {notifications.map((n, i) => (
            <Notification key={i} {...n} />
          ))}
        </div>
      </Sequence>

      {/* Right side - Stats and text */}
      <div
        style={{
          position: "absolute",
          right: 80,
          top: "50%",
          transform: "translateY(-50%)",
          width: 700,
        }}
      >
        <Sequence from={0} durationInFrames={600}>
          <AnimatedText
            variant="heading"
            animation="words"
            delay={0}
            align="left"
          >
            The Focus Crisis
          </AnimatedText>
        </Sequence>

        <Sequence from={20} durationInFrames={580}>
          <div style={{ marginTop: 24 }}>
            <AnimatedText
              variant="body"
              animation="fade"
              delay={20}
              color={theme.colors.lightGray}
            >
              Modern workers face constant interruptions that destroy deep work
            </AnimatedText>
          </div>
        </Sequence>

        {/* Stats row */}
        <div
          style={{
            display: "flex",
            gap: 24,
            marginTop: 60,
          }}
        >
          <StatBox
            value="3 min"
            label="Average focus before interruption"
            delay={60}
            color={theme.colors.error}
          />
          <StatBox
            value="23 min"
            label="Time to regain deep focus"
            delay={80}
            color={theme.colors.warning}
          />
        </div>

        <Sequence from={120} durationInFrames={480}>
          <div style={{ marginTop: 48 }}>
            <AnimatedText
              variant="subheading"
              animation="fade"
              delay={120}
              color={theme.colors.primary}
            >
              What if you could predict when focus will break?
            </AnimatedText>
          </div>
        </Sequence>
      </div>
    </div>
  );
};
