"use client";

import { Instance, Instances } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { useMemo } from "react";
import type * as THREE from "three";
import {
  ALUMINUM,
  BLACK,
  Bars,
  boxTruss,
  FloorGlow,
  makeGrilleTexture,
  type Segment,
  Studio,
  type Vec3,
} from "./parts";

/* Audio: portico de truss cuadrado (dos torres sobre base con tirantes y una
   viga superior) con un brazo negro a cada lado del que cuelga un line array
   de tres bafles bajo su bumper. */

/* ---------- medidas (metros) ---------- */
const TRUSS = 0.29;
const TOWER_X = 2.6;
const TOWER_BOTTOM = 0.34;
const TOWER_TOP = 4.6;
const BEAM_Y = TOWER_TOP + TRUSS / 2 + 0.02;
const BASE = 1.0;

const ARM_Y = BEAM_Y;
const ARM_LENGTH = 1.25;
const ARM_START = TOWER_X + TRUSS / 2 + 0.02;

const CAB_W = 0.95;
const CAB_H = 0.55;
const CAB_D = 0.62;
const ARRAY_X = ARM_START + ARM_LENGTH - 0.55;
const BUMPER_Y = ARM_Y - 0.5;
const CAB_Y = [BUMPER_Y - 0.36, BUMPER_Y - 0.94, BUMPER_Y - 1.52];
const CAB_TILT = [0, -0.06, -0.13];

function buildStructure(): Segment[] {
  const segments: Segment[] = [];
  for (const side of [-1, 1]) {
    const x = side * TOWER_X;
    segments.push(
      ...boxTruss([x, TOWER_BOTTOM, 0], [x, TOWER_TOP, 0], TRUSS, 0.36),
    );
    // Tirantes de la base: de las esquinas de la placa a la torre.
    for (const sx of [-1, 1]) {
      for (const sz of [-1, 1]) {
        segments.push({
          a: [x + (sx * BASE) / 2, 0.08, (sz * BASE) / 2],
          b: [x + (sx * TRUSS) / 2, 1.05, (sz * TRUSS) / 2],
        });
      }
    }
  }
  segments.push(
    ...boxTruss(
      [-TOWER_X + TRUSS / 2, BEAM_Y, 0],
      [TOWER_X - TRUSS / 2, BEAM_Y, 0],
      TRUSS,
      0.36,
    ),
  );
  return segments;
}

const STRUCTURE = buildStructure();

// Cadenas del bumper al brazo.
const CHAINS: Segment[] = [-1, 1].flatMap((side): Segment[] =>
  [-0.3, 0.3].map((offset): Segment => ({
    a: [side * (ARRAY_X + offset), ARM_Y - 0.06, 0],
    b: [side * (ARRAY_X + offset), BUMPER_Y + 0.05, 0],
  })),
);

const FEET: Vec3[] = [-1, 1].flatMap((side) =>
  [-1, 1].flatMap((sx) =>
    [-1, 1].map((sz): Vec3 => [
      side * TOWER_X + (sx * BASE) / 2,
      0.025,
      (sz * BASE) / 2,
    ]),
  ),
);

type CabinetProps = {
  position: Vec3;
  tilt: number;
  /* Lado que mira a la torre: ahi van los acentos naranja. */
  inner: 1 | -1;
  grille: THREE.Texture;
};

// Bafle: caja negra, rejilla perforada al frente, rieles y herrajes
// naranja en el costado interior.
function Cabinet({ position, tilt, inner, grille }: CabinetProps) {
  const map = useMemo(() => {
    const clone = grille.clone();
    clone.repeat.set(CAB_W / 0.16, CAB_H / 0.16);
    clone.needsUpdate = true;
    return clone;
  }, [grille]);
  return (
    <group position={position} rotation={[tilt, 0, 0]}>
      <mesh>
        <boxGeometry args={[CAB_W, CAB_H, CAB_D]} />
        <meshStandardMaterial
          color="#1c1d21"
          metalness={0.25}
          roughness={0.6}
        />
      </mesh>
      <mesh position={[0, 0, CAB_D / 2 + 0.004]}>
        <planeGeometry args={[CAB_W - 0.08, CAB_H - 0.08]} />
        <meshStandardMaterial map={map} metalness={0.3} roughness={0.75} />
      </mesh>
      {/* Bisel claro alrededor de la rejilla. */}
      <mesh position={[0, 0, CAB_D / 2 + 0.002]}>
        <planeGeometry args={[CAB_W - 0.02, CAB_H - 0.02]} />
        <meshStandardMaterial
          color="#26282d"
          metalness={0.3}
          roughness={0.55}
        />
      </mesh>
      <mesh position={[inner * (CAB_W / 2 + 0.008), 0.02, 0.12]}>
        <boxGeometry args={[0.016, CAB_H - 0.16, 0.2]} />
        <meshStandardMaterial color="#f08a2a" metalness={0.2} roughness={0.5} />
      </mesh>
      <mesh position={[inner * (CAB_W / 2 + 0.03), CAB_H / 2 - 0.06, -0.1]}>
        <boxGeometry args={[0.05, 0.05, 0.16]} />
        <meshStandardMaterial {...BLACK} />
      </mesh>
    </group>
  );
}

function LineArray({ side, grille }: { side: 1 | -1; grille: THREE.Texture }) {
  const x = side * ARRAY_X;
  const inner: 1 | -1 = side === 1 ? -1 : 1;
  return (
    <group>
      {/* Brazo negro que sale de la esquina superior de la torre. */}
      <mesh position={[side * (ARM_START + ARM_LENGTH / 2), ARM_Y, 0]}>
        <boxGeometry args={[ARM_LENGTH, 0.11, 0.14]} />
        <meshStandardMaterial {...BLACK} />
      </mesh>
      <mesh position={[side * (ARM_START + 0.08), ARM_Y, 0]}>
        <boxGeometry args={[0.18, 0.4, 0.2]} />
        <meshStandardMaterial {...BLACK} />
      </mesh>
      <mesh position={[side * (ARM_START + ARM_LENGTH - 0.04), ARM_Y, 0]}>
        <boxGeometry args={[0.08, 0.16, 0.16]} />
        <meshStandardMaterial {...BLACK} />
      </mesh>
      {/* Bumper: marco de vuelo sobre el primer bafle. */}
      <mesh position={[x, BUMPER_Y, 0]}>
        <boxGeometry args={[CAB_W + 0.08, 0.09, CAB_D + 0.06]} />
        <meshStandardMaterial {...BLACK} />
      </mesh>
      {CAB_Y.map((y, index) => (
        <Cabinet
          key={y}
          position={[x, y, 0]}
          tilt={CAB_TILT[index]}
          inner={inner}
          grille={grille}
        />
      ))}
    </group>
  );
}

function Rig() {
  const grille = useMemo(makeGrilleTexture, []);
  return (
    <group>
      <FloorGlow position={[0, 0.002, 0.4]} size={[12, 5]} opacity={0.55} />
      <Bars segments={STRUCTURE} radius={0.024} material={ALUMINUM} />
      <Bars segments={CHAINS} radius={0.012} material={BLACK} />
      {/* Placas base, cubos de esquina y union central de la viga. */}
      {[-1, 1].map((side) => (
        <group key={side}>
          <mesh position={[side * TOWER_X, 0.07, 0]}>
            <boxGeometry args={[BASE, 0.05, BASE]} />
            <meshStandardMaterial {...ALUMINUM} />
          </mesh>
          <mesh position={[side * TOWER_X, 0.2, 0]}>
            <boxGeometry args={[TRUSS + 0.1, 0.22, TRUSS + 0.1]} />
            <meshStandardMaterial {...ALUMINUM} />
          </mesh>
          <mesh position={[side * TOWER_X, BEAM_Y, 0]}>
            <boxGeometry args={[TRUSS + 0.06, TRUSS + 0.06, TRUSS + 0.06]} />
            <meshStandardMaterial {...ALUMINUM} />
          </mesh>
        </group>
      ))}
      <mesh position={[0, BEAM_Y, 0]}>
        <boxGeometry args={[0.06, TRUSS + 0.04, TRUSS + 0.04]} />
        <meshStandardMaterial {...ALUMINUM} />
      </mesh>
      <Instances limit={FEET.length}>
        <cylinderGeometry args={[0.07, 0.08, 0.05, 16]} />
        <meshStandardMaterial {...BLACK} />
        {FEET.map((foot) => (
          <Instance key={foot.join(",")} position={foot} />
        ))}
      </Instances>
      <LineArray side={-1} grille={grille} />
      <LineArray side={1} grille={grille} />
    </group>
  );
}

export function LineArrayScene() {
  return (
    <Canvas
      frameloop="demand"
      dpr={[1, 1.75]}
      camera={{ position: [-3.1, 4.1, 14.6], fov: 40, near: 0.3, far: 80 }}
      gl={{ antialias: true, powerPreference: "high-performance" }}
    >
      <Rig />
      <Studio target={[0, 2.5, 0]} minDistance={9} maxDistance={28} />
    </Canvas>
  );
}
