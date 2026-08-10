import React from "react";
import { Sequence, useCurrentFrame, interpolate } from "remotion";
import { theme } from "../lib/theme";
import { ProblemScene } from "../components/scenes/problem-scene";
import { IntroScene } from "../components/scenes/intro-scene";
import { HowItWorksScene } from "../components/scenes/how-it-works-scene";
import { TechStackScene } from "../components/scenes/tech-stack-scene";
import { ResultsScene } from "../components/scenes/results-scene";

// Transition component for smooth scene changes
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

export const HackathonDemo: React.FC = () => {
  // Scene timing (in frames at 30fps)
  // Total: 4500 frames = 2.5 minutes
  const scenes = {
    problem: { start: 0, duration: 600 },        // 0:00 - 0:20 (20s)
    intro: { start: 570, duration: 450 },        // 0:19 - 0:34 (15s)
    howItWorks: { start: 990, duration: 1800 },  // 0:33 - 1:33 (60s)
    techStack: { start: 2760, duration: 1200 },  // 1:32 - 2:12 (40s)
    results: { start: 3930, duration: 570 },     // 2:11 - 2:30 (19s)
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
      {/* Scene 1: The Problem */}
      <Sequence from={scenes.problem.start} durationInFrames={scenes.problem.duration}>
        <SceneTransition duration={scenes.problem.duration} fadeIn={0} fadeOut={30}>
          <ProblemScene />
        </SceneTransition>
      </Sequence>

      {/* Scene 2: Introducing Stride */}
      <Sequence from={scenes.intro.start} durationInFrames={scenes.intro.duration}>
        <SceneTransition duration={scenes.intro.duration}>
          <IntroScene />
        </SceneTransition>
      </Sequence>

      {/* Scene 3: How It Works */}
      <Sequence from={scenes.howItWorks.start} durationInFrames={scenes.howItWorks.duration}>
        <SceneTransition duration={scenes.howItWorks.duration}>
          <HowItWorksScene />
        </SceneTransition>
      </Sequence>

      {/* Scene 4: Tech Stack / Opik */}
      <Sequence from={scenes.techStack.start} durationInFrames={scenes.techStack.duration}>
        <SceneTransition duration={scenes.techStack.duration}>
          <TechStackScene />
        </SceneTransition>
      </Sequence>

      {/* Scene 5: Results & CTA */}
      <Sequence from={scenes.results.start} durationInFrames={scenes.results.duration}>
        <SceneTransition duration={scenes.results.duration} fadeOut={0}>
          <ResultsScene />
        </SceneTransition>
      </Sequence>
    </div>
  );
};