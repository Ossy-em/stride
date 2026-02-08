import React from "react";
import { useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";
import { theme } from "../lib/theme";

interface AnimatedTextProps {
  children: string;
  delay?: number;
  variant?: "heading" | "subheading" | "body" | "caption" | "stat";
  color?: string;
  align?: "left" | "center" | "right";
  animation?: "fade" | "slide" | "typewriter" | "words";
}

export const AnimatedText: React.FC<AnimatedTextProps> = ({
  children,
  delay = 0,
  variant = "body",
  color = theme.colors.white,
  align = "left",
  animation = "fade",
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const variantStyles: Record<string, React.CSSProperties> = {
    heading: {
      fontSize: theme.fontSizes["3xl"],
      fontWeight: 700,
      lineHeight: 1.1,
      letterSpacing: -2,
    },
    subheading: {
      fontSize: theme.fontSizes.xl,
      fontWeight: 600,
      lineHeight: 1.3,
      letterSpacing: -0.5,
    },
    body: {
      fontSize: theme.fontSizes.lg,
      fontWeight: 400,
      lineHeight: 1.6,
    },
    caption: {
      fontSize: theme.fontSizes.md,
      fontWeight: 500,
      lineHeight: 1.5,
      opacity: 0.8,
    },
    stat: {
      fontSize: theme.fontSizes["4xl"],
      fontWeight: 800,
      lineHeight: 1,
      letterSpacing: -3,
    },
  };

  // Simple fade animation
  if (animation === "fade") {
    const opacity = spring({
      frame: frame - delay,
      fps,
      config: { damping: 20, stiffness: 80 },
    });

    const y = interpolate(opacity, [0, 1], [30, 0]);

    return (
      <div
        style={{
          ...variantStyles[variant],
          color,
          textAlign: align,
          fontFamily: theme.fonts.heading,
          opacity,
          transform: `translateY(${y}px)`,
        }}
      >
        {children}
      </div>
    );
  }

  // Word by word animation
  if (animation === "words") {
    const words = children.split(" ");

    return (
      <div
        style={{
          ...variantStyles[variant],
          color,
          textAlign: align,
          fontFamily: theme.fonts.heading,
          display: "flex",
          flexWrap: "wrap",
          gap: "0.3em",
          justifyContent: align === "center" ? "center" : "flex-start",
        }}
      >
        {words.map((word, i) => {
          const wordDelay = delay + i * 3;
          const opacity = spring({
            frame: frame - wordDelay,
            fps,
            config: { damping: 20, stiffness: 100 },
          });
          const y = interpolate(opacity, [0, 1], [20, 0]);

          return (
            <span
              key={i}
              style={{
                opacity,
                transform: `translateY(${y}px)`,
                display: "inline-block",
              }}
            >
              {word}
            </span>
          );
        })}
      </div>
    );
  }

  // Typewriter animation
  if (animation === "typewriter") {
    const charsToShow = Math.floor((frame - delay) * 0.8);
    const displayText = children.slice(0, Math.max(0, charsToShow));

    return (
      <div
        style={{
          ...variantStyles[variant],
          color,
          textAlign: align,
          fontFamily: theme.fonts.heading,
        }}
      >
        {displayText}
        {displayText.length < children.length && (
          <span
            style={{
              opacity: Math.sin(frame * 0.3) > 0 ? 1 : 0,
            }}
          >
            |
          </span>
        )}
      </div>
    );
  }

  // Default slide animation
  const progress = spring({
    frame: frame - delay,
    fps,
    config: { damping: 15, stiffness: 80 },
  });

  return (
    <div
      style={{
        ...variantStyles[variant],
        color,
        textAlign: align,
        fontFamily: theme.fonts.heading,
        opacity: progress,
        transform: `translateX(${interpolate(progress, [0, 1], [-50, 0])}px)`,
      }}
    >
      {children}
    </div>
  );
};
