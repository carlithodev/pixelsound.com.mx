"use client";

import { useMemo } from "react";
import * as THREE from "three";
import {
  BLACK,
  Bars,
  makeGrilleTexture,
  type Segment,
  type Vec3,
} from "./parts";

/* Bocina amplificada sobre tripie: pieza compartida por Audio y Circuito
   cerrado. */

const CAB_W = 0.42;
const CAB_H = 0.66;
const CAB_D = 0.4;
const CAB_BACK_W = 0.3;
const POLE_TOP = 1.72;
const COLLAR_Y = 0.56;
const BRACE_Y = 0.3;
const LEG_REACH = 0.5;
const LEG_ANGLES = [
  Math.PI / 2,
  Math.PI / 2 + (2 * Math.PI) / 3,
  Math.PI / 2 + (4 * Math.PI) / 3,
];

// Patas del tripie, tirantes al centro y tubos, en coordenadas locales.
function buildStand(): { legs: Segment[]; poles: Segment[]; feet: Vec3[] } {
  const legs: Segment[] = [];
  const feet: Vec3[] = [];
  for (const angle of LEG_ANGLES) {
    const foot: Vec3 = [
      Math.cos(angle) * LEG_REACH,
      0.03,
      Math.sin(angle) * LEG_REACH,
    ];
    const top: Vec3 = [0, COLLAR_Y, 0];
    legs.push({ a: top, b: foot });
    legs.push({
      a: [0, BRACE_Y, 0],
      b: [foot[0] / 2, (COLLAR_Y + foot[1]) / 2, foot[2] / 2],
    });
    feet.push(foot);
  }
  const poles: Segment[] = [
    { a: [0, 0.1, 0], b: [0, COLLAR_Y + 0.5, 0] },
    { a: [0, COLLAR_Y + 0.45, 0], b: [0, POLE_TOP, 0] },
  ];
  return { legs, poles, feet };
}

const STAND = buildStand();

// La caja y su rejilla son iguales en todas las bocinas: se arman una vez.
let cabinetGeometry: THREE.ExtrudeGeometry | undefined;
let grilleMap: THREE.Texture | undefined;

// Caja con trasera mas angosta que el frente, extruida a lo alto.
function makeCabinetGeometry() {
  // Planta de la caja; la "y" de la forma acaba siendo -z, asi que el
  // frente (z positivo) se dibuja con y negativa.
  const shape = new THREE.Shape();
  shape.moveTo(-CAB_W / 2, -CAB_D / 2);
  shape.lineTo(CAB_W / 2, -CAB_D / 2);
  shape.lineTo(CAB_BACK_W / 2, CAB_D / 2);
  shape.lineTo(-CAB_BACK_W / 2, CAB_D / 2);
  shape.closePath();
  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth: CAB_H,
    bevelEnabled: true,
    bevelThickness: 0.01,
    bevelSize: 0.01,
    bevelSegments: 2,
  });
  // La extrusion (z) pasa a ser la altura (y), de 0 a CAB_H.
  geometry.rotateX(-Math.PI / 2);
  return geometry;
}

type Props = {
  position: Vec3;
  /* Giro sobre su eje; positivo mira hacia -x. */
  yaw?: number;
};

export function TripodSpeaker({ position, yaw = 0 }: Props) {
  const geometry = useMemo(() => {
    cabinetGeometry ??= makeCabinetGeometry();
    return cabinetGeometry;
  }, []);
  const map = useMemo(() => {
    if (!grilleMap) {
      grilleMap = makeGrilleTexture().clone();
      grilleMap.repeat.set(CAB_W / 0.12, CAB_H / 0.12);
      grilleMap.needsUpdate = true;
    }
    return grilleMap;
  }, []);

  return (
    <group position={position} rotation={[0, yaw, 0]}>
      <Bars segments={STAND.legs} radius={0.014} material={BLACK} />
      <Bars
        segments={STAND.poles.slice(0, 1)}
        radius={0.026}
        material={BLACK}
      />
      <Bars segments={STAND.poles.slice(1)} radius={0.018} material={BLACK} />
      {/* Collarines con perilla: uno en las patas, otro en el tubo. */}
      {[COLLAR_Y, COLLAR_Y + 0.48].map((y) => (
        <group key={y} position={[0, y, 0]}>
          <mesh>
            <cylinderGeometry args={[0.04, 0.04, 0.07, 16]} />
            <meshStandardMaterial {...BLACK} />
          </mesh>
          <mesh position={[0.06, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.014, 0.014, 0.06, 12]} />
            <meshStandardMaterial {...BLACK} />
          </mesh>
        </group>
      ))}
      <mesh position={[0, BRACE_Y, 0]}>
        <cylinderGeometry args={[0.035, 0.035, 0.05, 16]} />
        <meshStandardMaterial {...BLACK} />
      </mesh>
      {STAND.feet.map((foot) => (
        <mesh key={foot.join(",")} position={foot}>
          <cylinderGeometry args={[0.022, 0.026, 0.06, 12]} />
          <meshStandardMaterial {...BLACK} />
        </mesh>
      ))}
      {/* Caja: cuerpo, bisel, rejilla, logotipo y adaptador del tubo. */}
      <group position={[0, POLE_TOP, 0]}>
        <mesh geometry={geometry}>
          <meshStandardMaterial
            color="#1b1c20"
            metalness={0.25}
            roughness={0.6}
          />
        </mesh>
        <mesh position={[0, CAB_H / 2, CAB_D / 2 + 0.003]}>
          <planeGeometry args={[CAB_W - 0.02, CAB_H - 0.02]} />
          <meshStandardMaterial
            color="#26282d"
            metalness={0.3}
            roughness={0.55}
          />
        </mesh>
        <mesh position={[0, CAB_H / 2, CAB_D / 2 + 0.006]}>
          <planeGeometry args={[CAB_W - 0.05, CAB_H - 0.05]} />
          <meshStandardMaterial map={map} metalness={0.3} roughness={0.75} />
        </mesh>
        <mesh
          position={[0, 0.07, CAB_D / 2 + 0.012]}
          rotation={[Math.PI / 2, 0, 0]}
        >
          <cylinderGeometry args={[0.02, 0.02, 0.004, 20]} />
          <meshStandardMaterial
            color="#8d8d94"
            metalness={0.6}
            roughness={0.4}
          />
        </mesh>
        <mesh position={[0, -0.03, 0]}>
          <cylinderGeometry args={[0.035, 0.035, 0.06, 16]} />
          <meshStandardMaterial {...BLACK} />
        </mesh>
      </group>
    </group>
  );
}
