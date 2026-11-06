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

/* Formato colgante: tarima de tres modulos con una franja LED baja al
   frente y, mas atras y mas arriba, tres paneles colgados de una viga de
   truss cuadrada con luces y dos marcos de truss encima. */

/* ---------- medidas (metros) ---------- */
const DECK_W = 6;
const DECK_D = 2;
const LEG_H = 0.6;
const DECK_TOP = LEG_H + 0.12;
const LEG_X = [-2.95, -0.98, 0.98, 2.95];

const STRIP_W = 5.2;
const STRIP_H = 1.1;
const STRIP_Z = 0.72;
const STRIP_Y = DECK_TOP + STRIP_H / 2;

const PANEL_W = 2;
const PANEL_H = 1.75;
const PANEL_GAP = 0.12;
const PANEL_X = [-(PANEL_W + PANEL_GAP), 0, PANEL_W + PANEL_GAP];
const PANEL_SPAN = PANEL_W * 3 + PANEL_GAP * 2;
const PANEL_BOTTOM = 2.15;
const PANEL_Y = PANEL_BOTTOM + PANEL_H / 2;
// Los paneles cuelgan detras de la franja: casi un metro de profundidad.
const PANEL_Z = -1.15;

const BEAM_X0 = -4;
const BEAM_X1 = 4;
const BEAM_LOW = 4.35;
const BEAM_HIGH = 4.65;
const BEAM_FRONT_Z = PANEL_Z + 0.15;
const BEAM_BACK_Z = PANEL_Z - 0.15;

const LIGHTS_BELOW = [-3.1, -0.9, 1.3, 3.3];
const LIGHTS_ABOVE = [-2.4, 0.5, 2.9];
const FRAMES_X = [-2.2, 0.9];

// Viga cuadrada: cuatro cuerdas y zigzag en las cuatro caras.
function buildBeam(): Segment[] {
  const up: Vec3 = [0, BEAM_HIGH - BEAM_LOW, 0];
  const back: Vec3 = [0, 0, BEAM_BACK_Z - BEAM_FRONT_Z];
  const segments = [
    ...ladder(
      [BEAM_X0, BEAM_LOW, BEAM_FRONT_Z],
      [BEAM_X1, BEAM_LOW, BEAM_FRONT_Z],
      up,
      0.45,
    ),
    ...ladder(
      [BEAM_X0, BEAM_LOW, BEAM_BACK_Z],
      [BEAM_X1, BEAM_LOW, BEAM_BACK_Z],
      up,
      0.45,
    ),
    ...ladder(
      [BEAM_X0, BEAM_HIGH, BEAM_FRONT_Z],
      [BEAM_X1, BEAM_HIGH, BEAM_FRONT_Z],
      back,
      0.45,
    ),
    ...ladder(
      [BEAM_X0, BEAM_LOW, BEAM_FRONT_Z],
      [BEAM_X1, BEAM_LOW, BEAM_FRONT_Z],
      back,
      0.45,
    ),
  ];
  // Marcos de truss sobre la viga: dos postes y un travesano.
  for (const x of FRAMES_X) {
    const top = BEAM_HIGH + 0.6;
    for (const post of [x - 0.6, x + 0.6]) {
      segments.push(
        ...ladder(
          [post, BEAM_HIGH, BEAM_FRONT_Z],
          [post, top, BEAM_FRONT_Z],
          back,
          0.3,
        ),
      );
    }
    segments.push(
      ...ladder(
        [x - 0.6, top, BEAM_FRONT_Z],
        [x + 0.6, top, BEAM_FRONT_Z],
        back,
        0.3,
      ),
    );
  }
  return segments;
}

const BEAM = buildBeam();

// Cadenas: de las abrazaderas del panel a la cuerda baja de la viga.
const HANGERS: Segment[] = PANEL_X.flatMap((x): Segment[] =>
  [-0.6, 0.6].map((offset): Segment => ({
    a: [x + offset, PANEL_BOTTOM + PANEL_H + 0.05, PANEL_Z],
    b: [x + offset, BEAM_LOW, PANEL_Z],
  })),
);

const CLAMPS: Vec3[] = [
  ...PANEL_X.flatMap((x) =>
    [-0.6, 0.6].map((offset): Vec3 => [x + offset, BEAM_LOW - 0.08, PANEL_Z]),
  ),
  ...PANEL_X.flatMap((x) =>
    [-0.6, 0.6].map((offset): Vec3 => [
      x + offset,
      PANEL_BOTTOM + PANEL_H + 0.05,
      PANEL_Z,
    ]),
  ),
];

// Abrazaderas laterales en los bordes de los paneles colgados.
const SIDE_CLAMPS: Vec3[] = PANEL_X.flatMap((x) =>
  [-1, 1].flatMap((side) =>
    [0.3, 0.9, 1.45].map((y): Vec3 => [
      x + side * (PANEL_W / 2 + 0.02),
      PANEL_BOTTOM + y,
      PANEL_Z,
    ]),
  ),
);

function Screens() {
  const stripArt = useMemo(() => makeArtTexture(STRIP_W / STRIP_H), []);
  const panelArt = useMemo(() => makeArtTexture(PANEL_SPAN / PANEL_H), []);
  return (
    <group>
      <FloorGlow position={[-0.2, 0.002, 0.1]} size={[10, 4.4]} />
      <pointLight
        color="#3f7dff"
        intensity={40}
        distance={9}
        position={[-1.6, 2.2, 1]}
      />
      <pointLight
        color="#ff3d8f"
        intensity={32}
        distance={8}
        position={[1.8, 2.2, 1]}
      />

      {/* Franja baja al frente, con marcos negros en los extremos. */}
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
      {[-1.9, -0.65, 0.65, 1.9].map((x) => (
        <mesh key={x} position={[x, DECK_TOP + STRIP_H + 0.03, STRIP_Z]}>
          <boxGeometry args={[0.12, 0.06, 0.08]} />
          <meshStandardMaterial {...BLACK} />
        </mesh>
      ))}

      {/* Tres paneles colgados, arte continuo entre los tres. */}
      {PANEL_X.map((x) => (
        <Panel
          key={x}
          x={x}
          y={PANEL_Y}
          z={PANEL_Z}
          width={PANEL_W}
          height={PANEL_H}
          texture={panelArt}
          span={PANEL_SPAN}
        />
      ))}
      <Bars segments={HANGERS} radius={0.012} material={BLACK} />
      <Instances limit={CLAMPS.length + SIDE_CLAMPS.length}>
        <boxGeometry args={[0.14, 0.12, 0.16]} />
        <meshStandardMaterial {...BLACK} />
        {[...CLAMPS, ...SIDE_CLAMPS].map((clamp) => (
          <Instance key={clamp.join(",")} position={clamp} />
        ))}
      </Instances>

      {/* Viga con luces colgadas debajo y montadas encima. */}
      <Bars segments={BEAM} radius={0.024} material={ALUMINUM} />
      {LIGHTS_BELOW.map((x) => (
        <MovingHead key={x} position={[x, BEAM_LOW - 0.03, PANEL_Z]} hanging />
      ))}
      {LIGHTS_ABOVE.map((x) => (
        <MovingHead key={x} position={[x, BEAM_HIGH + 0.03, PANEL_Z]} />
      ))}
    </group>
  );
}

export function HangingWallScene() {
  return (
    <Canvas
      frameloop="demand"
      dpr={[1, 1.75]}
      camera={{ position: [-7.8, 5.7, 10.6], fov: 40, near: 0.3, far: 80 }}
      gl={{ antialias: true, powerPreference: "high-performance" }}
    >
      <Deck
        width={DECK_W}
        depth={DECK_D}
        legHeight={LEG_H}
        legsX={LEG_X}
        round
        seams={[-1, 1]}
      />
      <Screens />
      <Studio target={[0, 2.3, -0.5]} minDistance={8} maxDistance={24} />
    </Canvas>
  );
}
