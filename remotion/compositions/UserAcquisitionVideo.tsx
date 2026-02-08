import React from "react";
import { Sequence, useCurrentFrame, interpolate } from "remotion";
import { theme } from "../lib/theme";
import { HookScene } from "../components/scenes/HookScene";
import { StruggleScene } from "../components/scenes/StruggleScene";
import { CompanionRevealScene } from "../components/scenes/CompanionRevealScene";
import { TransformationScene } from "../components/scenes/TransformationScene";
import { CTAScene } from "../components/scenes/CTAScene";

const SceneTransition: React.FC<{
  children: React.ReactNode;
  fadeIn?: number;
  fadeOut?: number;
  duration: number;
}> = ({ children, fadeIn = 15, fadeOut = 15, duration }) => {
  const frame = useCurrentFrame();

  // Ensure minimum values to avoid duplicate points in interpolate
  const safeFadeIn = Math.max(fadeIn, 1);
  const safeFadeOut = Math.max(fadeOut, 1);

  const opacity = interpolate(
    frame,
    [0, safeFadeIn, duration - safeFadeOut, duration],
    [0, 1, 1, 0],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }
  );

  return (
    <div
      style={{
        position: "absolute",
        width: "100%",
        height: "100%",
        opacity,
      }}
    >
      {children}
    </div>
  );
};

export const UserAcquisitionVideo: React.FC = () => {
  // Scene timing (in frames at 30fps)
  // Total: 2250 frames = 75 seconds
  const scenes = {
    hook: { start: 0, duration: 300 },           // 0:00 - 0:10 (10s)
    struggle: { start: 270, duration: 600 },     // 0:09 - 0:29 (20s)
    companion: { start: 840, duration: 900 },    // 0:28 - 0:58 (30s)
    transformation: { start: 1710, duration: 600 }, // 0:57 - 1:17 (20s)
    cta: { start: 1950, duration: 300 },         // 1:05 - 1:15 (10s)
  };

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        background: theme.colors.dark,
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Scene 1: Hook */}
      <Sequence from={scenes.hook.start} durationInFrames={scenes.hook.duration}>
        <SceneTransition duration={scenes.hook.duration} fadeIn={0}>
          <HookScene />
        </SceneTransition>
      </Sequence>

      {/* Scene 2: The Struggle */}
      <Sequence from={scenes.struggle.start} durationInFrames={scenes.struggle.duration}>
        <SceneTransition duration={scenes.struggle.duration}>
          <StruggleScene />
        </SceneTransition>
      </Sequence>

      {/* Scene 3: Companion Reveal */}
      <Sequence from={scenes.companion.start} durationInFrames={scenes.companion.duration}>
        <SceneTransition duration={scenes.companion.duration}>
          <CompanionRevealScene />
        </SceneTransition>
      </Sequence>

      {/* Scene 4: Transformation */}
      <Sequence from={scenes.transformation.start} durationInFrames={scenes.transformation.duration}>
        <SceneTransition duration={scenes.transformation.duration}>
          <TransformationScene />
        </SceneTransition>
      </Sequence>

      {/* Scene 5: CTA */}
      <Sequence from={scenes.cta.start} durationInFrames={scenes.cta.duration}>
        <SceneTransition duration={scenes.cta.duration} fadeOut={0}>
          <CTAScene />
        </SceneTransition>
      </Sequence>
    </div>
  );
};