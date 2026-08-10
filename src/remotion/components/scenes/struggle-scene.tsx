import React from "react";
import {
  useCurrentFrame,
  useVideoConfig,
  spring,
  interpolate,
  Sequence,
} from "remotion";
import { theme } from "../../lib/theme";

const StruggleMoment: React.FC<{
  icon: string;
  text: string;
  delay: number;
  index: number;
}> = ({ icon, text, delay, index }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const progress = spring({
    frame: frame - delay,
    fps,
    config: { damping: 15, stiffness: 80 },
  });

  // Slight horizontal offset based on index
  const xOffset = (index % 2 === 0 ? -1 : 1) * 30;

  return (
    <div
      style={{
        opacity: progress,
        transform: `translateX(${interpolate(progress, [0, 1], [xOffset, 0])}px) translateY(${interpolate(progress, [0, 1], [20, 0])}px)`,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 20,
          background: `${theme.colors.darkGray}80`,
          borderRadius: 16,
          padding: "20px 28px",
          border: `1px solid ${theme.colors.gray}30`,
        }}
      >
        <div style={{ fontSize: 32 }}>{icon}</div>
        <span
          style={{
            fontSize: 20,
            color: theme.colors.white,
            fontFamily: theme.fonts.body,
            fontWeight: 500,
          }}
        >
          {text}
        </span>
      </div>
    </div>
  );
};

export const StruggleScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const struggles = [
    { icon: "😤", text: "Starting the day with best intentions..." },
    { icon: "📱", text: "...then checking your phone 'for just a second'" },
    { icon: "🔄", text: "Tab switching between tasks" },
    { icon: "😫", text: "Realizing an hour just disappeared" },
  ];

  // Main message reveal
  const messageProgress = spring({
    frame: frame - 450,
    fps,
    config: { damping: 15, stiffness: 50 },
  });

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        background: theme.colors.dark,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        overflow: "hidden",
        padding: 60,
      }}
    >
      {/* Subtle frustrated red glow */}
      <div
        style={{
          position: "absolute",
          top: "30%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 800,
          height: 600,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${theme.colors.error}10, transparent 60%)`,
          filter: "blur(80px)",
        }}
      />

      {/* Struggle moments */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 20,
          marginBottom: 60,
        }}
      >
        {struggles.map((s, i) => (
          <Sequence key={i} from={i * 60} durationInFrames={600 - i * 60}>
            <StruggleMoment
              icon={s.icon}
              text={s.text}
              delay={i * 60}
              index={i}
            />
          </Sequence>
        ))}
      </div>

      {/* Reassuring message */}
      <Sequence from={450} durationInFrames={150}>
        <div
          style={{
            textAlign: "center",
            opacity: messageProgress,
            transform: `translateY(${interpolate(messageProgress, [0, 1], [40, 0])}px)`,
          }}
        >
          <div
            style={{
              fontSize: 36,
              fontWeight: 600,
              color: theme.colors.white,
              fontFamily: theme.fonts.heading,
              marginBottom: 16,
            }}
          >
            You're not lazy.
          </div>
          <div
            style={{
              fontSize: 28,
              fontWeight: 400,
              color: theme.colors.lightGray,
              fontFamily: theme.fonts.body,
            }}
          >
            Your brain just needs the{" "}
            <span style={{ color: theme.colors.secondary }}>right support</span>.
          </div>
        </div>
      </Sequence>
    </div>
  );
};
