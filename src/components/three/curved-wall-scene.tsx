"use client";

import { Canvas } from "@react-three/fiber";
import { useMemo } from "react";
import * as THREE from "three";
import {
  BLACK,
  Bars,
  FloorGlow,
  makeArtTexture,
  type Segment,
  Studio,
  type Vec3,
} from "./parts";

/* Pantalla curva: un arco concavo hacia el publico, sin tarima, apoyado en
   dos placas negras con barra vertical en cada extremo. */

/* ---------- medidas (metros) ---------- */
const RADIUS = 4;
const ARC = THREE.MathUtils.degToRad(70);
const HEIGHT = 2.4;
const THICKNESS = 0.1;
// Angulo inicial para que el arco quede centrado en -Z (frente a la camara).
const THETA_START = Math.PI - ARC / 2;
const ARC_LENGTH = RADIUS * ARC;

// Punto del arco a un angulo dado (convencion de CylinderGeometry) y radio.
const arcPoint = (theta: number, radius: number, y: number): Vec3 => [
  radius * Math.sin(theta),
  y,
  radius * Math.cos(theta),
];

// Rieles negros que siguen la curva en los bordes superior e inferior.
function buildRails(): Segment[] {
  const segments: Segment[] = [];
  const steps = 28;
  for (const y of [0.04, HEIGHT - 0.04]) {
    for (let i = 0; i < steps; i++) {
      const t0 = THETA_START + (ARC * i) / steps;
      const t1 = THETA_START + (ARC * (i + 1)) / steps;
      segments.push({
        a: arcPoint(t0, RADIUS + THICKNESS / 2, y),
        b: arcPoint(t1, RADIUS + THICKNESS / 2, y),
      });
    }
  }
  return segments;
}

const RAILS = buildRails();
const HOOK_THETAS = [0.08, 0.26, 0.44, 0.62, 0.8, 0.94].map(
  (t) => THETA_START + ARC * t,
);
const END_THETAS = [THETA_START + 0.012, THETA_START + ARC - 0.012];

// Cuerpo del panel: sector de anillo extruido a lo alto.
function useSlabGeometry() {
  return useMemo(() => {
    const shape = new THREE.Shape();
    // En el plano de la forma, el angulo "a" es theta - 90 grados.
    const a0 = THETA_START - Math.PI / 2;
    const a1 = THETA_START + ARC - Math.PI / 2;
    shape.absarc(0, 0, RADIUS + THICKNESS, a0, a1, false);
    shape.absarc(0, 0, RADIUS, a1, a0, true);
    shape.closePath();
    const geometry = new THREE.ExtrudeGeometry(shape, {
      depth: HEIGHT,
      bevelEnabled: false,
      curveSegments: 48,
    });
    geometry.rotateX(-Math.PI / 2);
    return geometry;
  }, []);
}

// Barra negra de extremo: vertical, tangente al arco, con abrazaderas,
// gancho arriba y placa en el piso.
function EndBar({ theta }: { theta: number }) {
  const position = arcPoint(theta, RADIUS + THICKNESS + 0.06, 0);
  return (
    <group position={position} rotation={[0, theta, 0]}>
      <mesh position={[0, (HEIGHT + 0.25) / 2, 0]}>
        <boxGeometry args={[0.1, HEIGHT + 0.25, 0.12]} />
        <meshStandardMaterial {...BLACK} />
      </mesh>
      <mesh position={[0, HEIGHT + 0.3, 0]}>
        <boxGeometry args={[0.05, 0.08, 0.05]} />
        <meshStandardMaterial {...BLACK} />
      </mesh>
      {[0.5, 1.05, 1.6, 2.1].map((y) => (
        <mesh key={y} position={[0, y, 0.085]}>
          <boxGeometry args={[0.14, 0.1, 0.05]} />
          <meshStandardMaterial {...BLACK} />
        </mesh>
      ))}
      <mesh position={[0, 0.02, -0.1]}>
        <boxGeometry args={[0.32, 0.04, 0.5]} />
        <meshStandardMaterial {...BLACK} />
      </mesh>
    </group>
  );
}

function Screen() {
  const texture = useMemo(() => makeArtTexture(ARC_LENGTH / HEIGHT), []);
  const slab = useSlabGeometry();
  return (
    <group position={[0, 0, RADIUS]}>
      {/* El grupo esta corrido +RADIUS en z: el piso y las luces van cerca
          de -RADIUS, donde queda la pantalla. */}
      <FloorGlow position={[0, 0.002, -RADIUS + 0.5]} size={[6, 3]} />
      <pointLight
        color="#3f7dff"
        intensity={20}
        distance={6}
        position={[-0.9, 1.4, -RADIUS + 1.2]}
      />
      <pointLight
        color="#ff3d8f"
        intensity={16}
        distance={6}
        position={[0.9, 1.4, -RADIUS + 1.2]}
      />
      <mesh geometry={slab}>
        <meshStandardMaterial
          color="#2a2c31"
          metalness={0.35}
          roughness={0.5}
        />
      </mesh>
      {/* Cara LED: la superficie interior del cilindro, vista desde el centro. */}
      <mesh position={[0, HEIGHT / 2, 0]}>
        <cylinderGeometry
          args={[
            RADIUS - 0.004,
            RADIUS - 0.004,
            HEIGHT - 0.04,
            64,
            1,
            true,
            THETA_START + 0.004,
            ARC - 0.008,
          ]}
        />
        <meshStandardMaterial
          color="#000000"
          emissive="#ffffff"
          emissiveMap={texture}
          emissiveIntensity={1.15}
          roughness={0.5}
          metalness={0}
          side={THREE.BackSide}
        />
      </mesh>
      <Bars segments={RAILS} radius={0.028} material={BLACK} />
      {HOOK_THETAS.map((theta) => (
        <mesh
          key={theta}
          position={arcPoint(theta, RADIUS + THICKNESS / 2, HEIGHT + 0.03)}
          rotation={[0, theta, 0]}
        >
          <boxGeometry args={[0.06, 0.06, 0.08]} />
          <meshStandardMaterial {...BLACK} />
        </mesh>
      ))}
      {END_THETAS.map((theta) => (
        <EndBar key={theta} theta={theta} />
      ))}
    </group>
  );
}

export function CurvedWallScene() {
  return (
    <Canvas
      frameloop="demand"
      dpr={[1, 1.75]}
      camera={{ position: [-5.2, 3.3, 6.6], fov: 38, near: 0.3, far: 60 }}
      gl={{ antialias: true, powerPreference: "high-performance" }}
    >
      <Screen />
      <Studio target={[0, 1.2, 0]} minDistance={4.5} maxDistance={16} />
    </Canvas>
  );
}
