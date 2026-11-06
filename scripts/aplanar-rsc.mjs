// Al exportar, Next guarda los datos de prefetch de las rutas anidadas en
// carpetas ("__next.servicios/experiencias/__PAGE__.txt") pero el navegador
// los pide con puntos ("__next.servicios.experiencias.__PAGE__.txt"). En un
// servidor estatico eso da 404 en cada prefetch y la navegacion entre
// paginas se cae a recarga completa.
//
// Este script corre despues del build y deja una copia con el nombre plano
// que el navegador si encuentra.

import { copyFile, readdir } from "node:fs/promises";
import path from "node:path";

const SALIDA = path.join(process.cwd(), "out");

async function planos(directorio) {
  const copias = [];
  for (const entrada of await readdir(directorio, { withFileTypes: true })) {
    const ruta = path.join(directorio, entrada.name);
    if (!entrada.isDirectory()) continue;
    if (entrada.name.startsWith("__next.")) {
      copias.push(...(await archivosDe(ruta, directorio, entrada.name)));
    } else {
      copias.push(...(await planos(ruta)));
    }
  }
  return copias;
}

// Todo lo que cuelga de una carpeta __next.* se copia al nivel de arriba con
// los tramos unidos por puntos.
async function archivosDe(directorio, destinoBase, prefijo) {
  const copias = [];
  for (const entrada of await readdir(directorio, { withFileTypes: true })) {
    const ruta = path.join(directorio, entrada.name);
    if (entrada.isDirectory()) {
      copias.push(
        ...(await archivosDe(ruta, destinoBase, `${prefijo}.${entrada.name}`)),
      );
    } else {
      copias.push([ruta, path.join(destinoBase, `${prefijo}.${entrada.name}`)]);
    }
  }
  return copias;
}

const copias = await planos(SALIDA);
for (const [origen, destino] of copias) {
  await copyFile(origen, destino);
}
console.log(`prefetch: ${copias.length} archivos con nombre plano`);
