"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { makeLandscapeTexture } from "./landscape";
import {
  BLACK,
  Deck,
  FloorGlow,
  makeGlowTexture,
  Panel,
  Studio,
  type Vec3,
} from "./parts";

/* Circuito cerrado: pantalla ancha sobre tarima al centro y una individual a
   cada lado, las tres con el mismo paisaje; un switcher al frente reparte
   la senal por cables tendidos en el piso, con pulsos de luz viajando.
   Sin bocinas. */

/* ---------- medidas (metros) ---------- */
const CENTER_DECK_W = 6;
const CENTER_DECK_D = 0.6;
const LEG_H = 0.6;
const DECK_TOP = LEG_H + 0.12;
const CENTER_SCREEN_W = 5.6;
const CENTER_SCREEN_H = 2.2;

const SIDE_X = 6.0;
const SIDE_Z = 1.4;
const SIDE_YAW = 0.42;
const SIDE_DECK_W = 4;
const SIDE_DECK_D = 1;
const SIDE_SCREEN_W = 3.6;
const SIDE_SCREEN_H = 1.8;
const SIDE_SCREEN_Z = -0.12;

const HUB: Vec3 = [0, 0, 4.2];

// Recorrido de cada cable, del switcher a cada pantalla, con curvas suaves.
const CABLE_POINTS: Vec3[][] = [
  [
    [-0.25, 0.03, 4.0],
    [-0.9, 0.03, 3.4],
    [-1.4, 0.03, 2.2],
    [-1.2, 0.03, 1.0],
    [-0.8, 0.03, 0.35],
  ],
  [
    [0.25, 0.03, 4.0],
    [1.6, 0.03, 3.6],
    [3.4, 0.03, 3.1],
    [4.8, 0.03, 2.5],
    [5.5, 0.03, 1.9],
  ],
  [
    [-0.3, 0.03, 4.1],
    [-1.8, 0.03, 3.9],
    [-3.6, 0.03, 3.3],
    [-4.9, 0.03, 2.6],
    [-5.5, 0.03, 1.9],
  ],
];
const PULSE_IDS = ["primero", "segundo", "tercero"];
const PULSES_PER_CABLE = PULSE_IDS.length;
const PULSE_COLOR = "#8fd3ff";

// Tubo negro del cable, un halo tenue encima y pulsos que lo recorren.
function Cable({
  points,
  glowMap,
}: {
  points: Vec3[];
  glowMap: THREE.Texture;
}) {
  const curve = useMemo(
    () =>
      new THREE.CatmullRomCurve3(
        points.map((p) => new THREE.Vector3(...p)),
        false,
        "catmullrom",
        0.4,
      ),
    [points],
  );
  const pulses = useRef<(THREE.Sprite | null)[]>([]);
  const tails = useRef<(THREE.Sprite | null)[]>([]);
  const point = useMemo(() => new THREE.Vector3(), []);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    for (let i = 0; i < PULSES_PER_CABLE; i++) {
      const progress = (t * 0.16 + i / PULSES_PER_CABLE) % 1;
      const pulse = pulses.current[i];
      const tail = tails.current[i];
      if (pulse) {
        curve.getPointAt(progress, point);
        pulse.position.set(point.x, point.y + 0.02, point.z);
      }
      if (tail) {
        curve.getPointAt(Math.max(progress - 0.035, 0), point);
        tail.position.set(point.x, point.y + 0.02, point.z);
        tail.visible = progress > 0.04;
      }
    }
  });

  return (
    <group>
      <mesh>
        <tubeGeometry args={[curve, 64, 0.022, 8, false]} />
        <meshStandardMaterial color="#141517" metalness={0.2} roughness={0.7} />
      </mesh>
      <mesh>
        <tubeGeometry args={[curve, 64, 0.045, 8, false]} />
        <meshBasicMaterial
          color={PULSE_COLOR}
          transparent
          opacity={0.14}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
      {PULSE_IDS.map((id, i) => (
        <group key={id}>
          <sprite
            ref={(element) => {
              pulses.current[i] = element;
            }}
            scale={[0.62, 0.62, 1]}
          >
            <spriteMaterial
              map={glowMap}
              color={PULSE_COLOR}
              transparent
              opacity={0.95}
              depthWrite={false}
              blending={THREE.AdditiveBlending}
            />
          </sprite>
          <sprite
            ref={(element) => {
              tails.current[i] = element;
            }}
            scale={[0.42, 0.42, 1]}
          >
            <spriteMaterial
              map={glowMap}
              color={PULSE_COLOR}
              transparent
              opacity={0.4}
              depthWrite={false}
              blending={THREE.AdditiveBlending}
            />
          </sprite>
        </group>
      ))}
    </group>
  );
}

// Switcher de video: estuche negro con tapa clara y luz de estado.
function Hub() {
  return (
    <group position={HUB}>
      <mesh position={[0, 0.16, 0]}>
        <boxGeometry args={[0.7, 0.32, 0.5]} />
        <meshStandardMaterial {...BLACK} />
      </mesh>
      <mesh position={[0, 0.33, 0]}>
        <boxGeometry args={[0.62, 0.02, 0.42]} />
        <meshStandardMaterial color="#26282d" metalness={0.5} roughness={0.4} />
      </mesh>
      <mesh position={[0.24, 0.35, 0.12]}>
        <boxGeometry args={[0.05, 0.01, 0.05]} />
        <meshStandardMaterial
          color={PULSE_COLOR}
          emissive={PULSE_COLOR}
          emissiveIntensity={2}
          toneMapped={false}
        />
      </mesh>
    </group>
  );
}

// Pantalla individual con su tarima, girada hacia el centro.
function SideScreen({
  side,
  texture,
}: {
  side: 1 | -1;
  texture: THREE.Texture;
}) {
  return (
    <group
      position={[side * SIDE_X, 0, SIDE_Z]}
      rotation={[0, -side * SIDE_YAW, 0]}
    >
      <Deck
        width={SIDE_DECK_W}
        depth={SIDE_DECK_D}
        legHeight={LEG_H}
        legsX={[-1.95, 0, 1.95]}
        round
        seams={[0]}
      />
      <Panel
        x={0}
        y={DECK_TOP + 0.06 + SIDE_SCREEN_H / 2}
        z={SIDE_SCREEN_Z}
        width={SIDE_SCREEN_W}
        height={SIDE_SCREEN_H}
        texture={texture}
        span={SIDE_SCREEN_W}
      />
      {/* Barras traseras negras con pie en escuadra. */}
      {[-1, 1].map((x) => (
        <group
          key={x}
          position={[x * (SIDE_SCREEN_W / 2 - 0.1), 0, SIDE_SCREEN_Z - 0.11]}
        >
          <mesh position={[0, DECK_TOP + (SIDE_SCREEN_H + 0.3) / 2, 0]}>
            <boxGeometry args={[0.09, SIDE_SCREEN_H + 0.3, 0.12]} />
            <meshStandardMaterial {...BLACK} />
          </mesh>
          <mesh position={[0, DECK_TOP + 0.015, 0.25]}>
            <boxGeometry args={[0.16, 0.03, 0.6]} />
            <meshStandardMaterial {...BLACK} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function Stage() {
  const centerArt = useMemo(
    () => makeLandscapeTexture(CENTER_SCREEN_W / CENTER_SCREEN_H),
    [],
  );
  const sideArt = useMemo(
    () => makeLandscapeTexture(SIDE_SCREEN_W / SIDE_SCREEN_H),
    [],
  );
  const glowMap = useMemo(makeGlowTexture, []);
  return (
    <group>
      <FloorGlow position={[0, 0.002, 1.2]} size={[18, 8]} opacity={0.35} />
      <pointLight
        color="#e9955c"
        intensity={40}
        distance={9}
        position={[0, 2, 1.5]}
      />

      {/* Pantalla ancha al centro, sobre su tarima. */}
      <Deck
        width={CENTER_DECK_W}
        depth={CENTER_DECK_D}
        legHeight={LEG_H}
        legsX={[-2.95, -1.75, -0.6, 0.6, 1.75, 2.95]}
        seams={[-1.8, -0.6, 0.6, 1.8]}
      />
      <Panel
        x={0}
        y={DECK_TOP + 0.02 + CENTER_SCREEN_H / 2}
        z={0}
        width={CENTER_SCREEN_W}
        height={CENTER_SCREEN_H}
        texture={centerArt}
        span={CENTER_SCREEN_W}
      />
      {[-1, 1].map((side) => (
        <mesh
          key={side}
          position={[
            side * (CENTER_SCREEN_W / 2 + 0.06),
            DECK_TOP + 0.02 + CENTER_SCREEN_H / 2,
            -0.02,
          ]}
        >
          <boxGeometry args={[0.1, CENTER_SCREEN_H + 0.06, 0.16]} />
          <meshStandardMaterial {...BLACK} />
        </mesh>
      ))}

      <SideScreen side={-1} texture={sideArt} />
      <SideScreen side={1} texture={sideArt} />

      <Hub />
      {CABLE_POINTS.map((points) => (
        <Cable
          key={points[points.length - 1].join(",")}
          points={points}
          glowMap={glowMap}
        />
      ))}
    </group>
  );
}

export function CircuitScene() {
  // Solo anima mientras el lienzo esta a la vista.
  const wrapper = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);

  useEffect(() => {
    const element = wrapper.current;
    if (!element) return;
    const observer = new IntersectionObserver(
      ([entry]) => setActive(entry.isIntersecting),
      { threshold: 0.1 },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={wrapper} style={{ width: "100%", height: "100%" }}>
      <Canvas
        frameloop={active ? "always" : "demand"}
        dpr={[1, 1.75]}
        camera={{ position: [-5.6, 5.3, 16.5], fov: 38, near: 0.3, far: 90 }}
        gl={{ antialias: true, powerPreference: "high-performance" }}
      >
        <Stage />
        <Studio target={[0, 1.3, 1.2]} minDistance={10} maxDistance={30} />
      </Canvas>
    </div>
  );
}
