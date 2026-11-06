"use client";

import { useEffect } from "react";

/* Safari no hace caso al atributo "media" de <source> dentro de <video>: la
   consulta puede dar verdadera y aun asi se queda con la ultima fuente de la
   lista. Escribiendo la copia pesada primero, con su consulta, y la ligera al
   final sin ninguna, cada navegador acaba donde debe:

     - Chrome, Edge y Firefox respetan la consulta y eligen segun el ancho.
     - Safari la ignora y se queda con la ultima, que es la ligera.

   Asi el telefono pide el archivo correcto ya desde el HTML, sin esperar a
   que corra JavaScript, que es lo que antes le costaba casi medio segundo.
   El unico que sale perdiendo es Safari de escritorio, que tambien se lleva
   la ligera; a ese lo corrige el gancho de abajo, ya con la pagina en pie y
   sin prisa, porque en un escritorio el peso no aprieta. */

export function useAscensoEnEscritorio(
  ref: React.RefObject<HTMLVideoElement | null>,
  grande: string,
  chico: string | undefined,
  consultaEscritorio: string,
) {
  useEffect(() => {
    const video = ref.current;
    if (!video || !chico) return;
    if (!window.matchMedia(consultaEscritorio).matches) return;
    // Ya tiene la buena: no hay nada que hacer.
    if (!video.currentSrc.endsWith(chico)) return;

    const seguirDonde = video.currentTime;
    const corria = !video.paused;
    video.src = grande;
    video.load();
    video.currentTime = seguirDonde;
    if (corria) video.play().catch(() => {});
  }, [ref, grande, chico, consultaEscritorio]);
}
