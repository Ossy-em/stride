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

const SuccessMetric: React.FC<{
  before: string;
  after: string;
  label: string;
  delay: number;
}> = ({ before, after, label, delay }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const progress = spring({
    frame: frame - delay,
    fps,
    config: { damping: 15, stiffness: 80 },
  });

  const transformProgress = spring({
    frame: frame - delay - 30,
    fps,
    config: { damping: 12, stiffness: 60 },
  });

  return (
    <div
      style={{
        opacity: progress,
        transform: `translateY(${interpolate(progress, [0, 1], [30, 0])}px)`,
      }}
    >
      <div
        style={{
          background: `${theme.colors.darkGray}90`,
          borderRadius: 20,
          padding: 28,
          border: `1px solid ${theme.colors.success}20`,
          textAlign: "center",
          minWidth: 180,
        }}
      >
        {/* Before/After values */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 20 }}>
          <div
            style={{
              fontSize: 28,
              fontWeight: 600,
              color: theme.colors.lightGray,
              textDecoration: "line-through",
              opacity: 0.5,
            }}
          >
            {before}
          </div>
          <div
            style={{
              opacity: transformProgress,
              transform: `scale(${transformProgress})`,
            }}
          >
            <span style={{ fontSize: 24, color: theme.colors.success }}>→</span>
          </div>
          <div
            style={{
              fontSize: 36,
              fontWeight: 700,
              color: theme.colors.success,
              opacity: transformProgress,
            }}
          >
            {after}
          </div>
        </div>

        <div
          style={{
            fontSize: 14,
            color: theme.colors.lightGray,
            marginTop: 12,
          }}
        >
          {label}
        </div>
      </div>
    </div>
  );
};

const Testimonial: React.FC<{
  quote: string;
  name: string;
  role: string;
  delay: number;
}> = ({ quote, name, role, delay }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const progress = spring({
    frame: frame - delay,
    fps,
    config: { damping: 15, stiffness: 60 },
  });

  return (
    <div
      style={{
        opacity: progress,
        transform: `translateY(${interpolate(progress, [0, 1], [30, 0])}px)`,
      }}
    >
      <div
        style={{
          background: `linear-gradient(145deg, ${theme.colors.darkGray}, ${theme.colors.dark})`,
          borderRadius: 24,
          padding: 32,
          border: `1px solid ${theme.colors.gray}30`,
          maxWidth: 500,
        }}
      >
        {/* Quote marks */}
        <div
          style={{
            fontSize: 48,
            color: theme.colors.primary,
            opacity: 0.3,
            lineHeight: 1,
            marginBottom: -20,
          }}
        >
          "
        </div>

        <div
          style={{
            fontSize: 18,
            color: theme.colors.white,
            fontFamily: theme.fonts.body,
            lineHeight: 1.6,
            fontStyle: "italic",
          }}
        >
          {quote}
        </div>

        <div style={{ marginTop: 24, display: "flex", alignItems: "center", gap: 12 }}>
          {/* Avatar placeholder */}
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: "50%",
              background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.secondary})`,
            }}
          />
          <div>
            <div
              style={{
                fontSize: 15,
                fontWeight: 600,
                color: theme.colors.white,
              }}
            >
              {name}
            </div>
            <div
              style={{
                fontSize: 13,
                color: theme.colors.lightGray,
              }}
            >
              {role}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const TransformationScene: React.FC = () => {
  const frame = useCurrentFrame();

  // Celebration particles
  const particles = Array.from({ length: 20 }, (_, i) => {
    const angle = (i / 20) * Math.PI * 2;
    const distance = 200 + Math.sin(frame * 0.05 + i) * 50;
    return {
      x: 960 + Math.cos(angle + frame * 0.01) * distance,
      y: 540 + Math.sin(angle + frame * 0.01) * distance,
      size: 4 + (i % 3) * 2,
      color: i % 2 === 0 ? theme.colors.success : theme.colors.secondary,
      opacity: 0.3 + Math.sin(frame * 0.1 + i) * 0.2,
    };
  });

  const metrics = [
    { before: "15min", after: "45min", label: "Average Focus Session", delay: 60 },
    { before: "8x", after: "2x", label: "Daily Distractions", delay: 90 },
    { before: "😫", after: "😊", label: "End of Day Feeling", delay: 120 },
  ];

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
      {/* Success glow */}
      <div
        style={{
          position: "absolute",
          width: 800,
          height: 800,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${theme.colors.success}15, transparent 60%)`,
          filter: "blur(80px)",
        }}
      />

      {/* Floating particles */}
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
            background: p.color,
            opacity: p.opacity,
          }}
        />
      ))}

      {/* Title */}
      <Sequence from={0} durationInFrames={600}>
        <AnimatedText variant="heading" animation="words" delay={0} align="center">
          The Transformation
        </AnimatedText>
      </Sequence>

      {/* Metrics row */}
      <div
        style={{
          display: "flex",
          gap: 32,
          marginTop: 60,
          marginBottom: 60,
        }}
      >
        {metrics.map((m, i) => (
          <Sequence key={i} from={m.delay} durationInFrames={600 - m.delay}>
            <SuccessMetric
              before={m.before}
              after={m.after}
              label={m.label}
              delay={m.delay}
            />
          </Sequence>
        ))}
      </div>

      {/* Testimonial */}
      <Sequence from={200} durationInFrames={400}>
        <Testimonial
          quote="I finally feel in control of my focus. Stride doesn't nag me - it actually helps before I even realize I'm drifting."
          name="Future User"
          role="Software Developer"
          delay={200}
        />
      </Sequence>
    </div>
  );
};
