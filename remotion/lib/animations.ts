import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";

// Fade in animation
export const useFadeIn = (delay = 0, duration = 20) => {
  const frame = useCurrentFrame();
  return interpolate(frame - delay, [0, duration], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
};

// Fade out animation
export const useFadeOut = (startFrame: number, duration = 20) => {
  const frame = useCurrentFrame();
  return interpolate(frame - startFrame, [0, duration], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
};

// Slide in from direction
export const useSlideIn = (
  direction: "left" | "right" | "up" | "down" = "up",
  delay = 0,
  distance = 100
) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const progress = spring({
    frame: frame - delay,
    fps,
    config: {
      damping: 20,
      stiffness: 100,
      mass: 0.5,
    },
  });

  const translations = {
    left: { x: interpolate(progress, [0, 1], [-distance, 0]), y: 0 },
    right: { x: interpolate(progress, [0, 1], [distance, 0]), y: 0 },
    up: { x: 0, y: interpolate(progress, [0, 1], [distance, 0]) },
    down: { x: 0, y: interpolate(progress, [0, 1], [-distance, 0]) },
  };

  return {
    transform: `translate(${translations[direction].x}px, ${translations[direction].y}px)`,
    opacity: progress,
  };
};

// Scale in animation
export const useScaleIn = (delay = 0) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const progress = spring({
    frame: frame - delay,
    fps,
    config: {
      damping: 15,
      stiffness: 120,
      mass: 0.8,
    },
  });

  return {
    transform: `scale(${interpolate(progress, [0, 1], [0.8, 1])})`,
    opacity: progress,
  };
};

// Typewriter effect - returns how many characters to show
export const useTypewriter = (
  text: string,
  delay = 0,
  charsPerFrame = 0.5
) => {
  const frame = useCurrentFrame();
  const effectiveFrame = Math.max(0, frame - delay);
  const charsToShow = Math.floor(effectiveFrame * charsPerFrame);
  return text.slice(0, Math.min(charsToShow, text.length));
};

// Counter animation - counts from start to end
export const useCounter = (
  start: number,
  end: number,
  delay = 0,
  duration = 30
) => {
  const frame = useCurrentFrame();
  const progress = interpolate(frame - delay, [0, duration], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return Math.round(interpolate(progress, [0, 1], [start, end]));
};

// Pulse animation for emphasis
export const usePulse = (delay = 0, intensity = 0.1) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  if (frame < delay) return 1;

  const scale =
    1 + Math.sin((frame - delay) * 0.2) * intensity * Math.exp(-(frame - delay) * 0.05);

  return scale;
};
