"use client";

import { Instance, Instances } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { useMemo } from "react";
import {
  ALUMINUM,
  BLACK,
  Bars,
  Deck,
  FloorGlow,
  ladder,
  makeArtTexture,
  Panel,
  type Segment,
  Studio,
  type Vec3,
} from "./parts";

/* Muro simetrico: lienzo central con dos franjas a cada lado entre columnas
   de truss, sobre tarima larga; al frente, en el piso y separada de la
   tarima, una franja LED baja. */

/* ---------- medidas (metros) ---------- */
const DECK_W = 10;
const DECK_D = 2;
const LEG_H = 0.6;
const DECK_TOP = LEG_H + 0.12;
const LEG_X = [-4.9, -2.94, -0.98, 0.98, 2.94, 4.9];
const SEAMS = [-3, -1, 1, 3];

const PANEL_H = 2.8;
const PANEL_Y = DECK_TOP + PANEL_H / 2;
const PANEL_Z = -0.3;
const PANELS = [
  { x: -4.45, w: 0.9 },
  { x: -3.3, w: 0.7 },
  { x: 0, w: 5.2 },
  { x: 3.3, w: 0.7 },
  { x: 4.45, w: 0.9 },
];
const WALL_SPAN = 9.8;
const COLUMN_X = [-4.95, -3.825, -2.775, 2.775, 3.825, 4.95];
const COL_FRONT_Z = -0.45;
const COL_BACK_Z = -0.78;
const COL_TOP = DECK_TOP + PANEL_H + 0.12;
const CLAMP_Y = [1.2, 1.9, 2.6, 3.3];

const STRIP_W = 6.4;
const STRIP_H = 1.4;
// La franja va en el piso, dos metros por delante de la tarima.
const STRIP_Z = 3;
const STRIP_BOTTOM = 0.1;
const STRIP_Y = STRIP_BOTTOM + STRIP_H / 2;

function buildColumns(): Segment[] {
  const depth: Vec3 = [0, 0, COL_BACK_Z - COL_FRONT_Z];
  return COLUMN_X.flatMap((x) =>
    ladder([x, DECK_TOP, COL_FRONT_Z], [x, COL_TOP, COL_FRONT_Z], depth, 0.4),
  );
}

const COLUMNS = buildColumns();
const CLAMPS: Vec3[] = COLUMN_X.flatMap((x) =>
  CLAMP_Y.map((y): Vec3 => [x, y, COL_FRONT_Z + 0.02]),
);
const STRIP_FEET = [-2.9, -1, 1, 2.9];

function Screens() {
  const wallArt = useMemo(() => makeArtTexture(WALL_SPAN / PANEL_H), []);
  const stripArt = useMemo(() => makeArtTexture(STRIP_W / STRIP_H), []);
  return (
    <group>
      <FloorGlow position={[0, 0.002, 1]} size={[14, 7]} />
      <pointLight
        color="#3f7dff"
        intensity={60}
        distance={10}
        position={[-2, 2.2, 1]}
      />
      <pointLight
        color="#ff3d8f"
        intensity={50}
        distance={10}
        position={[2.4, 2.2, 1]}
      />

      {PANELS.map((panel) => (
        <Panel
          key={panel.x}
          x={panel.x}
          y={PANEL_Y}
          z={PANEL_Z}
          width={panel.w}
          height={PANEL_H}
          texture={wallArt}
          span={WALL_SPAN}
        />
      ))}
      <Bars segments={COLUMNS} radius={0.026} material={ALUMINUM} />
      <Instances limit={CLAMPS.length + COLUMN_X.length}>
        <boxGeometry args={[0.14, 0.14, 0.07]} />
        <meshStandardMaterial {...BLACK} />
        {CLAMPS.map((clamp) => (
          <Instance key={clamp.join(",")} position={clamp} />
        ))}
        {/* Ganchos en lo alto de cada columna. */}
        {COLUMN_X.map((x) => (
          <Instance
            key={`top-${x}`}
            position={[x, COL_TOP + 0.05, COL_FRONT_Z]}
          />
        ))}
      </Instances>

      {/* Franja baja al frente, sobre pies cortos, con marcos negros. */}
      <Panel
        x={0}
        y={STRIP_Y}
        z={STRIP_Z}
        width={STRIP_W}
        height={STRIP_H}
        texture={stripArt}
        span={STRIP_W}
      />
      {[-1, 1].map((side) => (
        <mesh
          key={side}
          position={[side * (STRIP_W / 2 + 0.05), STRIP_Y, STRIP_Z - 0.02]}
        >
          <boxGeometry args={[0.08, STRIP_H + 0.04, 0.14]} />
          <meshStandardMaterial {...BLACK} />
        </mesh>
      ))}
      {STRIP_FEET.map((x) => (
        <mesh key={x} position={[x, STRIP_BOTTOM / 2, STRIP_Z]}>
          <boxGeometry args={[0.16, STRIP_BOTTOM, 0.34]} />
          <meshStandardMaterial {...BLACK} />
        </mesh>
      ))}
      {[-2.4, -0.8, 0.8, 2.4].map((x) => (
        <mesh key={x} position={[x, STRIP_BOTTOM + STRIP_H + 0.03, STRIP_Z]}>
          <boxGeometry args={[0.12, 0.06, 0.08]} />
          <meshStandardMaterial {...BLACK} />
        </mesh>
      ))}
    </group>
  );
}

export function SymmetricWallScene() {
  return (
    <Canvas
      frameloop="demand"
      dpr={[1, 1.75]}
      camera={{ position: [-10.1, 6.2, 16], fov: 40, near: 0.3, far: 80 }}
      gl={{ antialias: true, powerPreference: "high-performance" }}
    >
      <Deck
        width={DECK_W}
        depth={DECK_D}
        legHeight={LEG_H}
        legsX={LEG_X}
        seams={SEAMS}
      />
      <Screens />
      <Studio target={[-0.3, 1.6, 0.9]} minDistance={10} maxDistance={30} />
    </Canvas>
  );
}
