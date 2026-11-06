"use client";

import { Canvas } from "@react-three/fiber";
import { FloorGlow, Studio } from "./parts";
import { TripodSpeaker } from "./tripod-speaker";

/* Audio: par de bocinas amplificadas sobre tripies, separadas entre si y
   ligeramente giradas hacia el centro. */

const SPACING = 1.7;

export function SpeakerStandsScene() {
  return (
    <Canvas
      frameloop="demand"
      dpr={[1, 1.75]}
      camera={{ position: [-1.45, 1.85, 6.65], fov: 40, near: 0.2, far: 60 }}
      gl={{ antialias: true, powerPreference: "high-performance" }}
    >
      <FloorGlow position={[0, 0.002, 0.2]} size={[7, 3.4]} opacity={0.5} />
      <TripodSpeaker position={[-SPACING, 0, 0]} yaw={0.16} />
      <TripodSpeaker position={[SPACING, 0, 0]} yaw={-0.16} />
      <Studio target={[0, 1.2, 0]} minDistance={4} maxDistance={14} />
    </Canvas>
  );
}
