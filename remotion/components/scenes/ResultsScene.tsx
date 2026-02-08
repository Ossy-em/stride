import React from "react";
import {
  useCurrentFrame,
  useVideoConfig,
  spring,
  interpolate,
  Sequence,
} from "remotion";
import { theme } from "../../lib/theme";
import { StrideLogo } from "../StrideLogo";
import { AnimatedText } from "../AnimatedText";

const AnimatedStat: React.FC<{
  value: number;
  suffix: string;
  label: string;
  delay: number;
  color: string;
}> = ({ value, suffix, label, delay, color }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const progress = spring({
    frame: frame - delay,
    fps,
    config: { damping: 15, stiffness: 80 },
  });

  const countProgress = interpolate(frame - delay, [0, 45], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const displayValue = Math.round(value * countProgress);

  return (
    <div
      style={{
        opacity: progress,
        transform: `translateY(${interpolate(progress, [0, 1], [40, 0])}px) scale(${interpolate(progress, [0, 1], [0.9, 1])})`,
      }}
    >
      <div
        style={{
          background: `linear-gradient(145deg, ${theme.colors.darkGray}, ${theme.colors.dark})`,
          borderRadius: 24,
          padding: "40px 48px",
          border: `1px solid ${color}30`,
          boxShadow: `0 20px 40px rgba(0,0,0,0.3), 0 0 60px ${color}10`,
          textAlign: "center",
          minWidth: 200,
        }}
      >
        <div
          style={{
            fontSize: 72,
            fontWeight: 800,
            color: color,
            fontFamily: theme.fonts.heading,
            lineHeight: 1,
          }}
        >
          {displayValue}
          <span style={{ fontSize: 36 }}>{suffix}</span>
        </div>
        <div
          style={{
            fontSize: 16,
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

const SocialLink: React.FC<{
  icon: string;
  handle: string;
  delay: number;
}> = ({ icon, handle, delay }) => {
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
        display: "flex",
        alignItems: "center",
        gap: 12,
        opacity: progress,
        transform: `translateX(${interpolate(progress, [0, 1], [-20, 0])}px)`,
      }}
    >
      <div
        style={{
          width: 40,
          height: 40,
          borderRadius: 10,
          background: theme.colors.gray + "40",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 20,
        }}
      >
        {icon}
      </div>
      <span
        style={{
          fontSize: 18,
          color: theme.colors.lightGray,
          fontFamily: theme.fonts.body,
        }}
      >
        {handle}
      </span>
    </div>
  );
};

export const ResultsScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Animated background particles
  const particles = Array.from({ length: 30 }, (_, i) => {
    const baseX = (i * 73) % 1920;
    const baseY = (i * 127) % 1080;
    const speed = 0.3 + (i % 5) * 0.1;
    return {
      x: baseX + Math.sin(frame * 0.02 + i) * 30,
      y: (baseY + frame * speed) % 1200 - 60,
      size: 2 + (i % 4),
      opacity: 0.1 + (i % 5) * 0.05,
    };
  });

  const ctaProgress = spring({
    frame: frame - 180,
    fps,
    config: { damping: 12, stiffness: 60 },
  });

  const ctaPulse = 1 + Math.sin(frame * 0.1) * 0.03;

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
      {/* Particles */}
      {particles.map((p, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: p.x,
            top: p.y,
            width: p.size,
            height: p.size,
            borderRadius: "50%",
            background: i % 2 === 0 ? theme.colors.primary : theme.colors.secondary,
            opacity: p.opacity,
          }}
        />
      ))}

      {/* Radial glow */}
      <div
        style={{
          position: "absolute",
          width: 1000,
          height: 1000,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${theme.colors.primary}15 0%, transparent 60%)`,
          filter: "blur(80px)",
        }}
      />

      {/* Logo at top */}
      <Sequence from={0} durationInFrames={600}>
        <div style={{ marginBottom: 48 }}>
          <StrideLogo size="md" delay={0} />
        </div>
      </Sequence>

      {/* Stats row */}
      <div
        style={{
          display: "flex",
          gap: 40,
          marginBottom: 60,
        }}
      >
        <Sequence from={30} durationInFrames={570}>
          <AnimatedStat
            value={45}
            suffix="%"
            label="Longer Focus Sessions"
            delay={30}
            color={theme.colors.success}
          />
        </Sequence>

        <Sequence from={50} durationInFrames={550}>
          <AnimatedStat
            value={3}
            suffix="x"
            label="Fewer Distractions"
            delay={50}
            color={theme.colors.secondary}
          />
        </Sequence>

        <Sequence from={70} durationInFrames={530}>
          <AnimatedStat
            value={89}
            suffix="%"
            label="User Satisfaction"
            delay={70}
            color={theme.colors.primary}
          />
        </Sequence>
      </div>

      {/* CTA */}
      <Sequence from={120} durationInFrames={480}>
        <div
          style={{
            opacity: ctaProgress,
            transform: `scale(${ctaProgress * ctaPulse})`,
          }}
        >
          <div
            style={{
              background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.primaryLight})`,
              borderRadius: 20,
              padding: "24px 64px",
              boxShadow: `0 15px 40px ${theme.colors.primary}40`,
            }}
          >
            <span
              style={{
                fontSize: 24,
                fontWeight: 700,
                color: theme.colors.white,
                fontFamily: theme.fonts.heading,
              }}
            >
              Try Stride Today
            </span>
          </div>
        </div>
      </Sequence>

      {/* URL */}
      <Sequence from={150} durationInFrames={450}>
        <div style={{ marginTop: 32 }}>
          <AnimatedText
            variant="body"
            animation="fade"
            delay={150}
            color={theme.colors.lightGray}
            align="center"
          >
            stride.app
          </AnimatedText>
        </div>
      </Sequence>

      {/* Social links */}
      <Sequence from={180} durationInFrames={420}>
        <div
          style={{
            display: "flex",
            gap: 32,
            marginTop: 48,
          }}
        >
          <SocialLink icon="𝕏" handle="@ossy_dev" delay={180} />
          <SocialLink icon="🔗" handle="github.com/ossy" delay={200} />
        </div>
      </Sequence>

      {/* Hackathon badge */}
      <Sequence from={220} durationInFrames={380}>
        <div
          style={{
            position: "absolute",
            bottom: 40,
            right: 60,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 16,
              opacity: spring({
                frame: frame - 220,
                fps,
                config: { damping: 20, stiffness: 60 },
              }),
            }}
          >
            <div
              style={{
                background: theme.colors.secondary + "20",
                border: `1px solid ${theme.colors.secondary}40`,
                borderRadius: 12,
                padding: "12px 20px",
              }}
            >
              <span
                style={{
                  fontSize: 14,
                  fontWeight: 600,
                  color: theme.colors.secondary,
                }}
              >
                Encode Club AI Hackathon 2025
              </span>
            </div>
          </div>
        </div>
      </Sequence>
    </div>
  );
};
