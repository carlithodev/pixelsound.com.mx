"use client";

import { Canvas } from "@react-three/fiber";
import { useMemo } from "react";
import { BLACK, Deck, FloorGlow, makeArtTexture, Panel, Studio } from "./parts";

/* Pantalla ancha: un solo lienzo muy ancho apoyado directamente sobre una
   tarima larga de siete modulos con patas cuadradas. */

/* ---------- medidas (metros) ---------- */
const DECK_W = 8;
const DECK_D = 0.6;
const LEG_H = 0.6;
const DECK_TOP = LEG_H + 0.12;
const MODULE = DECK_W / 7;
const LEG_X = Array.from(
  { length: 8 },
  (_, i) => -DECK_W / 2 + 0.05 + (i * (DECK_W - 0.1)) / 7,
);
const SEAMS = Array.from(
  { length: 6 },
  (_, i) => -DECK_W / 2 + MODULE * (i + 1),
);

const SCREEN_W = 7.6;
const SCREEN_H = 2.4;
const SCREEN_Z = 0;
const SCREEN_BOTTOM = DECK_TOP + 0.02;
const SCREEN_Y = SCREEN_BOTTOM + SCREEN_H / 2;
const HOOK_X = [-2.5, -0.3, 1.5, 3.3];

function Screen() {
  const texture = useMemo(() => makeArtTexture(SCREEN_W / SCREEN_H), []);
  return (
    <group>
      <FloorGlow position={[-0.2, 0.002, 0.2]} size={[11, 4.6]} />
      <pointLight
        color="#3f7dff"
        intensity={50}
        distance={9}
        position={[-2, 2.4, 1.2]}
      />
      <pointLight
        color="#ff3d8f"
        intensity={40}
        distance={9}
        position={[2.2, 2.4, 1.2]}
      />
      <Panel
        x={0}
        y={SCREEN_Y}
        z={SCREEN_Z}
        width={SCREEN_W}
        height={SCREEN_H}
        texture={texture}
        span={SCREEN_W}
      />
      {/* Marco negro en el extremo izquierdo, con abrazaderas. */}
      <group position={[-SCREEN_W / 2 - 0.06, SCREEN_Y, SCREEN_Z - 0.02]}>
        <mesh>
          <boxGeometry args={[0.1, SCREEN_H + 0.06, 0.16]} />
          <meshStandardMaterial {...BLACK} />
        </mesh>
        {[-0.9, -0.3, 0.3, 0.9].map((y) => (
          <mesh key={y} position={[0, y, 0.1]}>
            <boxGeometry args={[0.14, 0.14, 0.05]} />
            <meshStandardMaterial {...BLACK} />
          </mesh>
        ))}
      </group>
      {/* Ganchos en el borde superior. */}
      {HOOK_X.map((x) => (
        <mesh key={x} position={[x, SCREEN_BOTTOM + SCREEN_H + 0.04, SCREEN_Z]}>
          <boxGeometry args={[0.08, 0.08, 0.08]} />
          <meshStandardMaterial {...BLACK} />
        </mesh>
      ))}
    </group>
  );
}

export function RaisedWallScene() {
  return (
    <Canvas
      frameloop="demand"
      dpr={[1, 1.75]}
      camera={{ position: [-7.55, 4.9, 10.6], fov: 40, near: 0.3, far: 80 }}
      gl={{ antialias: true, powerPreference: "high-performance" }}
    >
      <Deck
        width={DECK_W}
        depth={DECK_D}
        legHeight={LEG_H}
        legsX={LEG_X}
        seams={SEAMS}
      />
      <Screen />
      <Studio target={[0, 1.7, -0.2]} minDistance={8} maxDistance={24} />
    </Canvas>
  );
}
