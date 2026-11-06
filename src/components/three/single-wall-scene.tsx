"use client";

import { Canvas } from "@react-three/fiber";
import { useMemo } from "react";
import {
  BLACK,
  Bars,
  Deck,
  FloorGlow,
  makeArtTexture,
  Panel,
  type Segment,
  Studio,
} from "./parts";

/* Pantalla individual: un solo lienzo sobre tarima de dos modulos con patas
   redondas, sostenido por dos barras negras traseras con pie en escuadra. */

/* ---------- medidas (metros) ---------- */
const DECK_W = 4;
const DECK_D = 1;
const LEG_H = 0.6;
const DECK_TOP = LEG_H + 0.12;
const PANEL_W = 3.6;
const PANEL_H = 1.8;
const PANEL_Z = -0.12;
const PANEL_Y = DECK_TOP + 0.06 + PANEL_H / 2;
const BAR_X = PANEL_W / 2 - 0.1;
const BAR_TOP = DECK_TOP + PANEL_H + 0.3;
const BAR_Z = PANEL_Z - 0.11;

const LEG_X = [-1.95, 0, 1.95];

// Pie en escuadra de cada barra: base sobre la tarima y tirante hacia el
// frente.
const BRACES: Segment[] = [BAR_X, -BAR_X].flatMap((x): Segment[] => [
  { a: [x, DECK_TOP + 0.03, BAR_Z], b: [x, DECK_TOP + 0.03, BAR_Z + 0.55] },
  { a: [x, DECK_TOP + 0.9, BAR_Z], b: [x, DECK_TOP + 0.05, BAR_Z + 0.52] },
]);

function Screen() {
  const texture = useMemo(() => makeArtTexture(PANEL_W / PANEL_H), []);
  return (
    <group>
      <FloorGlow position={[-0.3, 0.002, 0.1]} size={[6.4, 3.2]} />
      <pointLight
        color="#3f7dff"
        intensity={22}
        distance={6}
        position={[-0.8, 1.6, 0.6]}
      />
      <pointLight
        color="#ff3d8f"
        intensity={18}
        distance={6}
        position={[0.9, 1.6, 0.6]}
      />
      <Panel
        x={0}
        y={PANEL_Y}
        z={PANEL_Z}
        width={PANEL_W}
        height={PANEL_H}
        texture={texture}
        span={PANEL_W}
      />
      {/* Barras traseras negras, mas altas que el panel, con ganchos arriba. */}
      {[BAR_X, -BAR_X].map((x) => (
        <group key={x}>
          <mesh position={[x, (DECK_TOP + BAR_TOP) / 2, BAR_Z]}>
            <boxGeometry args={[0.09, BAR_TOP - DECK_TOP, 0.12]} />
            <meshStandardMaterial {...BLACK} />
          </mesh>
          <mesh position={[x, BAR_TOP + 0.04, BAR_Z + 0.02]}>
            <boxGeometry args={[0.05, 0.08, 0.05]} />
            <meshStandardMaterial {...BLACK} />
          </mesh>
          {[0.3, 0.75, 1.2, 1.65].map((y) => (
            <mesh key={y} position={[x, DECK_TOP + y, BAR_Z + 0.09]}>
              <boxGeometry args={[0.12, 0.1, 0.06]} />
              <meshStandardMaterial {...BLACK} />
            </mesh>
          ))}
          <mesh position={[x, DECK_TOP + 0.015, BAR_Z + 0.25]}>
            <boxGeometry args={[0.16, 0.03, 0.6]} />
            <meshStandardMaterial {...BLACK} />
          </mesh>
        </group>
      ))}
      <Bars segments={BRACES} radius={0.022} material={BLACK} />
      {/* Clips en el borde superior del panel. */}
      {[-1.2, 1.2].map((x) => (
        <mesh key={x} position={[x, DECK_TOP + 0.06 + PANEL_H + 0.03, PANEL_Z]}>
          <boxGeometry args={[0.1, 0.06, 0.08]} />
          <meshStandardMaterial {...BLACK} />
        </mesh>
      ))}
    </group>
  );
}

export function SingleWallScene() {
  return (
    <Canvas
      frameloop="demand"
      dpr={[1, 1.75]}
      camera={{ position: [-5.4, 3.6, 6.9], fov: 38, near: 0.3, far: 60 }}
      gl={{ antialias: true, powerPreference: "high-performance" }}
    >
      <Deck
        width={DECK_W}
        depth={DECK_D}
        legHeight={LEG_H}
        legsX={LEG_X}
        round
        seams={[0]}
      />
      <Screen />
      <Studio target={[0, 1.3, 0]} minDistance={5} maxDistance={16} />
    </Canvas>
  );
}
