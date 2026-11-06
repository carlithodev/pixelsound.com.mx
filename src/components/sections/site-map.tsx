"use client";

import { useEffect, useRef } from "react";
// La hoja de Leaflet entra como estilo global: si se importa desde el modulo
// CSS, Next le renombra las clases y el mapa se arma mal.
import "leaflet/dist/leaflet.css";
import styles from "./site-map.module.css";

// Ubicacion del negocio. El mapa y la chincheta salen de aqui.
const PUNTO: [number, number] = [29.0948359, -110.9583663];
const ZOOM = 16;

// Mapa propio en vez del iframe de Google: solo asi la chincheta queda
// clavada en la coordenada y acompana al mapa al arrastrar o hacer zoom.
// Las teselas son las de OpenStreetMap, que no piden llave; el tono oscuro
// se lo da un filtro sobre la capa (ver el CSS). Leaflet se carga cuando la
// seccion se acerca a la pantalla, no antes.
export function SiteMap() {
  const caja = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const nodo = caja.current;
    if (!nodo) return;

    let mapa: { remove: () => void } | null = null;
    let limpiar: (() => void) | null = null;
    let cancelado = false;

    const montar = async () => {
      const L = (await import("leaflet")).default;
      if (cancelado || !caja.current) return;

      const instancia = L.map(caja.current, {
        center: PUNTO,
        zoom: ZOOM,
        zoomControl: false,
        // La rueda del raton sigue siendo para la pagina; el zoom va en los
        // botones o con dos dedos.
        scrollWheelZoom: false,
        attributionControl: true,
      });
      mapa = instancia;

      L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      }).addTo(instancia);

      // Arriba a la derecha: abajo va la tarjeta de la direccion. En
      // telefono se pasan a la izquierda, donde no los tapa la pila de
      // botones flotantes.
      const estrecho = window.matchMedia("(max-width: 760px)").matches;
      L.control
        .zoom({ position: estrecho ? "topleft" : "topright" })
        .addTo(instancia);
      instancia.attributionControl.setPrefix("");

      // La chincheta es HTML: el mismo disco con el logo de antes, ahora
      // anclado a la coordenada.
      const chincheta = L.divIcon({
        className: styles.iconoVacio,
        // La copia de 160px, no el original: el marcador mide 38px de ancho y
        // el PNG de partida pesa 231KB, que se bajaban en cada visita a la
        // portada solo para pintar este icono.
        html: `<span class="${styles.pin}"><img src="/images/logopixelsaund-160.webp" alt="" width="38" height="22" /></span>`,
        iconSize: [62, 62],
        iconAnchor: [31, 68],
      });
      // Sin cursor: la chincheta no roba el arrastre ni tapa los botones.
      L.marker(PUNTO, {
        icon: chincheta,
        interactive: false,
        keyboard: false,
      }).addTo(instancia);

      // La seccion se pinta en diferido (content-visibility), asi que al
      // crear el mapa la caja puede medir cero. Se le vuelve a medir en
      // cuanto tiene tamano y cada vez que cambia.
      const medir = () => instancia.invalidateSize({ animate: false });
      requestAnimationFrame(medir);
      const cinta = new ResizeObserver(medir);
      cinta.observe(caja.current);
      limpiar = () => cinta.disconnect();
    };

    // Solo se carga si el usuario llega hasta aqui, y el armado espera a que
    // el navegador tenga un hueco: montar Leaflet a media rueda costaba un
    // tiron de ~300ms.
    const enHueco = (tarea: () => void) => {
      const conIdle = window as typeof window & {
        requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => void;
      };
      if (conIdle.requestIdleCallback)
        conIdle.requestIdleCallback(tarea, { timeout: 1200 });
      else window.setTimeout(tarea, 200);
    };

    const observador = new IntersectionObserver(
      (entradas) => {
        if (!entradas.some((e) => e.isIntersecting)) return;
        observador.disconnect();
        enHueco(() => void montar());
      },
      { rootMargin: "400px" },
    );
    observador.observe(nodo);

    return () => {
      cancelado = true;
      observador.disconnect();
      limpiar?.();
      mapa?.remove();
    };
  }, []);

  return <div ref={caja} className={styles.lienzo} />;
}
