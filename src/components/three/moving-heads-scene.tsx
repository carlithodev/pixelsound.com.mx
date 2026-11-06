"use client";

import { Instance, Instances } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import {
  ALUMINUM,
  BLACK,
  Bars,
  boxTruss,
  FloorGlow,
  type Segment,
  Studio,
  type Vec3,
} from "./parts";

/* Iluminacion: portico de truss cuadrado con cinco cabezas moviles encima,
   cada una con su haz de luz suave que barre despacio el aire. */

/* ---------- medidas (metros) ---------- */
const TRUSS = 0.29;
const TOWER_X = 3.4;
const TOWER_BOTTOM = 0.2;
const TOWER_TOP = 4.4;
const BEAM_Y = TOWER_TOP + TRUSS / 2 + 0.02;
const BASE = 1.1;
const HEAD_X = [-2.6, -1.3, 0, 1.3, 2.6];
const HEAD_Y = BEAM_Y + TRUSS / 2;

// Colores por cabeza: blanco frio y los tonos del arte, apagados.
const BEAM_COLORS = ["#dfe8ff", "#ff4f9a", "#dfe8ff", "#5a86ff", "#dfe8ff"];

function buildStructure(): Segment[] {
  const segments: Segment[] = [];
  for (const side of [-1, 1]) {
    const x = side * TOWER_X;
    segments.push(
      ...boxTruss([x, TOWER_BOTTOM, 0], [x, TOWER_TOP, 0], TRUSS, 0.36),
    );
    // Tirantes de la placa a la torre, hacia adentro y hacia afuera.
    for (const sx of [-1, 1]) {
      segments.push({
        a: [x + (sx * BASE) / 2, 0.08, 0],
        b: [x + (sx * TRUSS) / 2, 1.0, 0],
      });
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
const FEET: Vec3[] = [-1, 1].flatMap((side) =>
  [-1, 1].flatMap((sx) =>
    [-1, 1].map((sz): Vec3 => [
      side * TOWER_X + (sx * BASE) / 2,
      0.03,
      (sz * BASE) / 2.4,
    ]),
  ),
);

const BEAM_LENGTH = 9;

// Haz volumetrico: se apaga a lo largo del cono y en sus bordes (segun el
// angulo con la camara), asi no tiene silueta dura.
const BEAM_VERTEX = /* glsl */ `
  varying float vAlong;
  varying vec3 vNormal;
  uniform float uLength;
  void main() {
    vAlong = (position.y + uLength * 0.5) / uLength;
    vNormal = normalize(normalMatrix * normal);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const BEAM_FRAGMENT = /* glsl */ `
  varying float vAlong;
  varying vec3 vNormal;
  uniform vec3 uColor;
  uniform float uOpacity;
  uniform float uAnglePower;
  void main() {
    float along = pow(1.0 - vAlong, 1.7);
    float edge = pow(abs(dot(normalize(vNormal), vec3(0.0, 0.0, 1.0))), uAnglePower);
    // Arranque suave junto a la lente.
    float start = smoothstep(0.0, 0.06, vAlong);
    float alpha = along * edge * start * uOpacity;
    gl_FragColor = vec4(uColor, alpha);
  }
`;

// Los haces repiten color: cada material se arma una vez y se comparte.
const BEAM_MATERIALS = new Map<string, THREE.ShaderMaterial>();

function makeBeamMaterial(color: string, opacity: number, anglePower: number) {
  const key = `${color}|${opacity}|${anglePower}`;
  const hit = BEAM_MATERIALS.get(key);
  if (hit) return hit;
  const material = buildBeamMaterial(color, opacity, anglePower);
  BEAM_MATERIALS.set(key, material);
  return material;
}

function buildBeamMaterial(color: string, opacity: number, anglePower: number) {
  return new THREE.ShaderMaterial({
    uniforms: {
      uColor: { value: new THREE.Color(color) },
      uOpacity: { value: opacity },
      uAnglePower: { value: anglePower },
      uLength: { value: BEAM_LENGTH },
    },
    vertexShader: BEAM_VERTEX,
    fragmentShader: BEAM_FRAGMENT,
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
    blending: THREE.AdditiveBlending,
  });
}

// Gobos: dibujos que proyectan algunas cabezas en el piso (alfa = luz).
type Gobo = "dots" | "rings" | "breakup";

// Un dibujo por tipo, compartido entre cabezas.
const GOBO_CACHE = new Map<Gobo, THREE.CanvasTexture>();

function makeGoboTexture(kind: Gobo) {
  const hit = GOBO_CACHE.get(kind);
  if (hit) return hit;
  const texture = buildGoboTexture(kind);
  GOBO_CACHE.set(kind, texture);
  return texture;
}

function buildGoboTexture(kind: Gobo) {
  const size = 512;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const context = canvas.getContext("2d");
  if (context) {
    context.clearRect(0, 0, size, size);
    context.fillStyle = "#ffffff";
    if (kind === "dots") {
      const n = 9;
      const step = size / n;
      for (let i = 0; i < n; i++) {
        for (let j = 0; j < n; j++) {
          const cx = step * (i + 0.5);
          const cy = step * (j + 0.5);
          // Solo dentro del circulo del haz.
          if (Math.hypot(cx - size / 2, cy - size / 2) > size * 0.44) continue;
          context.beginPath();
          context.arc(cx, cy, step * 0.24, 0, Math.PI * 2);
          context.fill();
        }
      }
    } else if (kind === "rings") {
      context.lineWidth = 16;
      context.strokeStyle = "#ffffff";
      for (const radius of [60, 120, 180]) {
        context.beginPath();
        context.arc(size / 2, size / 2, radius, 0, Math.PI * 2);
        context.stroke();
      }
      context.beginPath();
      context.arc(size / 2, size / 2, 22, 0, Math.PI * 2);
      context.fill();
    } else {
      // Manchas irregulares, deterministas.
      for (let i = 0; i < 26; i++) {
        const angle = i * 2.399;
        const radius = 40 + ((i * 37) % 170);
        const cx = size / 2 + Math.cos(angle) * radius;
        const cy = size / 2 + Math.sin(angle) * radius;
        const r = 14 + ((i * 53) % 26);
        context.beginPath();
        context.ellipse(cx, cy, r, r * 0.7, angle, 0, Math.PI * 2);
        context.fill();
      }
    }
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

// Brillo suave de la lente.
function makeGlowTexture() {
  const size = 128;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const context = canvas.getContext("2d");
  if (context) {
    const gradient = context.createRadialGradient(
      size / 2,
      size / 2,
      0,
      size / 2,
      size / 2,
      size / 2,
    );
    gradient.addColorStop(0, "rgba(255,255,255,0.9)");
    gradient.addColorStop(0.3, "rgba(255,255,255,0.35)");
    gradient.addColorStop(1, "rgba(255,255,255,0)");
    context.fillStyle = gradient;
    context.fillRect(0, 0, size, size);
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

type HeadProps = {
  x: number;
  index: number;
  color: string;
  glowMap: THREE.Texture;
  /* Con gobo, la cabeza proyecta el dibujo en el piso y apunta mas abajo. */
  gobo?: THREE.Texture;
};

// Cabeza movil sobre la viga: base, horquilla que panea y cabeza que
// inclina; del lente sale el haz (nucleo + halo) y un brillo.
function LightHead({ x, index, color, glowMap, gobo }: HeadProps) {
  const yoke = useRef<THREE.Group>(null);
  const head = useRef<THREE.Group>(null);
  const spot = useRef<THREE.Mesh>(null);
  const pool = useRef<THREE.Mesh>(null);
  const phase = index * 1.3;
  const lensPosition = useMemo(() => new THREE.Vector3(), []);
  const direction = useMemo(() => new THREE.Vector3(), []);
  const core = useMemo(() => makeBeamMaterial(color, 0.7, 2.2), [color]);
  const halo = useMemo(() => makeBeamMaterial(color, 0.28, 4.5), [color]);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    // Barrido lento: las de gobo se quedan sobre el piso; las demas van de
    // apuntar al publico a apuntar al cielo.
    if (yoke.current) {
      yoke.current.rotation.y = Math.sin(t * 0.3 + phase) * (gobo ? 0.6 : 0.5);
    }
    if (head.current) {
      head.current.rotation.x = gobo
        ? 0.95 + Math.sin(t * 0.24 + phase * 0.7) * 0.28
        : 0.15 + Math.sin(t * 0.22 + phase * 0.7) * 0.95;
    }
    // El dibujo del gobo se pinta donde el haz corta el piso, estirado
    // segun el angulo de incidencia y mas tenue cuanto mas lejos.
    if (gobo && head.current && spot.current && pool.current) {
      head.current.updateWorldMatrix(true, false);
      lensPosition.setFromMatrixPosition(head.current.matrixWorld);
      head.current.getWorldDirection(direction);
      const visible = direction.y < -0.12;
      spot.current.visible = visible;
      pool.current.visible = visible;
      if (visible) {
        const distance = -lensPosition.y / direction.y;
        const radius = distance * 0.15;
        const strength =
          THREE.MathUtils.clamp(1.2 - distance / 16, 0.3, 0.95) * -direction.y;
        for (const [mesh, scale, opacity] of [
          [spot.current, 1, strength],
          [pool.current, 1.9, strength * 0.45],
        ] as const) {
          mesh.position.set(
            lensPosition.x + direction.x * distance,
            0.01,
            lensPosition.z + direction.z * distance,
          );
          mesh.rotation.set(
            -Math.PI / 2,
            0,
            Math.atan2(-direction.x, -direction.z),
          );
          mesh.scale.set(
            radius * 2 * scale,
            ((radius * 2) / -direction.y) * scale,
            1,
          );
          (mesh.material as THREE.MeshBasicMaterial).opacity = opacity;
        }
      }
    }
  });

  return (
    <group>
      {gobo && (
        <>
          {/* Charco de luz suave y, encima, el dibujo del gobo. */}
          <mesh ref={pool} visible={false}>
            <planeGeometry args={[1, 1]} />
            <meshBasicMaterial
              map={glowMap}
              color={color}
              transparent
              depthWrite={false}
              blending={THREE.AdditiveBlending}
            />
          </mesh>
          <mesh ref={spot} visible={false}>
            <planeGeometry args={[1, 1]} />
            <meshBasicMaterial
              map={gobo}
              color={color}
              transparent
              depthWrite={false}
              blending={THREE.AdditiveBlending}
            />
          </mesh>
        </>
      )}
      <group position={[x, HEAD_Y, 0]}>
        <mesh position={[0, 0.05, 0]}>
          <boxGeometry args={[0.3, 0.1, 0.24]} />
          <meshStandardMaterial {...BLACK} />
        </mesh>
        {/* Abrazadera a la viga. */}
        <mesh position={[0, -0.12, 0]}>
          <boxGeometry args={[0.12, 0.22, 0.14]} />
          <meshStandardMaterial {...BLACK} />
        </mesh>
        <group ref={yoke} position={[0, 0.1, 0]}>
          {[-0.17, 0.17].map((side) => (
            <mesh key={side} position={[side, 0.24, 0]}>
              <boxGeometry args={[0.04, 0.4, 0.12]} />
              <meshStandardMaterial {...BLACK} />
            </mesh>
          ))}
          <group ref={head} position={[0, 0.36, 0]}>
            <mesh rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.13, 0.15, 0.4, 24]} />
              <meshStandardMaterial {...BLACK} />
            </mesh>
            <mesh position={[0, 0, 0.205]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.1, 0.1, 0.02, 24]} />
              <meshStandardMaterial
                color={color}
                emissive={color}
                emissiveIntensity={2.2}
                toneMapped={false}
              />
            </mesh>
            <sprite position={[0, 0, 0.24]} scale={[0.7, 0.7, 1]}>
              <spriteMaterial
                map={glowMap}
                color={color}
                transparent
                opacity={0.7}
                depthWrite={false}
                blending={THREE.AdditiveBlending}
              />
            </sprite>
            {/* Haz: nucleo estrecho y halo ancho con el shader volumetrico. */}
            <mesh
              material={core}
              position={[0, 0, 0.22 + BEAM_LENGTH / 2]}
              rotation={[Math.PI / 2, 0, 0]}
            >
              <cylinderGeometry args={[0.5, 0.08, BEAM_LENGTH, 48, 1, true]} />
            </mesh>
            <mesh
              material={halo}
              position={[0, 0, 0.22 + BEAM_LENGTH / 2]}
              rotation={[Math.PI / 2, 0, 0]}
            >
              <cylinderGeometry args={[1.25, 0.11, BEAM_LENGTH, 48, 1, true]} />
            </mesh>
          </group>
        </group>
      </group>
    </group>
  );
}

// Que cabezas llevan gobo y cual.
const GOBOS: (Gobo | undefined)[] = [
  "dots",
  undefined,
  "rings",
  undefined,
  "breakup",
];

function Rig() {
  const glowMap = useMemo(makeGlowTexture, []);
  const gobos = useMemo(
    () => ({
      dots: makeGoboTexture("dots"),
      rings: makeGoboTexture("rings"),
      breakup: makeGoboTexture("breakup"),
    }),
    [],
  );
  return (
    <group>
      <FloorGlow position={[0, 0.003, 2.5]} size={[14, 7]} opacity={0.25} />
      <Bars segments={STRUCTURE} radius={0.024} material={ALUMINUM} />
      {[-1, 1].map((side) => (
        <group key={side}>
          {/* Placa negra, cubo de esquina y esquineros de la viga. */}
          <mesh position={[side * TOWER_X, 0.09, 0]}>
            <boxGeometry args={[BASE, 0.06, BASE / 1.2]} />
            <meshStandardMaterial {...BLACK} />
          </mesh>
          <mesh position={[side * TOWER_X, BEAM_Y, 0]}>
            <boxGeometry args={[TRUSS + 0.06, TRUSS + 0.06, TRUSS + 0.06]} />
            <meshStandardMaterial {...ALUMINUM} />
          </mesh>
          <mesh position={[side * TOWER_X, 0.22, 0]}>
            <boxGeometry args={[TRUSS + 0.08, 0.06, TRUSS + 0.08]} />
            <meshStandardMaterial {...ALUMINUM} />
          </mesh>
        </group>
      ))}
      <Instances limit={FEET.length}>
        <cylinderGeometry args={[0.06, 0.07, 0.06, 16]} />
        <meshStandardMaterial {...BLACK} />
        {FEET.map((foot) => (
          <Instance key={foot.join(",")} position={foot} />
        ))}
      </Instances>
      {HEAD_X.map((x, index) => (
        <LightHead
          key={x}
          x={x}
          index={index}
          color={BEAM_COLORS[index]}
          glowMap={glowMap}
          gobo={GOBOS[index] ? gobos[GOBOS[index]] : undefined}
        />
      ))}
    </group>
  );
}

export function MovingHeadsScene() {
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
        camera={{ position: [-3.8, 5.2, 16.5], fov: 42, near: 0.3, far: 80 }}
        gl={{ antialias: true, powerPreference: "high-performance" }}
      >
        <Rig />
        <Studio target={[0, 3.4, 0]} minDistance={9} maxDistance={30} />
      </Canvas>
    </div>
  );
}
