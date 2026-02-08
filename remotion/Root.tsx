import React from "react";
import { Composition } from "remotion";
import { HackathonDemo } from "./compositions/HackathonDemo";
import { UserAcquisitionVideo } from "./compositions/UserAcquisitionVideo";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      {/* Hackathon Demo Video - 2-3 minutes for judges */}
      <Composition
        id="HackathonDemo"
        component={HackathonDemo}
        durationInFrames={30 * 150} // 2.5 minutes at 30fps
        fps={30}
        width={1920}
        height={1080}
      />

      {/* User Acquisition Video - 60-90 seconds for marketing */}
      <Composition
        id="UserAcquisitionVideo"
        component={UserAcquisitionVideo}
        durationInFrames={30 * 75} // 75 seconds at 30fps
        fps={30}
        width={1920}
        height={1080}
      />
    </>
  );
};
