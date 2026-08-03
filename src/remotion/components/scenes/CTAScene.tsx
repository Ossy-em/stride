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

export const CTAScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const ctaProgress = spring({
    frame: frame - 60,
    fps,
    config: { damping: 12, stiffness: 60 },
  });

  const ctaPulse = 1 + Math.sin(frame * 0.08) * 0.02;
  const bgAngle = interpolate(frame, [0, 300], [135, 180]);

  const floatingElements = [
    { emoji: "🎯", x: 200, y: 200 },
    { emoji: "✨", x: 1700, y: 300 },
    { emoji: "🧠", x: 300, y: 800 },
    { emoji: "💪", x: 1600, y: 700 },
  ];

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        background: `linear-gradient(${bgAngle}deg, ${theme.colors.dark} 0%, ${theme.colors.darkGray} 100%)`,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Gradient orb */}
      <div
        style={{
          position: "absolute",
          width: 600,
          height: 600,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${theme.colors.primary}20, transparent 60%)`,
          filter: "blur(80px)",
        }}
      />

      {/* Floating emojis */}
      {floatingElements.map((el, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: el.x,
            top: el.y + Math.sin(frame * 0.03 + i) * 20,
            fontSize: 32,
            opacity: 0.4,
          }}
        >
          {el.emoji}
        </div>
      ))}

      {/* Logo */}
      <Sequence from={0} durationInFrames={300}>
        <StrideLogo size="lg" delay={0} showTagline={false} />
      </Sequence>

      {/* CTA text */}
      <Sequence from={30} durationInFrames={270}>
        <div style={{ marginTop: 48, textAlign: "center" }}>
          <AnimatedText variant="subheading" animation="fade" delay={30} align="center">
            Start your first focus session
          </AnimatedText>
        </div>
      </Sequence>

      {/* CTA Button */}
      <Sequence from={60} durationInFrames={240}>
        <div
          style={{
            marginTop: 40,
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
              Try Stride Free
            </span>
          </div>
        </div>
      </Sequence>

      {/* URL */}
      <Sequence from={90} durationInFrames={210}>
        <div style={{ marginTop: 24 }}>
          <AnimatedText
            variant="body"
            animation="fade"
            delay={90}
            color={theme.colors.lightGray}
            align="center"
          >
            stride.app
          </AnimatedText>
        </div>
      </Sequence>
    </div>
  );
};
