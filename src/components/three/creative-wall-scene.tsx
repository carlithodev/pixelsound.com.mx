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
  MovingHead,
  Panel,
  type Segment,
  Studio,
  type Vec3,
} from "./parts";

/* Formato creativo: tarima larga, cinco paneles de distinto ancho colgados
   de columnas de truss, viga superior con cabezas moviles y torre lateral. */

/* ---------- medidas (metros) ---------- */
const DECK_W = 12;
const DECK_D = 2;
const LEG_H = 1;
const DECK_TOP = LEG_H + 0.12;
const PANEL_H = 3;
const PANEL_Y = DECK_TOP + PANEL_H / 2;
const PANEL_Z = -0.3;
const BEAM_LOW = 4.28;
const BEAM_HIGH = 4.58;
const BEAM_Z = -0.6;
const COL_FRONT_Z = -0.45;
const COL_BACK_Z = -0.78;
const TOWER_X = 5.1;
const TOWER_TOP = 5.0;

const LEG_X = [-5.9, -3.95, -2, -0.05, 1.9, 3.85, 5.8];

/* Dos franjas angostas, el lienzo central y dos mas anchas a la derecha. */
const PANELS = [
  { x: -5.45, w: 0.5 },
  { x: -4.45, w: 0.7 },
  { x: -1.2, w: 5 },
  { x: 2.3, w: 1.2 },
  { x: 4.05, w: 1.5 },
];
const COLUMN_X = [-5.95, -5, -3.9, 1.5, 3.1];
const LIGHT_X = [-5.5, -3.75, -2, -0.25, 1.5, 3.25, 5];
const CLAMP_Y = [1.6, 2.4, 3.2, 3.9];

function buildTruss(): Segment[] {
  const segments: Segment[] = [];
  const depth: Vec3 = [0, 0, COL_BACK_Z - COL_FRONT_Z];
  for (const x of COLUMN_X) {
    segments.push(
      ...ladder(
        [x, DECK_TOP, COL_FRONT_Z],
        [x, BEAM_LOW, COL_FRONT_Z],
        depth,
        0.4,
      ),
    );
  }
  segments.push(
    ...ladder(
      [TOWER_X, DECK_TOP, COL_FRONT_Z],
      [TOWER_X, TOWER_TOP, COL_FRONT_Z],
      depth,
      0.4,
    ),
  );
  segments.push(
    ...ladder(
      [-6, BEAM_LOW, BEAM_Z],
      [5.3, BEAM_LOW, BEAM_Z],
      [0, BEAM_HIGH - BEAM_LOW, 0],
      0.5,
    ),
  );
  return segments;
}

const TRUSS = buildTruss();
const BLACK_BARS: Segment[] = [
  { a: [TOWER_X, TOWER_TOP - 0.1, BEAM_Z], b: [5.9, DECK_TOP + 0.08, 0.85] },
  { a: [TOWER_X, DECK_TOP + 0.12, BEAM_Z], b: [5.95, DECK_TOP + 0.12, 0.85] },
];
const CLAMPS: Vec3[] = [...COLUMN_X, TOWER_X].flatMap((x) =>
  CLAMP_Y.map((y): Vec3 => [x, y, COL_FRONT_Z + 0.02]),
);

function Wall() {
  const texture = useMemo(() => makeArtTexture(DECK_W / PANEL_H), []);
  return (
    <group>
      <FloorGlow position={[-0.6, 0.002, 0.3]} size={[15, 6]} />
      {/* Luz que las pantallas tiran sobre truss y tarima. */}
      <pointLight
        color="#3f7dff"
        intensity={70}
        distance={11}
        position={[-2, 2.6, 1.6]}
      />
      <pointLight
        color="#ff3d8f"
        intensity={55}
        distance={9}
        position={[3.4, 2.6, 1.4]}
      />
      {PANELS.map((panel) => (
        <Panel
          key={panel.x}
          x={panel.x}
          y={PANEL_Y}
          z={PANEL_Z}
          width={panel.w}
          height={PANEL_H}
          texture={texture}
          span={DECK_W}
        />
      ))}
      <Bars segments={TRUSS} radius={0.026} material={ALUMINUM} />
      <Bars segments={BLACK_BARS} radius={0.035} material={BLACK} />
      <Instances limit={CLAMPS.length}>
        <boxGeometry args={[0.14, 0.14, 0.07]} />
        <meshStandardMaterial {...BLACK} />
        {CLAMPS.map((clamp) => (
          <Instance key={clamp.join(",")} position={clamp} />
        ))}
      </Instances>
      {LIGHT_X.map((x) => (
        <MovingHead key={x} position={[x, BEAM_HIGH + 0.03, BEAM_Z]} />
      ))}
      {/* Abrazadera suelta entre la segunda y la tercera luz. */}
      <mesh position={[-2.9, BEAM_HIGH + 0.09, BEAM_Z]}>
        <boxGeometry args={[0.2, 0.12, 0.14]} />
        <meshStandardMaterial {...BLACK} />
      </mesh>
      {/* Cubo de esquina en lo alto de la torre. */}
      <mesh position={[TOWER_X, TOWER_TOP + 0.12, BEAM_Z]}>
        <boxGeometry args={[0.3, 0.26, 0.42]} />
        <meshStandardMaterial {...BLACK} />
      </mesh>
    </group>
  );
}

export function CreativeWallScene() {
  return (
    <Canvas
      frameloop="demand"
      dpr={[1, 1.75]}
      camera={{ position: [-12.3, 7.8, 15.2], fov: 40, near: 0.5, far: 100 }}
      gl={{ antialias: true, powerPreference: "high-performance" }}
    >
      <Deck width={DECK_W} depth={DECK_D} legHeight={LEG_H} legsX={LEG_X} />
      <Wall />
      <Studio target={[-0.5, 2.3, 0]} minDistance={12} maxDistance={32} />
    </Canvas>
  );
}
