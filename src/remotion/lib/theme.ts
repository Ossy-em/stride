// Stride brand colors and design tokens
export const theme = {
  colors: {
    // Primary - warm, supportive feel
    primary: "#FF6B35",
    primaryLight: "#FF8F5E",
    primaryDark: "#E5512A",

    // Secondary - calm focus
    secondary: "#2EC4B6",
    secondaryLight: "#4DD8CC",
    secondaryDark: "#1FA99C",

    // Neutrals
    dark: "#1A1A2E",
    darkGray: "#2D2D44",
    gray: "#4A4A68",
    lightGray: "#8E8EA0",
    light: "#F5F5F7",
    white: "#FFFFFF",

    // Semantic
    success: "#4ADE80",
    warning: "#FBBF24",
    error: "#F87171",

    // Gradients
    gradientPrimary: "linear-gradient(135deg, #FF6B35 0%, #FF8F5E 100%)",
    gradientDark: "linear-gradient(180deg, #1A1A2E 0%, #2D2D44 100%)",
  },

  fonts: {
    heading: "Inter, SF Pro Display, -apple-system, sans-serif",
    body: "Inter, SF Pro Text, -apple-system, sans-serif",
    mono: "SF Mono, Fira Code, monospace",
  },

  fontSizes: {
    xs: 14,
    sm: 16,
    md: 20,
    lg: 28,
    xl: 40,
    "2xl": 56,
    "3xl": 72,
    "4xl": 96,
  },

  spacing: {
    xs: 8,
    sm: 16,
    md: 24,
    lg: 40,
    xl: 64,
    "2xl": 96,
  },
};

// Animation easing functions
export const easings = {
  easeOut: "cubic-bezier(0.16, 1, 0.3, 1)",
  easeInOut: "cubic-bezier(0.65, 0, 0.35, 1)",
  spring: "cubic-bezier(0.34, 1.56, 0.64, 1)",
};

// Common durations in frames (at 30fps)
export const durations = {
  fast: 10, // ~0.33s
  normal: 20, // ~0.67s
  slow: 30, // 1s
  verySlow: 45, // 1.5s
};
