import React from "react";
import {
  useCurrentFrame,
  useVideoConfig,
  spring,
  interpolate,
  Sequence,
} from "remotion";
import { theme } from "../../lib/theme";
import { StrideLogo } from "../stride-logo";
import { AnimatedText } from "../animated-text";

export const IntroScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Background animation
  const bgGradientAngle = interpolate(frame, [0, 450], [135, 180]);

  // Particles
  const particles = Array.from({ length: 20 }, (_, i) => ({
    x: (i * 137) % 1920,
    y: ((i * 97) % 1080) + frame * 0.5,
    size: 2 + (i % 3),
    opacity: 0.2 + (i % 5) * 0.1,
  }));

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        background: `linear-gradient(${bgGradientAngle}deg, ${theme.colors.dark} 0%, ${theme.colors.darkGray} 100%)`,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Animated particles */}
      {particles.map((p, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: p.x,
            top: p.y % 1200 - 60,
            width: p.size,
            height: p.size,
            borderRadius: "50%",
            background: theme.colors.primary,
            opacity: p.opacity,
          }}
        />
      ))}

      {/* Glow behind logo */}
      <div
        style={{
          position: "absolute",
          width: 600,
          height: 600,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${theme.colors.primary}20 0%, transparent 70%)`,
          filter: "blur(60px)",
          opacity: spring({
            frame: frame - 10,
            fps,
            config: { damping: 20, stiffness: 40 },
          }),
        }}
      />

      {/* Main logo */}
      <Sequence from={0} durationInFrames={450}>
        <StrideLogo size="lg" delay={15} showTagline={true} />
      </Sequence>

      {/* Subtitle */}
      <Sequence from={60} durationInFrames={390}>
        <div style={{ marginTop: 60, textAlign: "center" }}>
          <AnimatedText
            variant="body"
            animation="fade"
            delay={60}
            color={theme.colors.lightGray}
            align="center"
          >
            Predict focus loss before it happens
          </AnimatedText>
        </div>
      </Sequence>

      {/* Feature pills */}
      <Sequence from={100} durationInFrames={350}>
        <div
          style={{
            display: "flex",
            gap: 16,
            marginTop: 48,
          }}
        >
          {["AI-Powered", "Proactive", "Personal"].map((text, i) => {
            const pillProgress = spring({
              frame: frame - 100 - i * 10,
              fps,
              config: { damping: 15, stiffness: 100 },
            });

            return (
              <div
                key={text}
                style={{
                  background: `${theme.colors.primary}20`,
                  border: `1px solid ${theme.colors.primary}40`,
                  borderRadius: 100,
                  padding: "12px 28px",
                  opacity: pillProgress,
                  transform: `translateY(${interpolate(pillProgress, [0, 1], [20, 0])}px)`,
                }}
              >
                <span
                  style={{
                    fontSize: 16,
                    fontWeight: 600,
                    color: theme.colors.primary,
                    fontFamily: theme.fonts.body,
                  }}
                >
                  {text}
                </span>
              </div>
            );
          })}
        </div>
      </Sequence>
    </div>
  );
};
