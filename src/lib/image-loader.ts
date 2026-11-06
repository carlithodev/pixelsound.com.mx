/* Cargador de imagenes del sitio exportado. En Apache no hay servidor que
   convierta imagenes al vuelo: las variantes se generan en el build
   (scripts/generar-imagenes.mjs) y aqui solo se arma la direccion.

   /images/foo.jpg pedida a 768 -> /images/foo-768.webp

   El catalogo dice que anchos existen de cada foto, para no pedir uno que
   no se genero (nunca se agrandan las imagenes). */

import catalogo from "./anchos-imagenes.json";

type Peticion = {
  src: string;
  width: number;
  quality?: number;
};

const ANCHOS = catalogo as Record<string, number[]>;

export default function cargadorDeImagenes({ src, width }: Peticion): string {
  // Vectores, animaciones y cualquier cosa de fuera se sirven tal cual.
  if (!src.startsWith("/") || !/\.(jpe?g|png)$/i.test(src)) return src;

  const disponibles = ANCHOS[src.replace(/^\//, "")];
  if (!disponibles || disponibles.length === 0) return src;

  const elegido =
    disponibles.find((ancho) => ancho >= width) ??
    disponibles[disponibles.length - 1];
  return `${src.replace(/\.(jpe?g|png)$/i, "")}-${elegido}.webp`;
}
