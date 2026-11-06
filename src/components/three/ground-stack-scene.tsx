"use client";

import { Canvas } from "@react-three/fiber";
import { useMemo } from "react";
import type * as THREE from "three";
import { BLACK, FloorGlow, makeGrilleTexture, Studio } from "./parts";

/* Audio: dos torres de tres bafles de line array apilados en el piso, con
   marco de vuelo arriba, rieles de rigging y herrajes naranja. */

/* ---------- medidas (metros) ---------- */
const SPACING = 1.35;
const CAB_W = 0.9;
const CAB_H = 0.52;
const CAB_D = 0.62;
const GAP = 0.03;
const LEVELS = [0.03, 0.03 + CAB_H + GAP, 0.03 + (CAB_H + GAP) * 2];
const TOP_Y = LEVELS[2] + CAB_H + 0.02;

type CabinetProps = {
  y: number;
  grille: THREE.Texture;
};

// Bafle: caja negra, tres secciones de rejilla (dos anchas y una franja al
// centro), logotipo, riel lateral y herraje naranja a la derecha.
function StackCabinet({ y, grille }: CabinetProps) {
  const maps = useMemo(() => {
    const wide = grille.clone();
    wide.repeat.set(0.3 / 0.14, (CAB_H - 0.08) / 0.14);
    wide.needsUpdate = true;
    const narrow = grille.clone();
    narrow.repeat.set(0.16 / 0.09, (CAB_H - 0.08) / 0.09);
    narrow.needsUpdate = true;
    return { wide, narrow };
  }, [grille]);
  const front = CAB_D / 2;
  return (
    <group position={[0, y + CAB_H / 2, 0]}>
      <mesh>
        <boxGeometry args={[CAB_W, CAB_H, CAB_D]} />
        <meshStandardMaterial
          color="#1c1d21"
          metalness={0.25}
          roughness={0.6}
        />
      </mesh>
      <mesh position={[0, 0, front + 0.002]}>
        <planeGeometry args={[CAB_W - 0.02, CAB_H - 0.02]} />
        <meshStandardMaterial
          color="#26282d"
          metalness={0.3}
          roughness={0.55}
        />
      </mesh>
      {[-0.27, 0.27].map((x) => (
        <mesh key={x} position={[x, 0, front + 0.005]}>
          <planeGeometry args={[0.3, CAB_H - 0.08]} />
          <meshStandardMaterial
            map={maps.wide}
            metalness={0.3}
            roughness={0.75}
          />
        </mesh>
      ))}
      <mesh position={[0, 0, front + 0.005]}>
        <planeGeometry args={[0.16, CAB_H - 0.08]} />
        <meshStandardMaterial
          map={maps.narrow}
          metalness={0.3}
          roughness={0.75}
        />
      </mesh>
      {/* Logotipo abajo a la derecha. */}
      <mesh
        position={[0.36, -CAB_H / 2 + 0.07, front + 0.01]}
        rotation={[Math.PI / 2, 0, 0]}
      >
        <cylinderGeometry args={[0.016, 0.016, 0.004, 20]} />
        <meshStandardMaterial color="#9a9aa2" metalness={0.6} roughness={0.4} />
      </mesh>
      {/* Costado derecho: riel de rigging y placa naranja. */}
      <mesh position={[CAB_W / 2 + 0.012, 0, -0.02]}>
        <boxGeometry args={[0.024, CAB_H - 0.06, 0.3]} />
        <meshStandardMaterial {...BLACK} />
      </mesh>
      <mesh position={[CAB_W / 2 + 0.03, -0.04, 0.16]}>
        <boxGeometry args={[0.02, CAB_H - 0.2, 0.14]} />
        <meshStandardMaterial color="#f08a2a" metalness={0.2} roughness={0.5} />
      </mesh>
      <mesh position={[CAB_W / 2 + 0.05, CAB_H / 2 - 0.08, 0.18]}>
        <boxGeometry args={[0.06, 0.05, 0.06]} />
        <meshStandardMaterial {...BLACK} />
      </mesh>
      {/* Riel izquierdo. */}
      <mesh position={[-CAB_W / 2 - 0.012, 0, -0.02]}>
        <boxGeometry args={[0.024, CAB_H - 0.06, 0.3]} />
        <meshStandardMaterial {...BLACK} />
      </mesh>
    </group>
  );
}

function Stack({
  x,
  yaw,
  grille,
}: {
  x: number;
  yaw: number;
  grille: THREE.Texture;
}) {
  return (
    <group position={[x, 0, 0]} rotation={[0, yaw, 0]}>
      {LEVELS.map((y) => (
        <StackCabinet key={y} y={y} grille={grille} />
      ))}
      {/* Marco de vuelo encima de la torre. */}
      <mesh position={[0, TOP_Y + 0.05, 0]}>
        <boxGeometry args={[CAB_W + 0.06, 0.1, CAB_D + 0.04]} />
        <meshStandardMaterial {...BLACK} />
      </mesh>
      <mesh position={[0, TOP_Y + 0.11, 0]}>
        <boxGeometry args={[CAB_W - 0.1, 0.02, CAB_D - 0.1]} />
        <meshStandardMaterial color="#26282d" metalness={0.3} roughness={0.5} />
      </mesh>
      {/* Uniones entre cajas. */}
      {LEVELS.slice(1).map((y) => (
        <mesh key={y} position={[0, y - GAP / 2, 0.05]}>
          <boxGeometry args={[CAB_W - 0.04, GAP + 0.01, CAB_D - 0.2]} />
          <meshStandardMaterial {...BLACK} />
        </mesh>
      ))}
    </group>
  );
}

function Pair() {
  const grille = useMemo(makeGrilleTexture, []);
  return (
    <group>
      <FloorGlow position={[0, 0.002, 0.3]} size={[6, 3]} opacity={0.5} />
      <Stack x={-SPACING} yaw={0.14} grille={grille} />
      <Stack x={SPACING} yaw={-0.14} grille={grille} />
    </group>
  );
}

export function GroundStackScene() {
  return (
    <Canvas
      frameloop="demand"
      dpr={[1, 1.75]}
      camera={{ position: [-1.9, 1.65, 6.9], fov: 40, near: 0.2, far: 60 }}
      gl={{ antialias: true, powerPreference: "high-performance" }}
    >
      <Pair />
      <Studio target={[0, 0.9, 0]} minDistance={4.5} maxDistance={14} />
    </Canvas>
  );
}
