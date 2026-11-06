import * as THREE from "three";

/* Paisaje al atardecer generado por codigo para las pantallas del circuito
   cerrado: cielo degradado, sol, estrellas, montanas en capas y agua con el
   reflejo. Sin descargas. */

// Perfil de una cordillera: suma de senos, determinista.
function ridge(x: number, seed: number, amplitude: number) {
  return (
    (Math.sin(x * 2.1 + seed) * 0.5 +
      Math.sin(x * 5.3 + seed * 1.7) * 0.25 +
      Math.sin(x * 11.7 + seed * 0.4) * 0.12) *
    amplitude
  );
}

// El paisaje se dibuja una vez por proporcion y se reutiliza.
const LANDSCAPE_CACHE = new Map<string, THREE.CanvasTexture>();

export function makeLandscapeTexture(aspect: number) {
  const key = aspect.toFixed(3);
  const hit = LANDSCAPE_CACHE.get(key);
  if (hit) return hit;
  const texture = buildLandscapeTexture(aspect);
  LANDSCAPE_CACHE.set(key, texture);
  return texture;
}

function buildLandscapeTexture(aspect: number) {
  const width = 1600;
  const height = Math.round(width / aspect);
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  if (context) {
    const horizon = height * 0.66;

    // Cielo: noche arriba, brasa en el horizonte.
    const sky = context.createLinearGradient(0, 0, 0, horizon);
    sky.addColorStop(0, "#070d24");
    sky.addColorStop(0.45, "#2a2358");
    sky.addColorStop(0.8, "#8a4a6a");
    sky.addColorStop(1, "#e9955c");
    context.fillStyle = sky;
    context.fillRect(0, 0, width, horizon);

    // Estrellas, mas densas arriba.
    for (let i = 0; i < 160; i++) {
      const x = ((i * 977) % width) + ((i * 13) % 7);
      const y = ((i * 613) % Math.round(horizon * 0.55)) + 4;
      const alpha = 0.25 + ((i * 31) % 60) / 100;
      context.fillStyle = `rgba(255,255,255,${alpha.toFixed(2)})`;
      context.fillRect(x, y, i % 3 === 0 ? 2 : 1, i % 3 === 0 ? 2 : 1);
    }

    // Sol con halo.
    const sunX = width * 0.64;
    const sunY = horizon - height * 0.04;
    const halo = context.createRadialGradient(
      sunX,
      sunY,
      0,
      sunX,
      sunY,
      height * 0.34,
    );
    halo.addColorStop(0, "rgba(255,214,150,0.9)");
    halo.addColorStop(0.18, "rgba(255,170,110,0.45)");
    halo.addColorStop(1, "rgba(255,150,100,0)");
    context.fillStyle = halo;
    context.fillRect(0, 0, width, horizon);
    context.fillStyle = "#ffe4b8";
    context.beginPath();
    context.arc(sunX, sunY, height * 0.05, 0, Math.PI * 2);
    context.fill();

    // Montanas: tres capas, de lejos (claras) a cerca (oscuras).
    const layers: [number, number, number, string, string][] = [
      [0.3, 0.16, 1, "#4a3568", "#2a1f45"],
      [0.22, 0.13, 2, "#241b3a", "#150f26"],
      [0.12, 0.1, 3, "#100b1c", "#07050f"],
    ];
    for (const [base, amplitude, seed, top, bottom] of layers) {
      const gradient = context.createLinearGradient(
        0,
        horizon - height * (base + amplitude),
        0,
        horizon,
      );
      gradient.addColorStop(0, top);
      gradient.addColorStop(1, bottom);
      context.fillStyle = gradient;
      context.beginPath();
      context.moveTo(0, horizon);
      for (let x = 0; x <= width; x += 8) {
        const y =
          horizon - height * (base + ridge((x / width) * 6, seed, amplitude));
        context.lineTo(x, y);
      }
      context.lineTo(width, horizon);
      context.closePath();
      context.fill();
    }

    // Agua: reflejo invertido y apagado del cielo, con destello del sol.
    const water = context.createLinearGradient(0, horizon, 0, height);
    water.addColorStop(0, "#5a3552");
    water.addColorStop(0.35, "#1c1636");
    water.addColorStop(1, "#080a18");
    context.fillStyle = water;
    context.fillRect(0, horizon, width, height - horizon);
    const glare = context.createLinearGradient(0, horizon, 0, height);
    glare.addColorStop(0, "rgba(255,190,130,0.55)");
    glare.addColorStop(0.5, "rgba(255,170,120,0.12)");
    glare.addColorStop(1, "rgba(255,170,120,0)");
    context.fillStyle = glare;
    for (let y = horizon; y < height; y += 6) {
      const spread = ((y - horizon) / (height - horizon)) * width * 0.16 + 16;
      const wobble = Math.sin(y * 0.35) * 10;
      context.fillRect(sunX - spread / 2 + wobble, y, spread, 3);
    }
    // Brillos horizontales finos sobre el agua.
    context.fillStyle = "rgba(255,255,255,0.06)";
    for (let i = 0; i < 40; i++) {
      const y = horizon + ((i * 131) % (height - horizon));
      const x = (i * 397) % width;
      context.fillRect(x, y, 60 + ((i * 47) % 140), 1);
    }

    // Vineta suave.
    const vignette = context.createRadialGradient(
      width / 2,
      height / 2,
      height * 0.3,
      width / 2,
      height / 2,
      width * 0.75,
    );
    vignette.addColorStop(0, "rgba(0,0,0,0)");
    vignette.addColorStop(1, "rgba(0,0,0,0.45)");
    context.fillStyle = vignette;
    context.fillRect(0, 0, width, height);
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;
  return texture;
}
