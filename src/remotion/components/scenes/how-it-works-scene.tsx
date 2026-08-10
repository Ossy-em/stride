import React from "react";
import {
  useCurrentFrame,
  useVideoConfig,
  spring,
  interpolate,
  Sequence,
} from "remotion";
import { theme } from "../../lib/theme";
import { CompanionInterface } from "../companion-interface";
import { AnimatedText } from "../animated-text";

const FocusTimeline: React.FC<{ delay: number }> = ({ delay }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const progress = spring({
    frame: frame - delay,
    fps,
    config: { damping: 20, stiffness: 60 },
  });

  // Simulated focus data
  const focusData = [
    { time: "9:00", level: 0.9 },
    { time: "9:15", level: 0.85 },
    { time: "9:30", level: 0.7 },
    { time: "9:45", level: 0.55 },
    { time: "10:00", level: 0.4, prediction: true },
    { time: "10:15", level: 0.25, intervention: true },
    { time: "10:30", level: 0.75, recovered: true },
  ];

  const chartWidth = 500;
  const chartHeight = 200;
  const barWidth = chartWidth / focusData.length - 10;

  return (
    <div
      style={{
        opacity: progress,
        transform: `translateY(${interpolate(progress, [0, 1], [30, 0])}px)`,
      }}
    >
      <div
        style={{
          background: `${theme.colors.darkGray}cc`,
          borderRadius: 20,
          padding: 24,
          border: `1px solid ${theme.colors.gray}30`,
        }}
      >
        <div
          style={{
            fontSize: 14,
            color: theme.colors.lightGray,
            marginBottom: 16,
            fontFamily: theme.fonts.body,
            textTransform: "uppercase",
            letterSpacing: 1,
          }}
        >
          Focus Level Over Time
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            gap: 10,
            height: chartHeight,
          }}
        >
          {focusData.map((d, i) => {
            const barProgress = spring({
              frame: frame - delay - i * 8,
              fps,
              config: { damping: 12, stiffness: 100 },
            });

            const barHeight = d.level * chartHeight * barProgress;

            let barColor = theme.colors.secondary;
            if (d.prediction) barColor = theme.colors.warning;
            if (d.intervention) barColor = theme.colors.primary;
            if (d.recovered) barColor = theme.colors.success;

            return (
              <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                <div
                  style={{
                    width: barWidth,
                    height: barHeight,
                    background: `linear-gradient(180deg, ${barColor}, ${barColor}80)`,
                    borderRadius: 8,
                    position: "relative",
                  }}
                >
                  {d.intervention && (
                    <div
                      style={{
                        position: "absolute",
                        top: -30,
                        left: "50%",
                        transform: "translateX(-50%)",
                        fontSize: 20,
                      }}
                    >
                      ⚡
                    </div>
                  )}
                </div>
                <div
                  style={{
                    fontSize: 11,
                    color: theme.colors.lightGray,
                    marginTop: 8,
                  }}
                >
                  {d.time}
                </div>
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div
          style={{
            display: "flex",
            gap: 24,
            marginTop: 20,
            justifyContent: "center",
          }}
        >
          {[
            { color: theme.colors.secondary, label: "Focus" },
            { color: theme.colors.warning, label: "Predicted Dip" },
            { color: theme.colors.primary, label: "Intervention" },
            { color: theme.colors.success, label: "Recovered" },
          ].map(({ color, label }) => (
            <div key={label} style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: 3,
                  background: color,
                }}
              />
              <span style={{ fontSize: 12, color: theme.colors.lightGray }}>
                {label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const FeaturePoint: React.FC<{
  icon: string;
  title: string;
  description: string;
  delay: number;
}> = ({ icon, title, description, delay }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const progress = spring({
    frame: frame - delay,
    fps,
    config: { damping: 15, stiffness: 80 },
  });

  return (
    <div
      style={{
        display: "flex",
        gap: 16,
        opacity: progress,
        transform: `translateX(${interpolate(progress, [0, 1], [-30, 0])}px)`,
      }}
    >
      <div
        style={{
          width: 48,
          height: 48,
          borderRadius: 12,
          background: `${theme.colors.primary}20`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 24,
          flexShrink: 0,
        }}
      >
        {icon}
      </div>
      <div>
        <div
          style={{
            fontSize: 18,
            fontWeight: 600,
            color: theme.colors.white,
            marginBottom: 4,
          }}
        >
          {title}
        </div>
        <div
          style={{
            fontSize: 14,
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

export const HowItWorksScene: React.FC = () => {
  const frame = useCurrentFrame();

  // Dynamic focus time based on frame
  const focusMinutes = Math.floor(interpolate(frame, [60, 1200], [0, 45], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  }));
  const focusSeconds = Math.floor((frame * 2) % 60);
  const focusTime = `${focusMinutes.toString().padStart(2, "0")}:${focusSeconds.toString().padStart(2, "0")}`;

  // Companion state changes over time
  let companionState: "idle" | "focusing" | "intervention" | "celebration" = "idle";
  let companionMessage = "Ready to start your focus session?";

  if (frame > 60 && frame < 800) {
    companionState = "focusing";
    companionMessage = "Great flow! Keep going 💪";
  }
  if (frame >= 800 && frame < 1100) {
    companionState = "intervention";
    companionMessage = "I notice you might be drifting. Quick stretch?";
  }
  if (frame >= 1100) {
    companionState = "celebration";
    companionMessage = "Amazing session! 45 min of deep work 🎉";
  }

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        background: theme.colors.dark,
        display: "flex",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Background glow */}
      <div
        style={{
          position: "absolute",
          right: -200,
          top: "50%",
          transform: "translateY(-50%)",
          width: 800,
          height: 800,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${theme.colors.secondary}15 0%, transparent 60%)`,
          filter: "blur(40px)",
        }}
      />

      {/* Left side - Features */}
      <div
        style={{
          flex: 1,
          padding: 80,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
        }}
      >
        <Sequence from={0} durationInFrames={1800}>
          <AnimatedText variant="heading" animation="words" delay={0}>
            How Stride Works
          </AnimatedText>
        </Sequence>

        <div style={{ marginTop: 48, display: "flex", flexDirection: "column", gap: 32 }}>
          <Sequence from={30} durationInFrames={1770}>
            <FeaturePoint
              icon="🧠"
              title="Learns Your Patterns"
              description="AI analyzes your focus behaviors and identifies when you typically drift"
              delay={30}
            />
          </Sequence>

          <Sequence from={60} durationInFrames={1740}>
            <FeaturePoint
              icon="⚡"
              title="Predicts Focus Breaks"
              description="Detects early signs of distraction before you lose your flow"
              delay={60}
            />
          </Sequence>

          <Sequence from={90} durationInFrames={1710}>
            <FeaturePoint
              icon="💬"
              title="Intervenes Supportively"
              description="Gentle, personalized nudges that actually help you refocus"
              delay={90}
            />
          </Sequence>
        </div>

        {/* Timeline visualization */}
        <Sequence from={150} durationInFrames={1650}>
          <div style={{ marginTop: 48 }}>
            <FocusTimeline delay={150} />
          </div>
        </Sequence>
      </div>

      {/* Right side - Companion Interface */}
      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 40,
        }}
      >
        <Sequence from={30} durationInFrames={1770}>
          <CompanionInterface
            delay={30}
            state={companionState}
            focusTime={focusTime}
            message={companionMessage}
          />
        </Sequence>
      </div>
    </div>
  );
};
