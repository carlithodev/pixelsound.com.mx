"use client";

import { useRouter } from "next/navigation";
import { type ReactNode, useEffect, useRef } from "react";
import styles from "./home-services.module.css";

type Props = {
  /* Nombre del grupo, para las etiquetas de las flechas. */
  titulo: string;
  /* Duracion de una vuelta completa, en segundos. */
  duracion: number;
  /* Lo que avanza la pista por tarjeta, en segundos de animacion. */
  paso: number;
  children: ReactNode;
};

// Al pasar el cursor la pista no se clava: baja a paso lento con una rampa,
// para que la tarjeta no se detenga en seco bajo el puntero. Se hace con la
// velocidad de la propia animacion (playbackRate), no cambiando la duracion:
// asi no da un salto al cambiar de ritmo.
const RITMO_LENTO = 0.1;
const RAMPA = 420;

// Un toque se considera valido si el dedo o el raton casi no se movieron.
const TOLERANCIA = 12;

// Antes de decidir si el gesto es para la pista o para la pagina, se esperan
// unos pixeles: con menos, cualquier temblor del dedo cuenta como arrastre.
const UMBRAL_EJE = 8;

// Lo que dura el deslizamiento de una flecha.
const DESLIZ = 560;

export function ServiceTrack({ titulo, duracion, paso, children }: Props) {
  const pista = useRef<HTMLDivElement>(null);
  const marco = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const saltar = useRef<(direccion: 1 | -1) => void>(() => {});

  useEffect(() => {
    const el = pista.current;
    if (!el) return;
    const quieto = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    let frame = 0;
    const animacion = () => el.getAnimations()[0];
    const total = duracion * 1000;

    // La animacion es infinita: sumarle o restarle vueltas enteras deja el
    // mismo fotograma, y asi el reloj nunca se va por debajo de cero.
    const envolver = (t: number) => ((t % total) + total) % total;

    const rampa = (objetivo: number) => {
      const anim = animacion();
      if (!anim) return;
      const inicio = anim.playbackRate;
      const arranque = performance.now();
      const paso = (ahora: number) => {
        const t = Math.min(1, (ahora - arranque) / RAMPA);
        const suave = t * t * (3 - 2 * t);
        anim.playbackRate = inicio + (objetivo - inicio) * suave;
        frame = t < 1 ? window.requestAnimationFrame(paso) : 0;
      };
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(paso);
    };

    const lento = () => !quieto && rampa(RITMO_LENTO);
    const normal = () => !quieto && rampa(1);

    // ---- Flechas ----
    // Sin movimiento la pista es una barra que se recorre a mano, asi que la
    // flecha desplaza; con movimiento, adelanta el reloj de la animacion.
    saltar.current = (direccion: 1 | -1) => {
      if (quieto) {
        const caja = marco.current?.querySelector("li");
        const ancho = caja ? caja.getBoundingClientRect().width + 18 : 320;
        el.parentElement?.scrollBy({
          left: direccion * ancho,
          behavior: "smooth",
        });
        return;
      }
      const anim = animacion();
      if (!anim) return;
      const desde = envolver(Number(anim.currentTime ?? 0));
      const hasta = desde + direccion * paso * 1000;
      anim.playbackRate = 0;
      const arranque = performance.now();
      const avanzar = (ahora: number) => {
        const t = Math.min(1, (ahora - arranque) / DESLIZ);
        const suave = 1 - (1 - t) ** 3;
        anim.currentTime = envolver(desde + (hasta - desde) * suave);
        if (t < 1) {
          frame = window.requestAnimationFrame(avanzar);
          return;
        }
        frame = 0;
        normal();
      };
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(avanzar);
    };

    // ---- Arrastre con el dedo y toque a prueba de pista en movimiento ----
    // El navegador solo dispara "click" si soltaste sobre el mismo elemento
    // donde presionaste. Con las tarjetas desplazandose, a veces la tarjeta
    // se corre bajo el dedo y el toque se pierde. Aqui se congela la pista al
    // presionar y, si el puntero no se movio, se navega a mano.
    type Gesto = {
      destino: string | null;
      x: number;
      y: number;
      /* Reloj de la animacion al empezar el gesto. */
      base: number;
      /* Hacia donde va el gesto: aun sin decidir, la pista o la pagina. */
      eje: "?" | "x" | "y";
      puntero: number;
    };
    let gesto: Gesto | null = null;
    let navegado = 0;

    const alPresionar = (evento: PointerEvent) => {
      // Clic con boton secundario, o con Ctrl/Cmd para abrir en otra pestana:
      // eso lo resuelve el navegador, no nosotros.
      if (
        evento.button !== 0 ||
        evento.ctrlKey ||
        evento.metaKey ||
        evento.shiftKey
      ) {
        return;
      }
      const enlace = (evento.target as HTMLElement | null)?.closest("a");
      const anim = animacion();
      gesto = {
        destino: enlace?.getAttribute("href") ?? null,
        x: evento.clientX,
        y: evento.clientY,
        base: envolver(Number(anim?.currentTime ?? 0)),
        eje: "?",
        puntero: evento.pointerId,
      };
      if (anim && !quieto) {
        window.cancelAnimationFrame(frame);
        anim.playbackRate = 0;
      }
    };

    const alMover = (evento: PointerEvent) => {
      if (!gesto || evento.pointerId !== gesto.puntero) return;
      const dx = evento.clientX - gesto.x;
      const dy = evento.clientY - gesto.y;

      if (gesto.eje === "?") {
        if (Math.hypot(dx, dy) < UMBRAL_EJE) return;
        // Gesto vertical: es para bajar la pagina. Se suelta la pista.
        if (Math.abs(dy) > Math.abs(dx)) {
          gesto = null;
          normal();
          return;
        }
        gesto.eje = "x";
        el.setPointerCapture?.(evento.pointerId);
      }
      if (gesto.eje !== "x" || quieto) return;

      const anim = animacion();
      if (!anim) return;
      // La mitad de la pista tarda una vuelta entera en pasar, asi que cada
      // pixel de dedo vale ese tanto de reloj.
      const mitad = el.offsetWidth / 2;
      if (!mitad) return;
      anim.currentTime = envolver(gesto.base - (dx / mitad) * total);
    };

    const alSoltar = (evento: PointerEvent) => {
      const marca = gesto;
      gesto = null;
      if (!marca || evento.pointerId !== marca.puntero) return;
      el.releasePointerCapture?.(evento.pointerId);
      const movio = Math.hypot(
        evento.clientX - marca.x,
        evento.clientY - marca.y,
      );
      // Se movio: fue un arrastre, no un toque. Solo se reanuda.
      if (movio > TOLERANCIA || !marca.destino) {
        normal();
        return;
      }
      navegado = performance.now();
      router.push(marca.destino);
    };

    const alCancelar = () => {
      gesto = null;
      normal();
    };

    // Si el navegador si alcanzo a disparar su click, se descarta para no
    // navegar dos veces.
    const alHacerClick = (evento: MouseEvent) => {
      if (performance.now() - navegado > 700) return;
      const enlace = (evento.target as HTMLElement | null)?.closest("a");
      if (!enlace) return;
      evento.preventDefault();
    };

    el.addEventListener("mouseenter", lento);
    el.addEventListener("mouseleave", normal);
    el.addEventListener("focusin", lento);
    el.addEventListener("focusout", normal);
    el.addEventListener("pointerdown", alPresionar);
    el.addEventListener("pointermove", alMover);
    el.addEventListener("pointerup", alSoltar);
    el.addEventListener("pointercancel", alCancelar);
    el.addEventListener("click", alHacerClick, true);

    return () => {
      window.cancelAnimationFrame(frame);
      el.removeEventListener("mouseenter", lento);
      el.removeEventListener("mouseleave", normal);
      el.removeEventListener("focusin", lento);
      el.removeEventListener("focusout", normal);
      el.removeEventListener("pointerdown", alPresionar);
      el.removeEventListener("pointermove", alMover);
      el.removeEventListener("pointerup", alSoltar);
      el.removeEventListener("pointercancel", alCancelar);
      el.removeEventListener("click", alHacerClick, true);
    };
  }, [router, duracion, paso]);

  return (
    <div ref={marco} className={styles.carrusel}>
      <div className={styles.pista}>
        <div
          ref={pista}
          className={styles.track}
          style={{ animationDuration: `${duracion}s` }}
        >
          {children}
        </div>
      </div>

      {/* De 760px para abajo no se pintan: ahi la pista se mueve con el dedo. */}
      <button
        type="button"
        className={`${styles.flecha} ${styles.flechaIzquierda}`}
        aria-label={`Ver los apartados anteriores de ${titulo}`}
        onClick={() => saltar.current(-1)}
      >
        <Punta />
      </button>
      <button
        type="button"
        className={`${styles.flecha} ${styles.flechaDerecha}`}
        aria-label={`Ver los siguientes apartados de ${titulo}`}
        onClick={() => saltar.current(1)}
      >
        <Punta />
      </button>
    </div>
  );
}

function Punta() {
  return (
    <svg
      width="9"
      height="15"
      viewBox="0 0 9 15"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M7.5 1.5 1.5 7.5l6 6"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
