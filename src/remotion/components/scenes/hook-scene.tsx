import React from "react";
import {
  useCurrentFrame,
  useVideoConfig,
  spring,
  interpolate,
  Sequence,
} from "remotion";
import { theme } from "../../lib/theme";

export const HookScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Dramatic reveal timing
  const line1Progress = spring({
    frame: frame - 15,
    fps,
    config: { damping: 20, stiffness: 40 },
  });

  const line2Progress = spring({
    frame: frame - 60,
    fps,
    config: { damping: 20, stiffness: 40 },
  });

  // Subtle background pulse
  const bgPulse = 0.08 + Math.sin(frame * 0.03) * 0.03;

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
      }}
    >
      {/* Subtle radial glow */}
      <div
        style={{
          position: "absolute",
          width: 1200,
          height: 1200,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${theme.colors.primary}${Math.round(bgPulse * 255).toString(16).padStart(2, '0')}, transparent 50%)`,
          filter: "blur(100px)",
        }}
      />

      {/* Main hook text */}
      <div style={{ textAlign: "center", maxWidth: 1000, padding: "0 60px" }}>
        {/* Line 1 */}
        <div
          style={{
            fontSize: 64,
            fontWeight: 700,
            color: theme.colors.white,
            fontFamily: theme.fonts.heading,
            lineHeight: 1.2,
            letterSpacing: -2,
            opacity: line1Progress,
            transform: `translateY(${interpolate(line1Progress, [0, 1], [30, 0])}px)`,
          }}
        >
          What if you could predict
        </div>

        {/* Line 2 - highlighted */}
        <div
          style={{
            fontSize: 64,
            fontWeight: 700,
            fontFamily: theme.fonts.heading,
            lineHeight: 1.2,
            letterSpacing: -2,
            marginTop: 8,
            opacity: line2Progress,
            transform: `translateY(${interpolate(line2Progress, [0, 1], [30, 0])}px)`,
          }}
        >
          <span style={{ color: theme.colors.white }}>when you'll </span>
          <span
            style={{
              background: `linear-gradient(90deg, ${theme.colors.primary}, ${theme.colors.secondary})`,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            lose focus
          </span>
          <span style={{ color: theme.colors.white }}>?</span>
        </div>

        {/* Subtext */}
        <Sequence from={120} durationInFrames={180}>
          <div
            style={{
              marginTop: 40,
              opacity: spring({
                frame: frame - 120,
                fps,
                config: { damping: 20, stiffness: 60 },
              }),
            }}
          >
            <span
              style={{
                fontSize: 24,
                color: theme.colors.lightGray,
                fontFamily: theme.fonts.body,
                fontWeight: 400,
              }}
            >
              Before it happens.
            </span>
          </div>
        </Sequence>
      </div>
    </div>
  );
};
