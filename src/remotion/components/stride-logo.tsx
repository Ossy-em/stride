import React from "react";
import { useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";
import { theme } from "../lib/theme";

interface StrideLogoProps {
  delay?: number;
  size?: "sm" | "md" | "lg";
  showTagline?: boolean;
}

export const StrideLogo: React.FC<StrideLogoProps> = ({
  delay = 0,
  size = "md",
  showTagline = false,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const sizes = {
    sm: { logo: 40, text: 24 },
    md: { logo: 64, text: 40 },
    lg: { logo: 120, text: 72 },
  };

  const scaleProgress = spring({
    frame: frame - delay,
    fps,
    config: { damping: 12, stiffness: 100, mass: 0.8 },
  });

  const textProgress = spring({
    frame: frame - delay - 10,
    fps,
    config: { damping: 20, stiffness: 80 },
  });

  const taglineProgress = spring({
    frame: frame - delay - 25,
    fps,
    config: { damping: 20, stiffness: 60 },
  });

  // Animated gradient rotation
  const gradientRotation = interpolate(frame, [0, 300], [0, 360], {
    extrapolateRight: "extend",
  });

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 16,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: size === "lg" ? 24 : 16,
        }}
      >
        {/* Logo Icon - Abstract "S" shape representing focus flow */}
        <div
          style={{
            width: sizes[size].logo,
            height: sizes[size].logo,
            borderRadius: sizes[size].logo * 0.25,
            background: `linear-gradient(${gradientRotation}deg, ${theme.colors.primary}, ${theme.colors.secondary})`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transform: `scale(${scaleProgress})`,
            boxShadow: `0 ${sizes[size].logo * 0.15}px ${sizes[size].logo * 0.4}px rgba(255, 107, 53, 0.3)`,
          }}
        >
          {/* Inner "S" curve */}
          <svg
            width={sizes[size].logo * 0.5}
            height={sizes[size].logo * 0.5}
            viewBox="0 0 24 24"
            fill="none"
          >
            <path
              d="M12 2C7 2 3 5 3 9c0 3 2 5 5 5h8c2 0 4 1.5 4 4s-2 4-5 4H4"
              stroke="white"
              strokeWidth="2.5"
              strokeLinecap="round"
              fill="none"
              style={{
                strokeDasharray: 60,
                strokeDashoffset: interpolate(scaleProgress, [0, 1], [60, 0]),
              }}
            />
          </svg>
        </div>

        {/* Logo Text */}
        <div
          style={{
            fontSize: sizes[size].text,
            fontWeight: 700,
            fontFamily: theme.fonts.heading,
            color: theme.colors.white,
            letterSpacing: -1,
            opacity: textProgress,
            transform: `translateX(${interpolate(textProgress, [0, 1], [-20, 0])}px)`,
          }}
        >
          Stride
        </div>
      </div>

      {/* Tagline */}
      {showTagline && (
        <div
          style={{
            fontSize: sizes[size].text * 0.4,
            fontWeight: 500,
            fontFamily: theme.fonts.body,
            color: theme.colors.lightGray,
            letterSpacing: 2,
            textTransform: "uppercase",
            opacity: taglineProgress,
            transform: `translateY(${interpolate(taglineProgress, [0, 1], [10, 0])}px)`,
          }}
        >
          Your AI Focus Companion
        </div>
      )}
    </div>
  );
};
