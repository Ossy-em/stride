import React from "react";
import { useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";
import { theme } from "../lib/theme";

interface CompanionInterfaceProps {
  delay?: number;
  state?: "idle" | "focusing" | "intervention" | "celebration";
  focusTime?: string;
  message?: string;
}

export const CompanionInterface: React.FC<CompanionInterfaceProps> = ({
  delay = 0,
  state = "idle",
  focusTime = "00:00",
  message = "Ready when you are",
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const containerScale = spring({
    frame: frame - delay,
    fps,
    config: { damping: 15, stiffness: 80 },
  });

  const contentOpacity = spring({
    frame: frame - delay - 15,
    fps,
    config: { damping: 20, stiffness: 60 },
  });

  // Subtle breathing animation for the companion
  const breathe = 1 + Math.sin(frame * 0.08) * 0.02;

  // State-based colors
  const stateColors = {
    idle: theme.colors.lightGray,
    focusing: theme.colors.secondary,
    intervention: theme.colors.primary,
    celebration: theme.colors.success,
  };

  const stateGlow = {
    idle: "none",
    focusing: `0 0 60px ${theme.colors.secondary}40`,
    intervention: `0 0 60px ${theme.colors.primary}40`,
    celebration: `0 0 80px ${theme.colors.success}40`,
  };

  return (
    <div
      style={{
        width: 400,
        transform: `scale(${containerScale})`,
        opacity: containerScale,
      }}
    >
      {/* Main Card */}
      <div
        style={{
          background: `linear-gradient(145deg, ${theme.colors.darkGray}ee, ${theme.colors.dark}ee)`,
          borderRadius: 32,
          padding: 32,
          border: `1px solid ${theme.colors.gray}40`,
          boxShadow: `
            0 25px 50px rgba(0, 0, 0, 0.4),
            ${stateGlow[state]}
          `,
          backdropFilter: "blur(20px)",
        }}
      >
        {/* Companion Avatar */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 24,
          }}
        >
          {/* Avatar Circle */}
          <div
            style={{
              width: 100,
              height: 100,
              borderRadius: "50%",
              background: `linear-gradient(135deg, ${stateColors[state]}30, ${stateColors[state]}10)`,
              border: `3px solid ${stateColors[state]}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transform: `scale(${breathe})`,
              transition: "border-color 0.3s, background 0.3s",
            }}
          >
            {/* Simple face representation */}
            <div style={{ position: "relative", width: 50, height: 40 }}>
              {/* Eyes */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  paddingLeft: 5,
                  paddingRight: 5,
                }}
              >
                <div
                  style={{
                    width: 8,
                    height: state === "celebration" ? 4 : 12,
                    borderRadius: state === "celebration" ? "0 0 8px 8px" : 4,
                    background: stateColors[state],
                  }}
                />
                <div
                  style={{
                    width: 8,
                    height: state === "celebration" ? 4 : 12,
                    borderRadius: state === "celebration" ? "0 0 8px 8px" : 4,
                    background: stateColors[state],
                  }}
                />
              </div>
              {/* Mouth */}
              <div
                style={{
                  width: 20,
                  height: 10,
                  borderRadius: "0 0 20px 20px",
                  border: `2px solid ${stateColors[state]}`,
                  borderTop: "none",
                  margin: "12px auto 0",
                  transform: state === "celebration" ? "scaleY(1.5)" : "scaleY(1)",
                }}
              />
            </div>
          </div>

          {/* Focus Timer */}
          <div
            style={{
              opacity: contentOpacity,
            }}
          >
            <div
              style={{
                fontSize: 48,
                fontWeight: 700,
                fontFamily: theme.fonts.mono,
                color: theme.colors.white,
                letterSpacing: 2,
                textAlign: "center",
              }}
            >
              {focusTime}
            </div>
            <div
              style={{
                fontSize: 14,
                fontWeight: 500,
                color: theme.colors.lightGray,
                textTransform: "uppercase",
                letterSpacing: 1,
                textAlign: "center",
                marginTop: 4,
              }}
            >
              {state === "focusing" ? "Deep Focus" : state === "celebration" ? "Session Complete!" : "Focus Time"}
            </div>
          </div>

          {/* Message Bubble */}
          <div
            style={{
              background: theme.colors.gray + "40",
              borderRadius: 20,
              padding: "16px 24px",
              maxWidth: "100%",
              opacity: contentOpacity,
            }}
          >
            <div
              style={{
                fontSize: 16,
                fontWeight: 500,
                color: theme.colors.white,
                textAlign: "center",
                fontFamily: theme.fonts.body,
                lineHeight: 1.5,
              }}
            >
              {message}
            </div>
          </div>

          {/* Action Button */}
          <div
            style={{
              background: state === "focusing"
                ? `linear-gradient(135deg, ${theme.colors.error}, ${theme.colors.primary})`
                : `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.primaryLight})`,
              borderRadius: 16,
              padding: "16px 48px",
              cursor: "pointer",
              opacity: contentOpacity,
              boxShadow: `0 8px 24px ${theme.colors.primary}40`,
            }}
          >
            <div
              style={{
                fontSize: 16,
                fontWeight: 600,
                color: theme.colors.white,
                textTransform: "uppercase",
                letterSpacing: 1,
              }}
            >
              {state === "focusing" ? "End Session" : state === "idle" ? "Start Focus" : "Continue"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
