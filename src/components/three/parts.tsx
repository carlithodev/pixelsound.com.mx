"use client";

import {
  Environment,
  Instance,
  Instances,
  Lightformer,
  OrbitControls,
} from "@react-three/drei";
import { useMemo } from "react";
import * as THREE from "three";

/* Piezas y utilidades que comparten los modelos de pantallas. */

export type Vec3 = [number, number, number];
export type Segment = { a: Vec3; b: Vec3 };

export const ALUMINUM = { color: "#e2e4e8", metalness: 0.8, roughness: 0.38 };
export const BLACK = { color: "#111214", metalness: 0.3, roughness: 0.6 };

/* ---------- generadores de segmentos ---------- */
export const lerp = (a: Vec3, b: Vec3, t: number): Vec3 => [
  a[0] + (b[0] - a[0]) * t,
  a[1] + (b[1] - a[1]) * t,
  a[2] + (b[2] - a[2]) * t,
];
export const shift = (p: Vec3, o: Vec3): Vec3 => [
  p[0] + o[0],
  p[1] + o[1],
  p[2] + o[2],
];

// Truss de escalera: dos cuerdas paralelas y diagonales en zigzag.
export function ladder(
  from: Vec3,
  to: Vec3,
  offset: Vec3,
  step: number,
): Segment[] {
  const segments: Segment[] = [
    { a: from, b: to },
    { a: shift(from, offset), b: shift(to, offset) },
    { a: from, b: shift(from, offset) },
    { a: to, b: shift(to, offset) },
  ];
  const length = Math.hypot(to[0] - from[0], to[1] - from[1], to[2] - from[2]);
  const count = Math.max(1, Math.round(length / step));
  let previous = from;
  for (let i = 1; i <= count; i++) {
    const point = lerp(from, to, i / count);
    const next = i % 2 === 1 ? shift(point, offset) : point;
    segments.push({ a: previous, b: next });
    previous = next;
  }
  return segments;
}

// Cruceta entre dos patas, entre las alturas dadas.
export function cross(a: Vec3, b: Vec3, low: number, high: number): Segment[] {
  return [
    { a: [a[0], low, a[2]], b: [b[0], high, b[2]] },
    { a: [a[0], high, a[2]], b: [b[0], low, b[2]] },
  ];
}

// Truss cuadrado: cuatro cuerdas y zigzag en las cuatro caras, a lo largo
// de un eje x o y.
export function boxTruss(
  a: Vec3,
  b: Vec3,
  size: number,
  step: number,
): Segment[] {
  const alongY = Math.abs(b[1] - a[1]) > Math.abs(b[0] - a[0]);
  const u: Vec3 = alongY ? [size, 0, 0] : [0, size, 0];
  const v: Vec3 = [0, 0, size];
  const half = (w: Vec3, sign: number): Vec3 => [
    (w[0] * sign) / 2,
    (w[1] * sign) / 2,
    (w[2] * sign) / 2,
  ];
  const corner = (p: Vec3, su: number, sv: number) =>
    shift(shift(p, half(u, su)), half(v, sv));
  return [
    ...ladder(corner(a, -1, -1), corner(b, -1, -1), u, step),
    ...ladder(corner(a, -1, 1), corner(b, -1, 1), u, step),
    ...ladder(corner(a, -1, -1), corner(b, -1, -1), v, step),
    ...ladder(corner(a, 1, -1), corner(b, 1, -1), v, step),
  ];
}

/* ---------- tubos instanciados ---------- */
const UP = new THREE.Vector3(0, 1, 0);

function segmentTransform({ a, b }: Segment) {
  const start = new THREE.Vector3(...a);
  const end = new THREE.Vector3(...b);
  const direction = end.clone().sub(start);
  const length = direction.length();
  const rotation = new THREE.Euler().setFromQuaternion(
    new THREE.Quaternion().setFromUnitVectors(UP, direction.normalize()),
  );
  const middle = start.add(end).multiplyScalar(0.5);
  return {
    key: `${a.join(",")}|${b.join(",")}`,
    position: [middle.x, middle.y, middle.z] as Vec3,
    rotation: [rotation.x, rotation.y, rotation.z] as Vec3,
    length,
  };
}

type BarsProps = {
  segments: Segment[];
  radius: number;
  material: { color: string; metalness: number; roughness: number };
  square?: boolean;
};

// Todos los tubos de un mismo material en una sola llamada de dibujo.
export function Bars({
  segments,
  radius,
  material,
  square = false,
}: BarsProps) {
  // Las cuerdas compartidas entre caras de un truss llegan repetidas: se
  // dejan una sola vez.
  const items = useMemo(() => {
    const seen = new Set<string>();
    return segments.map(segmentTransform).filter((item) => {
      if (seen.has(item.key)) return false;
      seen.add(item.key);
      return true;
    });
  }, [segments]);
  return (
    <Instances limit={items.length} range={items.length}>
      {square ? (
        <boxGeometry args={[radius * 2, 1, radius * 2]} />
      ) : (
        <cylinderGeometry args={[radius, radius, 1, 10]} />
      )}
      <meshStandardMaterial {...material} />
      {items.map((item) => (
        <Instance
          key={item.key}
          position={item.position}
          rotation={item.rotation}
          scale={[1, item.length, 1]}
        />
      ))}
    </Instances>
  );
}

/* ---------- cache de texturas ----------
   Dibujar un lienzo 2D grande cuesta; se guarda el resultado por clave y se
   reutiliza. Para ajustar repeticion u offset, clonar: el clon comparte la
   imagen, asi que no vuelve a subirse a la GPU. */
const TEXTURE_CACHE = new Map<string, THREE.CanvasTexture>();

function cachedTexture(key: string, build: () => THREE.CanvasTexture) {
  const hit = TEXTURE_CACHE.get(key);
  if (hit) return hit;
  const texture = build();
  TEXTURE_CACHE.set(key, texture);
  return texture;
}

/* ---------- arte de las pantallas ---------- */
const ART_W = 1280;

type Ribbon = {
  points: [number, number][];
  colors: [string, string];
};

// Cintas de luz azul y magenta cruzandose sobre negro, en coordenadas 0..1.
const RIBBONS: Ribbon[] = [
  {
    points: [
      [-0.05, 0.78],
      [0.18, 0.62],
      [0.38, 0.28],
      [0.6, 0.42],
      [0.82, 0.2],
      [1.05, 0.34],
    ],
    colors: ["#2b5cff", "#38d8ff"],
  },
  {
    points: [
      [-0.05, 0.3],
      [0.2, 0.44],
      [0.42, 0.74],
      [0.62, 0.58],
      [0.84, 0.82],
      [1.05, 0.66],
    ],
    colors: ["#ff2d8f", "#ff7a3d"],
  },
  {
    points: [
      [-0.05, 0.9],
      [0.25, 0.8],
      [0.5, 0.5],
      [0.72, 0.62],
      [1.05, 0.52],
    ],
    colors: ["#7a3dff", "#ff3d7a"],
  },
];

// Curva suave (Catmull-Rom) por los puntos dados.
function tracePath(
  context: CanvasRenderingContext2D,
  points: [number, number][],
  width: number,
  height: number,
) {
  const px = points.map(([x, y]): [number, number] => [x * width, y * height]);
  context.beginPath();
  context.moveTo(px[0][0], px[0][1]);
  for (let i = 0; i < px.length - 1; i++) {
    const p0 = px[Math.max(i - 1, 0)];
    const p1 = px[i];
    const p2 = px[i + 1];
    const p3 = px[Math.min(i + 2, px.length - 1)];
    context.bezierCurveTo(
      p1[0] + (p2[0] - p0[0]) / 6,
      p1[1] + (p2[1] - p0[1]) / 6,
      p2[0] - (p3[0] - p1[0]) / 6,
      p2[1] - (p3[1] - p1[1]) / 6,
      p2[0],
      p2[1],
    );
  }
}

// Arte continuo para un muro de proporcion ancho/alto dada; cada panel
// muestra su recorte. Incluye reticula fina de pixeles.
export function makeArtTexture(aspect: number) {
  return cachedTexture(`art:${aspect.toFixed(3)}`, () =>
    buildArtTexture(aspect),
  );
}

function buildArtTexture(aspect: number) {
  const width = ART_W;
  const height = Math.round(ART_W / aspect);
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  if (context) {
    context.fillStyle = "#040407";
    context.fillRect(0, 0, width, height);
    context.lineCap = "round";
    context.globalCompositeOperation = "lighter";
    const scale = height / 512;

    for (const ribbon of RIBBONS) {
      const gradient = context.createLinearGradient(0, 0, width, 0);
      gradient.addColorStop(0, ribbon.colors[0]);
      gradient.addColorStop(1, ribbon.colors[1]);
      context.strokeStyle = gradient;
      context.shadowColor = ribbon.colors[0];
      // Varias pasadas: halo ancho y tenue, nucleo fino y brillante.
      const passes: [number, number, number][] = [
        [110, 0.05, 60],
        [56, 0.1, 40],
        [26, 0.22, 24],
        [10, 0.55, 12],
        [3.5, 0.95, 4],
      ];
      for (const [lineWidth, alpha, blur] of passes) {
        context.lineWidth = lineWidth * scale;
        context.globalAlpha = alpha;
        context.shadowBlur = blur * scale;
        tracePath(context, ribbon.points, width, height);
        context.stroke();
      }
      // Hilos paralelos, mas finos, desplazados unos pixeles.
      for (const offset of [-18, 14, 30]) {
        context.lineWidth = 1.6 * scale;
        context.globalAlpha = 0.5;
        context.shadowBlur = 6 * scale;
        tracePath(
          context,
          ribbon.points.map(([x, y]): [number, number] => [
            x,
            y + (offset * scale) / height,
          ]),
          width,
          height,
        );
        context.stroke();
      }
    }

    context.globalAlpha = 1;
    context.shadowBlur = 0;
    context.globalCompositeOperation = "source-over";

    // Reticula de pixeles: se percibe al acercar la camara.
    context.fillStyle = "rgba(0,0,0,0.3)";
    for (let x = 0; x < width; x += 6) context.fillRect(x, 0, 1, height);
    for (let y = 0; y < height; y += 6) context.fillRect(0, y, width, 1);
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;
  return texture;
}

// Resplandor en el piso, bajo el muro, con los colores del arte.
export function makeGlowTexture() {
  return cachedTexture("glow", buildGlowTexture);
}

function buildGlowTexture() {
  const size = 512;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const context = canvas.getContext("2d");
  if (context) {
    const glow = context.createRadialGradient(
      size / 2,
      size / 2,
      0,
      size / 2,
      size / 2,
      size / 2,
    );
    glow.addColorStop(0, "rgba(120,80,255,0.42)");
    glow.addColorStop(0.45, "rgba(255,60,140,0.18)");
    glow.addColorStop(1, "rgba(255,60,140,0)");
    context.fillStyle = glow;
    context.fillRect(0, 0, size, size);
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

/* ---------- rejilla de bocina ---------- */
// Rejilla del bafle: retícula de perforaciones sobre negro.
export function makeGrilleTexture() {
  return cachedTexture("grille", buildGrilleTexture);
}

function buildGrilleTexture() {
  const size = 256;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const context = canvas.getContext("2d");
  if (context) {
    context.fillStyle = "#34363c";
    context.fillRect(0, 0, size, size);
    context.fillStyle = "#101114";
    const step = 8;
    for (let y = 0; y < size; y += step) {
      for (let x = 0; x < size; x += step) {
        const offset = (y / step) % 2 === 0 ? 0 : step / 2;
        context.beginPath();
        context.arc(x + offset + step / 2, y + step / 2, 2.6, 0, Math.PI * 2);
        context.fill();
      }
    }
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;
  return texture;
}

/* ---------- panel LED ---------- */
type PanelProps = {
  x: number;
  y: number;
  z: number;
  width: number;
  height: number;
  texture: THREE.Texture;
  /* Ancho total del muro que cubre el arte y su centro en x. */
  span: number;
  spanCenter?: number;
};

// Cuerpo oscuro con marco de 2 cm y cara emisiva con su recorte del arte.
export function Panel({
  x,
  y,
  z,
  width,
  height,
  texture,
  span,
  spanCenter = 0,
}: PanelProps) {
  const map = useMemo(() => {
    const clone = texture.clone();
    clone.repeat.set(width / span, 1);
    clone.offset.set((x - width / 2 - spanCenter + span / 2) / span, 0);
    clone.needsUpdate = true;
    return clone;
  }, [texture, width, x, span, spanCenter]);
  return (
    <group position={[x, y, z]}>
      <mesh>
        <boxGeometry args={[width, height, 0.1]} />
        <meshStandardMaterial
          color="#2a2c31"
          metalness={0.35}
          roughness={0.5}
        />
      </mesh>
      <mesh position={[0, 0, 0.051]}>
        <planeGeometry args={[width - 0.04, height - 0.04]} />
        <meshStandardMaterial
          color="#000000"
          emissive="#ffffff"
          emissiveMap={map}
          emissiveIntensity={1.15}
          roughness={0.5}
          metalness={0}
        />
      </mesh>
    </group>
  );
}

/* ---------- cabeza movil ---------- */
type MovingHeadProps = { position: Vec3; hanging?: boolean };

// Base, horquilla y cabeza inclinada hacia el publico. Colgada, va boca
// abajo bajo la viga.
export function MovingHead({ position, hanging = false }: MovingHeadProps) {
  return (
    <group position={position} rotation={[0, 0, hanging ? Math.PI : 0]}>
      <mesh position={[0, 0.05, 0]}>
        <boxGeometry args={[0.26, 0.1, 0.2]} />
        <meshStandardMaterial {...BLACK} />
      </mesh>
      {[-0.15, 0.15].map((side) => (
        <mesh key={side} position={[side, 0.3, 0]}>
          <boxGeometry args={[0.035, 0.36, 0.1]} />
          <meshStandardMaterial {...BLACK} />
        </mesh>
      ))}
      <group position={[0, 0.42, 0]} rotation={[-0.5, 0, 0]}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.12, 0.13, 0.34, 20]} />
          <meshStandardMaterial {...BLACK} />
        </mesh>
        <mesh position={[0, 0, 0.176]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.095, 0.095, 0.02, 20]} />
          <meshStandardMaterial
            color="#0b1020"
            metalness={0.7}
            roughness={0.2}
          />
        </mesh>
      </group>
    </group>
  );
}

/* ---------- tarima ---------- */
type DeckProps = {
  width: number;
  depth: number;
  /* Altura de la pata; la cubierta suma 12 cm encima. */
  legHeight: number;
  legsX: number[];
  round?: boolean;
  /* Juntas entre modulos de cubierta, en x. */
  seams?: number[];
};

const LEG_BOTTOM = 0.16;

// Tarima de aluminio: cubierta oscura con marco, patas, crucetas y pies
// niveladores.
export function Deck({
  width,
  depth,
  legHeight,
  legsX,
  round = false,
  seams = [],
}: DeckProps) {
  const parts = useMemo(() => {
    const legsZ = [-(depth / 2 - 0.1), depth / 2 - 0.1];
    const legs: Segment[] = [];
    const rods: Segment[] = [];
    const braces: Segment[] = [];
    const low = LEG_BOTTOM + 0.06;
    const high = legHeight - 0.06;
    for (const x of legsX) {
      for (const z of legsZ) {
        legs.push({ a: [x, LEG_BOTTOM, z], b: [x, legHeight, z] });
        rods.push({ a: [x, 0.02, z], b: [x, LEG_BOTTOM + 0.02, z] });
      }
    }
    for (const z of legsZ) {
      for (let i = 0; i < legsX.length - 1; i++) {
        braces.push(
          ...cross([legsX[i], 0, z], [legsX[i + 1], 0, z], low, high),
        );
      }
    }
    for (const x of [legsX[0], legsX[legsX.length - 1]]) {
      braces.push(...cross([x, 0, legsZ[0]], [x, 0, legsZ[1]], low, high));
    }
    return { legs, rods, braces, legsZ };
  }, [depth, legHeight, legsX]);
  const top = legHeight + 0.06;
  return (
    <group>
      <mesh position={[0, top, 0]}>
        <boxGeometry args={[width, 0.12, depth]} />
        <meshStandardMaterial
          color="#232427"
          metalness={0.2}
          roughness={0.85}
        />
      </mesh>
      {seams.map((x) => (
        <mesh key={x} position={[x, top + 0.061, 0]}>
          <boxGeometry args={[0.02, 0.004, depth]} />
          <meshStandardMaterial color="#0c0d0f" roughness={0.9} />
        </mesh>
      ))}
      {[-1, 1].map((side) => (
        <mesh key={side} position={[0, top, side * (depth / 2 + 0.03)]}>
          <boxGeometry args={[width + 0.12, 0.14, 0.08]} />
          <meshStandardMaterial {...ALUMINUM} />
        </mesh>
      ))}
      {[-1, 1].map((side) => (
        <mesh key={side} position={[side * (width / 2 + 0.02), top, 0]}>
          <boxGeometry args={[0.08, 0.14, depth + 0.12]} />
          <meshStandardMaterial {...ALUMINUM} />
        </mesh>
      ))}
      <Bars
        segments={parts.legs}
        radius={0.04}
        material={ALUMINUM}
        square={!round}
      />
      <Bars segments={parts.braces} radius={0.012} material={ALUMINUM} />
      <Bars segments={parts.rods} radius={0.02} material={ALUMINUM} />
      <Instances limit={legsX.length * 2}>
        <cylinderGeometry args={[0.09, 0.1, 0.03, 20]} />
        <meshStandardMaterial {...BLACK} />
        {legsX.flatMap((x) =>
          parts.legsZ.map((z) => (
            <Instance key={`${x},${z}`} position={[x, 0.015, z]} />
          )),
        )}
      </Instances>
    </group>
  );
}

/* ---------- resplandor, luces y camara ---------- */
type GlowProps = { position: Vec3; size: [number, number]; opacity?: number };

export function FloorGlow({ position, size, opacity = 1 }: GlowProps) {
  const glow = useMemo(makeGlowTexture, []);
  return (
    <mesh position={position} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={size} />
      <meshBasicMaterial
        map={glow}
        transparent
        opacity={opacity}
        depthWrite={false}
      />
    </mesh>
  );
}

type StudioProps = {
  target: Vec3;
  minDistance: number;
  maxDistance: number;
};

// Luz de estudio por entorno (sin descargas), luces base y orbita limitada.
export function Studio({ target, minDistance, maxDistance }: StudioProps) {
  return (
    <>
      <ambientLight intensity={0.25} />
      <directionalLight position={[6, 10, 6]} intensity={1.8} />
      <directionalLight position={[-8, 6, -4]} intensity={0.45} />
      <Environment resolution={128} frames={1} environmentIntensity={1.25}>
        <color attach="background" args={["#d6d8dd"]} />
        <Lightformer
          form="rect"
          intensity={2.4}
          position={[0, 10, 0]}
          rotation-x={Math.PI / 2}
          scale={[16, 16, 1]}
        />
        <Lightformer
          form="rect"
          intensity={1.4}
          position={[-9, 4, 9]}
          rotation-y={Math.PI / 4}
          scale={[9, 7, 1]}
        />
        <Lightformer
          form="rect"
          intensity={0.9}
          position={[9, 3, 7]}
          rotation-y={-Math.PI / 4}
          scale={[7, 7, 1]}
        />
      </Environment>
      <OrbitControls
        makeDefault
        target={target}
        enablePan={false}
        enableDamping
        minDistance={minDistance}
        maxDistance={maxDistance}
        minPolarAngle={0.85}
        maxPolarAngle={1.5}
      />
    </>
  );
}
