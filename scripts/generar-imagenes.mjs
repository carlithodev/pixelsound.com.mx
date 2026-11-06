// Genera las variantes WebP de cada imagen de public/images. En el hosting
// de Apache no hay optimizador de imagenes, asi que el trabajo se hace aqui,
// en el build, y el cargador (src/lib/image-loader.ts) apunta a estos
// archivos usando el catalogo de anchos que este script escribe.
//
// Corre solo antes de cada build (script "prebuild"). Solo rehace lo que
// cambio: compara tamano y fecha del archivo original.

import { createHash } from "node:crypto";
import { existsSync } from "node:fs";
import {
  mkdir,
  readdir,
  readFile,
  stat,
  unlink,
  writeFile,
} from "node:fs/promises";
import path from "node:path";
import { format } from "prettier";
import sharp from "sharp";

const RAIZ = path.join(process.cwd(), "public", "images");
const CACHE = path.join(process.cwd(), "scripts", ".cache-imagenes.json");
const CATALOGO = path.join(process.cwd(), "src", "lib", "anchos-imagenes.json");

// Mismos anchos que declara next.config.ts (deviceSizes + imageSizes).
const ANCHOS = [96, 160, 256, 384, 480, 768, 1080, 1440, 1920];

const ORIGEN = /\.(jpe?g|png)$/i;
const VARIANTE = /-\d+\.webp$/i;

async function archivos(directorio) {
  const encontrados = [];
  for (const entrada of await readdir(directorio, { withFileTypes: true })) {
    const ruta = path.join(directorio, entrada.name);
    if (entrada.isDirectory()) encontrados.push(...(await archivos(ruta)));
    else if (entrada.isFile()) encontrados.push(ruta);
  }
  return encontrados;
}

const huella = async (ruta) => {
  const info = await stat(ruta);
  return createHash("sha1")
    .update(`${info.size}:${Math.round(info.mtimeMs)}`)
    .digest("hex");
};

const todos = await archivos(RAIZ);
const originales = todos.filter((r) => ORIGEN.test(r) && !VARIANTE.test(r));

const cachePrevia = existsSync(CACHE)
  ? JSON.parse(await readFile(CACHE, "utf8"))
  : {};
const cache = {};
const catalogo = {};
const esperadas = new Set();

let generadas = 0;
let reutilizadas = 0;

for (const origen of originales) {
  const clave = path
    .relative(path.join(process.cwd(), "public"), origen)
    .split(path.sep)
    .join("/");
  const sello = await huella(origen);
  cache[clave] = sello;

  const meta = await sharp(origen).metadata();
  const natural = meta.width ?? ANCHOS.at(-1);
  // Nunca se agranda una foto: se generan los anchos menores que el suyo y,
  // si su tamano real cae entre dos, tambien el suyo. Asi no se pierde
  // nitidez en pantallas de mucha densidad ni se duplican archivos iguales.
  const anchos = ANCHOS.filter((a) => a < natural);
  if (natural <= ANCHOS.at(-1)) anchos.push(natural);
  else anchos.push(ANCHOS.at(-1));

  catalogo[clave] = anchos;
  const base = origen.replace(ORIGEN, "");
  // Un PNG con transparencia se guarda sin perdida: en los logos, la
  // compresion con perdida ensucia los bordes.
  const conAlfa = meta.hasAlpha === true;

  for (const ancho of anchos) {
    const destino = `${base}-${ancho}.webp`;
    esperadas.add(destino);
    if (cachePrevia[clave] === sello && existsSync(destino)) {
      reutilizadas++;
      continue;
    }
    await mkdir(path.dirname(destino), { recursive: true });
    await sharp(origen)
      .resize({ width: ancho, withoutEnlargement: true })
      // 76 con esfuerzo 6 en vez de 82 con 5: pesa una quinta parte menos y
      // en una comparacion al 100% sobre el peor caso (la rejilla de un
      // bafle, patron fino y repetido) no se distingue una de otra.
      .webp(
        conAlfa ? { lossless: true, effort: 6 } : { quality: 76, effort: 6 },
      )
      .toFile(destino);
    generadas++;
  }
}

// Variantes de imagenes que ya no existen o de anchos que ya no se usan.
let borradas = 0;
for (const ruta of todos) {
  if (!VARIANTE.test(ruta) || esperadas.has(ruta)) continue;
  await unlink(ruta);
  borradas++;
}

await writeFile(CACHE, `${JSON.stringify(cache, null, 2)}\n`);
await writeFile(
  CATALOGO,
  await format(JSON.stringify(catalogo), { parser: "json" }),
);

console.log(
  `imagenes: ${generadas} nuevas, ${reutilizadas} sin cambios, ${borradas} retiradas`,
);
