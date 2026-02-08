import React from "react";
import {
  useCurrentFrame,
  useVideoConfig,
  spring,
  interpolate,
  Sequence,
} from "remotion";
import { theme } from "../../lib/theme";
import { CompanionInterface } from "../CompanionInterface";
import { AnimatedText } from "../AnimatedText";

const ChatBubble: React.FC<{
  text: string;
  isUser?: boolean;
  delay: number;
}> = ({ text, isUser = false, delay }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const progress = spring({
    frame: frame - delay,
    fps,
    config: { damping: 12, stiffness: 100 },
  });

  return (
    <div
      style={{
        display: "flex",
        justifyContent: isUser ? "flex-end" : "flex-start",
        opacity: progress,
        transform: `translateY(${interpolate(progress, [0, 1], [20, 0])}px) scale(${interpolate(progress, [0, 1], [0.95, 1])})`,
      }}
    >
      <div
        style={{
          maxWidth: 280,
          padding: "14px 20px",
          borderRadius: isUser ? "20px 20px 4px 20px" : "20px 20px 20px 4px",
          background: isUser
            ? `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.primaryLight})`
            : theme.colors.darkGray,
          border: isUser ? "none" : `1px solid ${theme.colors.gray}30`,
        }}
      >
        <span
          style={{
            fontSize: 15,
            color: theme.colors.white,
            fontFamily: theme.fonts.body,
            lineHeight: 1.5,
          }}
        >
          {text}
        </span>
      </div>
    </div>
  );
};

const FeatureHighlight: React.FC<{
  icon: string;
  text: string;
  delay: number;
}> = ({ icon, text, delay }) => {
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
        alignItems: "center",
        gap: 12,
        opacity: progress,
        transform: `translateX(${interpolate(progress, [0, 1], [-20, 0])}px)`,
      }}
    >
      <div
        style={{
          width: 36,
          height: 36,
          borderRadius: 10,
          background: `${theme.colors.secondary}20`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 18,
        }}
      >
        {icon}
      </div>
      <span
        style={{
          fontSize: 16,
          color: theme.colors.lightGray,
          fontFamily: theme.fonts.body,
        }}
      >
        {text}
      </span>
    </div>
  );
};

export const CompanionRevealScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Dynamic companion state
  let companionState: "idle" | "focusing" | "intervention" = "idle";
  let focusTime = "00:00";
  let companionMessage = "Hey! Ready to focus together?";

  if (frame > 120) {
    companionState = "focusing";
    const mins = Math.floor((frame - 120) / 180);
    const secs = Math.floor(((frame - 120) % 180) / 3);
    focusTime = `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    companionMessage = "You're in the zone! 🔥";
  }

  if (frame > 500) {
    companionState = "intervention";
    companionMessage = "Quick stretch? Your focus has been amazing!";
  }

  // Chat conversation
  const chatMessages = [
    { text: "I keep getting distracted by my phone", isUser: true, delay: 180 },
    { text: "Let's work on that together. I'll help you notice when your attention starts to drift.", isUser: false, delay: 240 },
    { text: "You'll get a gentle nudge before you fully lose focus.", isUser: false, delay: 320 },
  ];

  const features = [
    { icon: "🤝", text: "Feels like a friend, not a tracker", delay: 450 },
    { icon: "🎯", text: "Personalized to your patterns", delay: 490 },
    { icon: "💚", text: "Supportive, not judgmental", delay: 530 },
  ];

  // Glow animation
  const glowIntensity = 0.15 + Math.sin(frame * 0.03) * 0.05;

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
      {/* Warm glow behind companion */}
      <div
        style={{
          position: "absolute",
          right: "25%",
          top: "50%",
          transform: "translate(50%, -50%)",
          width: 600,
          height: 600,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${theme.colors.secondary}${Math.round(glowIntensity * 255).toString(16).padStart(2, '0')}, transparent 60%)`,
          filter: "blur(60px)",
        }}
      />

      {/* Left side - Title and chat */}
      <div
        style={{
          flex: 1,
          padding: 80,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
        }}
      >
        <Sequence from={0} durationInFrames={900}>
          <AnimatedText variant="heading" animation="words" delay={0}>
            Meet Your Focus Companion
          </AnimatedText>
        </Sequence>

        <Sequence from={40} durationInFrames={860}>
          <div style={{ marginTop: 16 }}>
            <AnimatedText
              variant="body"
              animation="fade"
              delay={40}
              color={theme.colors.lightGray}
            >
              An AI that actually understands you
            </AnimatedText>
          </div>
        </Sequence>

        {/* Chat conversation */}
        <div
          style={{
            marginTop: 48,
            display: "flex",
            flexDirection: "column",
            gap: 16,
            maxWidth: 400,
          }}
        >
          {chatMessages.map((msg, i) => (
            <Sequence key={i} from={msg.delay} durationInFrames={900 - msg.delay}>
              <ChatBubble text={msg.text} isUser={msg.isUser} delay={msg.delay} />
            </Sequence>
          ))}
        </div>

        {/* Features */}
        <div
          style={{
            marginTop: 48,
            display: "flex",
            flexDirection: "column",
            gap: 16,
          }}
        >
          {features.map((f, i) => (
            <Sequence key={i} from={f.delay} durationInFrames={900 - f.delay}>
              <FeatureHighlight icon={f.icon} text={f.text} delay={f.delay} />
            </Sequence>
          ))}
        </div>
      </div>

      {/* Right side - Companion Interface */}
      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Sequence from={60} durationInFrames={840}>
          <CompanionInterface
            delay={60}
            state={companionState}
            focusTime={focusTime}
            message={companionMessage}
          />
        </Sequence>
      </div>
    </div>
  );
};
